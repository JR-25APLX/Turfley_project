sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminEditTurf", {

        onInit: function () {
            this._aSelectedSlots = [];
            this._aExistingSlotIds = [];

            this._oTurfModel = new JSONModel({
                Name: "",
                Location: "",
                Locationurl: "",
                Type: "",
                Price: "",
                Cuky: "",
                Owner: "",
                Commission_Perc: ""
            });
            this.getView().setModel(this._oTurfModel, "turfModel");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminEditTurf").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this._sTurfId = oEvent.getParameter("arguments").turfId;
            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel();

            oView.setBusy(true);
            var sTurfPath = "/ZIB18_GRP1_AD_TURF(p_turfid='" + this._sTurfId + "')/Set";

            oModel.read(sTurfPath, {
                success: function (oData) {
                    var oRecord = (oData.results && oData.results.length > 0) ? oData.results[0] : null;

                    if (oRecord) {
                        this._oTurfModel.setData({
                            Name: oRecord.Name,
                            Location: oRecord.Location,
                            Locationurl: oRecord.LocationUrl,
                            Price: oRecord.BasePrice,
                            Cuky: oRecord.cky,
                            Owner: oRecord.TurfOwner,
                            Type: this._mapTurfTypeToKey(oRecord.TurfType),
                            Commission_Perc: ""
                        });
                    } else {
                        MessageBox.warning("No details found for the selected Turf.");
                    }
                    oView.setBusy(false);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    console.error("CDS Fetch Error:", oError);
                    MessageBox.error("Failed to load turf details from CDS. Please check SEGW mappings.");
                }.bind(this)
            });

            var sSlotPath = "/ZIB18_GRP1_SLOT_DETAILS(p_turfid='" + this._sTurfId + "')/Set";
            oModel.read(sSlotPath, {
                success: function (oData) {
                    this._aSelectedSlots = oData.results.map(function (s) {
                        return {
                            SlotId: s.SlotId,
                            StartTime: s.StartTime,
                            EndTime: s.EndTime
                        };
                    });
                    this._aExistingSlotIds = this._aSelectedSlots.map(s => s.SlotId);
                }.bind(this)
            });
        },

        _mapTurfTypeToKey: function (sText) {
            var oMap = { "Cricket": "C", "Football": "F", "Badminton": "B" };
            return oMap[sText] || "";
        },

        onSave: function () {
            var oData = this._oTurfModel.getData();
            var oEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            var oUrlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

            if (!oData.Name || oData.Name.trim() === "") {
                MessageBox.error("Please enter the Turf Name!");
                return;
            }
            if (!oData.Location || oData.Location.trim() === "") {
                MessageBox.error("Please enter the Location!");
                return;
            }
            if (!oData.Locationurl || oData.Locationurl.trim() === "") {
                MessageBox.error("Please enter the Location URL!");
                return;
            }
            if (!oUrlRegex.test(oData.Locationurl.trim())) {
                MessageBox.error("Please enter a valid Location URL (e.g. https://maps.google.com/...)!");
                return;
            }
            if (!oData.Type || oData.Type.trim() === "") {
                MessageBox.error("Please select the Turf Type!");
                return;
            }
            if (!oData.Price || oData.Price === "") {
                MessageBox.error("Please enter the Price!");
                return;
            }
            if (isNaN(oData.Price) || parseFloat(oData.Price) < 50 || parseFloat(oData.Price) > 10000) {
                MessageBox.error("Price must be between ₹50 and ₹10000!");
                return;
            }
            if (isNaN(oData.Price) || parseFloat(oData.Price) <= 0) {
                MessageBox.error("Please enter a valid Price greater than 0!");
                return;
            }
            if (!oData.Owner || oData.Owner.trim() === "") {
                MessageBox.error("Please enter the Owner Email ID!");
                return;
            }
            if (!oEmailRegex.test(oData.Owner.trim())) {
                MessageBox.error("Please enter a valid Owner Email ID (e.g. owner@example.com)!");
                return;
            }
            if (!oData.Commission_Perc || oData.Commission_Perc === "") {
                MessageBox.error("Please enter the Commission Percentage!");
                return;
            }
            if (isNaN(oData.Commission_Perc) || parseFloat(oData.Commission_Perc) < 0 || parseFloat(oData.Commission_Perc) > 25) {
                MessageBox.error("Please enter a valid Commission Percentage!");
                return;
            }

            if (!this._aSelectedSlots || this._aSelectedSlots.length === 0) {
                MessageBox.error("Please add at least one time slot before adding the turf!");
                return;
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
                    MessageToast.show("Changes saved successfully!");
                    this.onCancel();
                }.bind(this),
                error: function () {
                    MessageBox.error("Update failed. Please verify technical logs.");
                }
            });
        },

        onCancel: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminTm");
        },

        onEditSlots: function () {
            if (!this._pDialog) {
                this._pDialog = this.loadFragment({
                    name: "com.applexus.mainproject.fragments.EditSlot"
                });
            }
            this._pDialog.then(function (oDialog) {
                this._oDialog = oDialog;
                this.getView().addDependent(oDialog);
                this._preSelectSlots();
                oDialog.open();
            }.bind(this));
        },

        onConfirmSlots: function () {
            var aSelected = [];
            this._getGrid().getContent().forEach(function (oBtn) {
                if (oBtn.getType() === "Emphasized") {
                    var iH = parseInt(oBtn.data("startHour"));
                    var iSlotNum = iH + 1;
                    aSelected.push({
                        SlotId: "S" + (iSlotNum < 10 ? "00" + iSlotNum : "0" + iSlotNum),
                        StartTime: "PT" + (iH < 10 ? "0" + iH : iH) + "H00M00S",
                        EndTime: "PT" + (iSlotNum < 10 ? "0" + iSlotNum : iSlotNum) + "H00M00S"
                    });
                }
            });
            this._aSelectedSlots = aSelected;
            this._aExistingSlotIds = aSelected.map(s => s.SlotId);
            this._oDialog.close();
            MessageToast.show(aSelected.length + " slots selected.");
        },

        onCancelSlots: function () {
            this._oDialog.close();
        },

        _preSelectSlots: function () {
            var aIds = this._aExistingSlotIds || [];
            this._getGrid().getContent().forEach(function (oBtn) {
                var iSlot = parseInt(oBtn.data("startHour")) + 1;
                var sId = "S" + (iSlot < 10 ? "00" + iSlot : "0" + iSlot);
                oBtn.setType(aIds.indexOf(sId) !== -1 ? "Emphasized" : "Default");
            });
        },

        _getGrid: function () {
            return this._oDialog.getContent()[0].getItems()[1].getContent()[0];
        },

        onSlotPress: function (oEvent) {
            var oButton = oEvent.getSource();
            oButton.setType(oButton.getType() === "Default" ? "Emphasized" : "Default");
        }
    });
});