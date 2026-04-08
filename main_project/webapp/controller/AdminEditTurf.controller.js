sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminEditTurf", {

        onInit: function () {
            this._aSelectedSlots = [];
            this._aExistingSlotIds = [];

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminEditTurf").attachPatternMatched(
                this._onRouteMatched, this
            );
        },

        _onRouteMatched: function (oEvent) {
            this._sTurfId = oEvent.getParameter("arguments").turfId;
            this._aSelectedSlots = [];
            this._aExistingSlotIds = [];
            this._oDialog = null;

            var oModel = this.getOwnerComponent().getModel();

            // Load turf details
            oModel.read("/TurfSet('" + this._sTurfId + "')", {
                success: function (oData) {
                    this._oTurfModel = new JSONModel({
                        Name: oData.Name,
                        Location: oData.Location,
                        Locationurl: oData.Locationurl,
                        Type: oData.Type,
                        Price: oData.Price,
                        Cuky: oData.Cuky,
                        Owner: oData.Owner,
                        Commission_Perc: oData.CommissionPercent
                    });
                    this.getView().setModel(this._oTurfModel, "turfModel");
                }.bind(this),
                error: function (oError) {
                    console.error("Turf load failed:", oError);
                }
            });

            // Load existing slots
            oModel.read("/SlotSet", {
                filters: [new Filter("TurfId", "EQ", this._sTurfId)],
                success: function (oData) {
                    this._aExistingSlotIds = oData.results.map(function (s) {
                        return s.SlotId;
                    });
                    this._aSelectedSlots = oData.results.map(function (s) {
                        return {
                            SlotId: s.SlotId,
                            StartTime: s.StartTime,
                            EndTime: s.EndTime
                        };
                    });
                }.bind(this),
                error: function (oError) {
                    console.error("Slot load failed:", oError);
                }
            });
        },

        _getGrid: function () {
            return this._oDialog.getContent()[0].getItems()[1].getContent()[0];
        },

        onEditSlots: function () {
            this.loadFragment({
                name: "com.applexus.mainproject.fragments.EditSlot"
            }).then(function (oDialog) {
                this._oDialog = oDialog;
                this.getView().addDependent(this._oDialog);
                this._preSelectSlots();
                this._oDialog.open();
            }.bind(this));
        },

        _preSelectSlots: function () {
            var aExisting = this._aExistingSlotIds || [];

            this._getGrid().getContent().forEach(function (oButton) {
                var iHour = parseInt(oButton.data("startHour"));
                var iSlotNum = iHour + 1;
                var sSlotId = "S" + (iSlotNum < 10 ? "00" + iSlotNum : "0" + iSlotNum);

                oButton.setType(
                    aExisting.indexOf(sSlotId) !== -1 ? "Emphasized" : "Default"
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


            this._getGrid().getContent().forEach(function (oButton) {
                if (oButton.getType() === "Emphasized") {
                    var iHour = parseInt(oButton.data("startHour"));
                    var iEnd = iHour + 1;
                    var iSlotNum = iHour + 1;

                    aSelectedSlots.push({
                        SlotId: "S" + (iSlotNum < 10 ? "00" + iSlotNum : "0" + iSlotNum),
                        StartTime: "PT" + (iHour < 10 ? "0" + iHour : "" + iHour) + "H00M00S",
                        EndTime: "PT" + (iEnd < 10 ? "0" + iEnd : "" + iEnd) + "H00M00S"
                    });
                }
            });

            if (aSelectedSlots.length === 0) {
                MessageBox.warning("Please select at least one slot!");
                return;
            }

            this._aSelectedSlots = aSelectedSlots;
            this._aExistingSlotIds = aSelectedSlots.map(function (s) { return s.SlotId; });

            MessageToast.show(aSelectedSlots.length + " slot(s) selected!");
            this._oDialog.close();
        },

        onCancelSlots: function () { this._oDialog.close(); },

        onCancel: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminTm");
        },

        onSave: function () {
            var oData = this._oTurfModel.getData();

            if (!oData.Name || oData.Name.trim() === "") {
                MessageBox.error("Turf Name cannot be empty!"); return;
            }
            if (!oData.Location || oData.Location.trim() === "") {
                MessageBox.error("Location cannot be empty!"); return;
            }
            if (!oData.Locationurl || oData.Locationurl.trim() === "") {
                MessageBox.error("Location URL cannot be empty!"); return;
            }
            if (!oData.Type || oData.Type.trim() === "") {
                MessageBox.error("Please select Turf Type!"); return;
            }
            if (!this._aSelectedSlots || this._aSelectedSlots.length === 0) {
                MessageBox.error("Please select at least one slot!"); return;
            }

            var oPayload = {
                Id: this._sTurfId,
                Name: oData.Name,
                Location: oData.Location,
                Locationurl: oData.Locationurl,
                Type: oData.Type,
                Price: oData.Price,
                Cuky: oData.Cuky,
                Owner: oData.Owner,
                CommissionPercent: parseFloat(oData.Commission_Perc || 0).toFixed(2),
                turfedit_slot_nav: this._aSelectedSlots
            };

            this.getOwnerComponent().getModel().create("/TurfEditSet", oPayload, {
                success: function () {
                    MessageToast.show("Turf updated successfully!");
                    setTimeout(function () {
                        this.getOwnerComponent().getRouter().navTo("RouteAdminTm");
                    }.bind(this), 2000);
                }.bind(this),

                error: function (oError) {
                    var sMessage = "Update failed.";
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