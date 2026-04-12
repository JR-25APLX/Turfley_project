sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerEditTurf", {

        onInit: function () {
            this._aSelectedSlots = [];
            this._aExistingSlotIds = [];

            this.getOwnerComponent().getRouter()
                .getRoute("RouteOwnEditTurf")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this._sTurfId = oEvent.getParameter("arguments").turfId;
            this._aSelectedSlots = [];
            this._aExistingSlotIds = [];
            this._oDialog = null;

            var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView();
            oView.setBusy(true);

            var sTurfPath = "/ZIB18_GRP1_AD_TURF(p_turfid='" + this._sTurfId + "')/Set";

            oModel.read(sTurfPath, {
                success: function (oData) {
                    var oTurf = oData.results[0];
                    if (oTurf) {
                        var sTypeCode = "";
                        switch (oTurf.TurfType) {
                            case "Cricket": sTypeCode = "C"; break;
                            case "Badminton": sTypeCode = "B"; break;
                            case "Football": sTypeCode = "F"; break;
                        }

                        this._oTurfModel = new JSONModel({
                            Name: oTurf.Name,
                            Location: oTurf.Location,
                            LocationUrl: oTurf.LocationUrl,
                            BasePrice: oTurf.BasePrice,
                            cky: oTurf.cky,
                            TurfOwner: oTurf.TurfOwner,
                            TypeCode: sTypeCode
                        });
                        oView.setModel(this._oTurfModel, "turfModel");
                    }
                    oView.setBusy(false);
                }.bind(this),
                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Failed to load turf details.");
                }
            });

            var sSlotPath = "/ZIB18_GRP1_SLOT_DETAILS(p_turfid='" + this._sTurfId + "')/Set";

            oModel.read(sSlotPath, {
                success: function (oData) {
                    this._aExistingSlotIds = oData.results.map(function (s) { return s.SlotId; });
                    this._aSelectedSlots = oData.results.map(function (s) {
                        return { SlotId: s.SlotId, StartTime: s.StartTime, EndTime: s.EndTime };
                    });
                }.bind(this),
                error: function () { console.error("Slot load failed"); }
            });
        },

        _getGrid: function () {
            return this._oDialog.getContent()[0].getItems()[1].getContent()[0];
        },

        onEditSlots: function () {
            this.loadFragment({ name: "com.applexus.mainproject.fragments.EditSlot" })
                .then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    this._preSelectSlots();
                    oDialog.open();
                }.bind(this));
        },

        _preSelectSlots: function () {
            var aExisting = this._aExistingSlotIds || [];
            this._getGrid().getContent().forEach(function (oButton) {
                var sSlotId = "S" + ("00" + (parseInt(oButton.data("startHour")) + 1)).slice(-3);
                oButton.setType(aExisting.indexOf(sSlotId) !== -1 ? "Emphasized" : "Default");
            });
        },

        onSlotPress: function (oEvent) {
            var oButton = oEvent.getSource();
            oButton.setType(oButton.getType() === "Default" ? "Emphasized" : "Default");
        },

        onConfirmSlots: function () {
            var aSlots = [];
            this._getGrid().getContent().forEach(function (oButton) {
                if (oButton.getType() === "Emphasized") {
                    var i = parseInt(oButton.data("startHour"));
                    aSlots.push({
                        SlotId: "S" + ("00" + (i + 1)).slice(-3),
                        StartTime: "PT" + ("0" + i).slice(-2) + "H00M00S",
                        EndTime: "PT" + ("0" + (i + 1)).slice(-2) + "H00M00S"
                    });
                }
            });

            if (!aSlots.length) {
                MessageBox.warning("Please select at least one slot!");
                return;
            }

            this._aSelectedSlots = aSlots;
            this._aExistingSlotIds = aSlots.map(function (s) { return s.SlotId; });
            MessageToast.show(aSlots.length + " slot(s) selected!");
            this._oDialog.close();
        },

        onCancelSlots: function () { this._oDialog.close(); },

        onSave: function () {
            var oData = this._oTurfModel.getData();

            // Validation
            if (!oData.Name || !oData.Location || !oData.LocationUrl || !oData.TypeCode || !oData.BasePrice) {
                MessageBox.error("Please fill in all required fields.");
                return;
            }
            if (!this._aSelectedSlots.length) {
                MessageBox.error("Please select at least one slot!");
                return;
            }

            var oPayload = {
                Id: this._sTurfId,
                Name: oData.Name,
                Location: oData.Location,
                Locationurl: oData.LocationUrl,
                Type: oData.TypeCode,
                Price: parseFloat(oData.BasePrice).toFixed(2),
                Cuky: oData.cky || "INR",
                Owner: oData.TurfOwner,
                turfedit_slot_nav: this._aSelectedSlots
            };

            this.getOwnerComponent().getModel().create("/TurfEditSet", oPayload, {
                success: function () {
                    MessageToast.show("Turf updated successfully!");
                    setTimeout(function () {
                        this.getOwnerComponent().getRouter().navTo("RouteOwnDash");
                    }.bind(this), 2000);
                }.bind(this),
                error: function (oError) {
                    try {
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    } catch (e) {
                        MessageBox.error("Update failed.");
                    }
                }
            });
        }
    });
});