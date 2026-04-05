sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/VBox"
], function (Controller, MessageBox, MessageToast, JSONModel, Dialog, Button, Input, Label, VBox) {
    "use strict";
 
    return Controller.extend("com.applexus.mainproject.controller.AdminTm", {
 
        onInit: function () {
            this._bTableRefreshing = false;
            this._aSelectedSlots   = [];
 
            this._oTurfModel = new JSONModel({
                Name            : "",
                Location        : "",
                Locationurl     : "",
                Type            : "",
                Owner           : "",
                Price           : "",
                Cuky            : "INR",
                Commission_Perc : ""
            });
 
            this.getView().setModel(this._oTurfModel, "turfModel");
            var oTable = this.byId("turfEditTable");
            if (oTable) {
                oTable.attachUpdateFinished(function () {
                    this._setSwitchStates();
                }.bind(this));
            }
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminTm").attachPatternMatched(
                this._onRouteMatched, this
            );
        },
 
        _onRouteMatched: function () {
            var oTable   = this.byId("turfEditTable");
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                this._bTableRefreshing = true;
                oBinding.refresh();
                console.log("Table refreshed!");
            }
        },
 
        _setSwitchStates: function () {
            this._bTableRefreshing = true;
            var oTable = this.byId("turfEditTable");
            var aItems = oTable.getItems();
 
            aItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext();
                console.log("Row data:", JSON.stringify(oContext.getObject()));
                var sStatus = oItem.getBindingContext().getProperty("Status");
                var oSwitch = oItem.getCells()[7];
                if (oSwitch) {
                    oSwitch.setState(sStatus === "A");
                }
            });
 
            setTimeout(function () {
                this._bTableRefreshing = false;
            }.bind(this), 500);
        },
 
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            if (sKey === "Edit") {
                var oTable   = this.byId("turfEditTable");
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    this._bTableRefreshing = true;
                    oBinding.refresh();
                    console.log("Table refreshed on tab select!");
                }
            }
            if (sKey === "Approvals") {
                var oPendingTable   = this.byId("pendingTurfTable");
                var oPendingBinding = oPendingTable.getBinding("items");
                if (oPendingBinding) {
                    oPendingBinding.refresh();
                }
            }
        },
 
        onStatusChange: function (oEvent) {
            if (this._bTableRefreshing) { return; }
 
            var oSwitch    = oEvent.getSource();
            var bState     = oEvent.getParameter("state");
            var sNewStatus = bState ? "A" : "D";
            var sTurfId    = oSwitch.getBindingContext().getProperty("Id");
            var sPath      = "/TurfSet('" + sTurfId + "')";
            var oModel     = this.getOwnerComponent().getModel();
 
            MessageBox.confirm(
                "Are you sure you want to " + (bState ? "ACTIVATE" : "DISABLE") + " this turf?",
                {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            oModel.update(sPath, { Status: sNewStatus }, {
                                merge: true,
                                success: function () {
                                    MessageToast.show(bState ? "Turf Activated!" : "Turf Disabled!");
                                },
                                error: function () {
                                    MessageToast.show("Update Failed!");
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
            var sTurfId = oEvent.getSource()
                                .getBindingContext()
                                .getProperty("Id");
            console.log("Edit Turf:", sTurfId);
 
            this.getOwnerComponent().getRouter().navTo("RouteAdminEditTurf", {
                turfId: sTurfId
            });
        },
 
        onApproveTurf: function (oEvent) {
            var sTurfId = oEvent.getSource().getBindingContext().getProperty("Id");
            this._sPendingApproveTurfId = sTurfId;

            var oDialog = this._getApprovalDialog();
            this._oCommissionInput.setValue("");
            this._oApproveBtn.setEnabled(false);
            oDialog.open();
        },

        _getApprovalDialog: function () {
            if (this._oApprovalDialog) {
                return this._oApprovalDialog;
            }

            this._oCommissionInput = new Input({
                placeholder : "e.g. 10",
                type        : "Number",
                liveChange  : function (oEvent) {
                    var sVal = oEvent.getParameter("value").trim();
                    this._oApproveBtn.setEnabled(sVal !== "" && !isNaN(sVal) && parseFloat(sVal) >= 0);
                }.bind(this)
            });

            this._oApproveBtn = new Button({
                text    : "Approve",
                type    : "Accept",
                enabled : false,
                press   : this._onConfirmApproval.bind(this)
            });

            this._oApprovalDialog = new Dialog({
                title           : "Approve Turf",
                content         : [
                    new VBox({
                        items : [
                            new Label({ text: "Commission Percent", design: "Bold" }),
                            this._oCommissionInput
                        ]
                    }).addStyleClass("sapUiSmallMargin")
                ],
                beginButton     : this._oApproveBtn,
                endButton       : new Button({
                    text  : "Cancel",
                    press : function () {
                        this._oApprovalDialog.close();
                    }.bind(this)
                })
            });

            this.getView().addDependent(this._oApprovalDialog);
            return this._oApprovalDialog;
        },

        _onConfirmApproval: function () {
            var sCommission = this._oCommissionInput.getValue().trim();
            var sTurfId     = this._sPendingApproveTurfId;
            var sPath       = "/TurfSet('" + sTurfId + "')";
            var oModel      = this.getOwnerComponent().getModel();

            oModel.update(sPath, {
                Status            : "A",
                CommissionPercent : sCommission
            }, {
                merge   : true,
                success : function () {
                    MessageToast.show("Turf approved successfully!");
                    this._oApprovalDialog.close();
                    var oPendingBinding = this.byId("pendingTurfTable").getBinding("items");
                    if (oPendingBinding) { oPendingBinding.refresh(); }
                }.bind(this),
                error   : function (oError) {
                    var sMessage = "Approval failed.";
                    try {
                        sMessage = JSON.parse(oError.responseText).error.message.value;
                    } catch (e) {
                        sMessage = oError.message || sMessage;
                    }
                    MessageBox.error(sMessage);
                }
            });
        },


        onAddSlots: function () {
            if (!this._oDialog) {
                this.loadFragment({
                    name: "com.applexus.mainproject.fragments.EditSlot"
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(this._oDialog);
                    this._restoreSelectedSlots();
                    this._oDialog.open();
                }.bind(this)).catch(function (err) {
                    console.error("Fragment load failed:", err);
                });
            } else {
                this._restoreSelectedSlots();
                this._oDialog.open();
            }
        },
 
        _restoreSelectedSlots: function () {
            var aSelected    = this._aSelectedSlots || [];
            var aSelectedIds = aSelected.map(function (s) { return s.SlotId; });
 
            var oVBox  = this._oDialog.getContent()[0];
            var oPanel = oVBox.getItems()[1];
            var oGrid  = oPanel.getContent()[0];
 
            oGrid.getContent().forEach(function (oButton) {
                var iHour    = parseInt(oButton.data("startHour"));
                var iSlotNum = iHour + 1;
                var sSlotId  = "S" + (iSlotNum < 10 ? "00" + iSlotNum : "0" + iSlotNum);
 
                oButton.setType(
                    aSelectedIds.indexOf(sSlotId) !== -1 ? "Emphasized" : "Default"
                );
            });
        },
 
        onSlotPress: function (oEvent) {
            var oButton = oEvent.getSource();
            oButton.setType(
                oButton.getType() === "Default" ? "Emphasized" : "Default"
            );
        },
 
        onConfirmSlots: function () {
            var aSelectedSlots = [];
 
            var oVBox  = this._oDialog.getContent()[0];
            var oPanel = oVBox.getItems()[1];
            var oGrid  = oPanel.getContent()[0];
 
            oGrid.getContent().forEach(function (oButton) {
                if (oButton.getType() === "Emphasized") {
                    var iHour    = parseInt(oButton.data("startHour"));
                    var iEnd     = iHour + 1;
                    var iSlotNum = iHour + 1;
 
                    aSelectedSlots.push({
                        SlotId   : "S" + (iSlotNum < 10 ? "00" + iSlotNum : "0" + iSlotNum),
                        StartTime: "PT" + (iHour < 10 ? "0" + iHour : "" + iHour) + "H00M00S",
                        EndTime  : "PT" + (iEnd  < 10 ? "0" + iEnd  : "" + iEnd)  + "H00M00S"
                    });
                }
            });
 
            if (aSelectedSlots.length === 0) {
                MessageBox.warning("Please select at least one slot!");
                return;
            }
 
            this._aSelectedSlots = aSelectedSlots;
            MessageToast.show(aSelectedSlots.length + " slot(s) selected!");
            this._oDialog.close();
        },
 
        onCancelSlots: function () {
            this._oDialog.close();
        },
 
        onAdd: function () {
            var oData = this._oTurfModel.getData();
 
            if (!oData.Name || oData.Name.trim() === "") {
                MessageBox.error("Turf Name cannot be empty!");
                return;
            }
            if (!oData.Location || oData.Location.trim() === "") {
                MessageBox.error("Location cannot be empty!");
                return;
            }
            if (!oData.Locationurl || oData.Locationurl.trim() === "") {
                MessageBox.error("Location URL cannot be empty!");
                return;
            }
            if (!oData.Type || oData.Type.trim() === "") {
                MessageBox.error("Turf Type cannot be empty!");
                return;
            }
            if (oData.Type !== "C" && oData.Type !== "B" && oData.Type !== "F") {
                MessageBox.error("Type must be C, B or F!");
                return;
            }
            if (!oData.Price || isNaN(oData.Price)) {
                MessageBox.error("Price cannot be empty!");
                return;
            }
            if (!oData.Commission_Perc || isNaN(oData.Commission_Perc)) {
                MessageBox.error("Commission cannot be empty!");
                return;
            }
            var rEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!oData.Owner || !rEmail.test(oData.Owner)) {
                MessageBox.error("Owner ID must be a valid email!");
                return;
            }
            if (!this._aSelectedSlots || this._aSelectedSlots.length === 0) {
                MessageBox.error("Please select at least one slot!");
                return;
            }
 
            var oPayload = {
                Name             : oData.Name,
                Location         : oData.Location,
                Locationurl      : oData.Locationurl,
                Type             : oData.Type,
                Owner            : oData.Owner,
                Price            : parseFloat(oData.Price).toFixed(2),
                Cuky             : "INR",
                CommissionPercent: parseFloat(oData.Commission_Perc).toFixed(2),
                Status           : "A",
                turf_slot_nav    : this._aSelectedSlots
            };
 
            console.log("Add Payload:", JSON.stringify(oPayload));
 
            this.getOwnerComponent().getModel().create("/TurfSet", oPayload, {
                success: function () {
                    MessageToast.show("Turf added successfully!");
 
                    this._oTurfModel.setData({
                        Name           : "",
                        Location       : "",
                        Locationurl    : "",
                        Type           : "",
                        Owner          : "",
                        Price          : "",
                        Cuky           : "INR",
                        Commission_Perc: ""
                    });
 
                    this._aSelectedSlots = [];
 
                }.bind(this),
 
                error: function (oError) {
                    var sMessage = "An error occurred.";
                    try {
                        sMessage = JSON.parse(oError.responseText).error.message.value;
                    } catch (e) {
                        sMessage = oError.message || sMessage;
                    }
                    MessageBox.error(sMessage);
                }
            });
        }
 
    });
});