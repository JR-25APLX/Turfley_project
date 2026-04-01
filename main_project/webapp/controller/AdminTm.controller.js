sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminTm", {

        onInit: function () {
            var oModel = this.getOwnerComponent().getModel();

            oModel.refreshSecurityToken(
                function () {
                    console.log("CSRF Token fetched:", oModel.getSecurityToken());
                },
                function () {
                    console.log("CSRF Token fetch failed");
                }
            );

            this._bTableRefreshing = false;
        },
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");

            if (sKey === "Edit") {
                var oTable = this.byId("turfEditTable");
                var oBinding = oTable.getBinding("items");

                if (oBinding) {
                    this._bTableRefreshing = true;
                    console.log("Table refreshing — switches locked");

                    oBinding.refresh();

                    oTable.attachEventOnce("updateFinished", function () {
                        this._bTableRefreshing = false;
                        console.log("Table finished — switches unlocked");
                    }.bind(this));
                }
            }
        },
        onStatusChange: function (oEvent) {

            if (this._bTableRefreshing) {
                console.log("Blocked during refresh");
                return;
            }

            var oSwitch = oEvent.getSource();
            var bState = oEvent.getParameter("state");
            var sNewStatus = bState ? "A" : "D";

            var oContext = oSwitch.getBindingContext();
            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("Turf ID:", sTurfId);

            var sUpdatePath = "/TurfSet('" + sTurfId + "')";
            var oModel = this.getOwnerComponent().getModel();

            MessageBox.confirm(
                "Are you sure you want to " +
                (bState ? "ACTIVATE" : "DISABLE") +
                " this turf?",
                {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {

                            oModel.update(sUpdatePath, {
                                Status: sNewStatus
                            }, {
                                merge: true,

                                success: function () {
                                    console.log("Update success!");
                                    MessageToast.show(
                                        bState
                                            ? "Turf Activated Successfully!"
                                            : "Turf Disabled Successfully!"
                                    );

                                    this._bTableRefreshing = true;

                                    var oTable = this.byId("turfEditTable");
                                    oTable.getBinding("items").refresh();

                                    oTable.attachEventOnce("updateFinished", function () {
                                        this._bTableRefreshing = false;
                                        console.log("Refresh done — unlocked");
                                    }.bind(this));

                                }.bind(this),

                                error: function (oError) {
                                    console.error("Update failed:", oError.responseText);
                                    MessageToast.show("Update Failed! Please try again.");

                                    this._bTableRefreshing = true;
                                    oSwitch.setState(!bState);

                                    setTimeout(function () {
                                        this._bTableRefreshing = false;
                                    }.bind(this), 500);

                                }.bind(this)
                            });

                        } else {

                            this._bTableRefreshing = true;
                            oSwitch.setState(!bState);

                            setTimeout(function () {
                                this._bTableRefreshing = false;
                            }.bind(this), 500);
                        }

                    }.bind(this)
                }
            );
        },
        onEditTurf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("Edit clicked for:", sTurfId);
        },
        onAddSlot: function () {
            debugger;
            this._initSlotModel();

            if (!this._oAddSlotDialog) {
                this._oAddSlotDialog = sap.ui.xmlfragment(
                    this.getView().getId(),
                    "com.applexus.mainproject.fragments.SlotAddition",
                    this
                );
                this.getView().addDependent(this._oAddSlotDialog);
            }
            this._oAddSlotDialog.open();
        },
        _initSlotModel: function () {
            var aSlots = [];
            for (var i = 0; i < 24; i++) {
                var iEnd = (i + 1) % 24;
                aSlots.push({
                    hour:      i,
                    label:     this._getSlotLabel(i),
                    startTime: (i    < 10 ? "0" + i    : "" + i)    + ":00",
                    endTime:   (iEnd < 10 ? "0" + iEnd : "" + iEnd) + ":00",
                    selected:  false
                });
            }
            var oModel = new JSONModel({
                slots:         aSlots,
                selectedCount: 0
            });
            this.getView().setModel(oModel, "slotModel");
        },
        _getSlotLabel: function (iHour) {
            if (iHour === 0)  return "12:00 AM";
            if (iHour < 12)   return iHour + ":00 AM";
            if (iHour === 12) return "12:00 PM";
            return (iHour - 12) + ":00 PM";
        },
        onSlotToggle: function (oEvent) {
            var oCtx   = oEvent.getSource().getBindingContext("slotModel");
            var bState = oEvent.getParameter("pressed");

            oCtx.getModel().setProperty(oCtx.getPath() + "/selected", bState);
            this._updateSlotCount();
        },
        onSelectAllSlots: function () {
            this._setAllSlots(true);
        },
        onClearAllSlots: function () {
            this._setAllSlots(false);
        },

        _setAllSlots: function (bSelected) {
            var oModel = this.getView().getModel("slotModel");
            var aSlots = oModel.getProperty("/slots");
            aSlots.forEach(function (oSlot) { oSlot.selected = bSelected; });
            oModel.setProperty("/slots", aSlots);
            this._updateSlotCount();
        },

        _updateSlotCount: function () {
            var oModel = this.getView().getModel("slotModel");
            var aSlots = oModel.getProperty("/slots");
            var iCount = aSlots.filter(function (s) { return s.selected; }).length;
            oModel.setProperty("/selectedCount", iCount);
        },
        onConfirmSlots: function () {
            var oSlotModel     = this.getView().getModel("slotModel");
            var aSelectedSlots = oSlotModel.getProperty("/slots")
                                    .filter(function (s) { return s.selected; });

            if (aSelectedSlots.length === 0) {
                MessageToast.show("Please select at least one time slot.");
                return;
            }

            var sTurfId = this.getView().getModel("formModel").getProperty("/Turf_Id");

            if (!sTurfId) {
                MessageBox.warning("Please save the Turf record first before adding slots.");
                return;
            }

            var oODataModel = this.getOwnerComponent().getModel();
            var aPromises   = aSelectedSlots.map(function (oSlot) {
                return new Promise(function (resolve, reject) {
                    oODataModel.create("/TurfSlotSet", {   // ← update entity set if needed
                        TurfId:      sTurfId,
                        StartTime:   oSlot.startTime,
                        EndTime:     oSlot.endTime,
                        SlotLabel:   oSlot.label,
                        IsAvailable: true
                    }, {
                        success: resolve,
                        error:   reject
                    });
                });
            });

            sap.ui.core.BusyIndicator.show(0);

            Promise.all(aPromises)
                .then(function () {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show(aSelectedSlots.length + " slot(s) saved successfully!");
                    this._oAddSlotDialog.close();
                }.bind(this))
                .catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var sMsg = (oError && oError.responseText)
                        ? JSON.parse(oError.responseText).error.message.value
                        : "Failed to save slots. Please try again.";
                    MessageBox.error(sMsg);
                });
        },
        onCancelSlots: function () {
            if (this._oAddSlotDialog) {
                this._oAddSlotDialog.close();
            }
        }

    });
});