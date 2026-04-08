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
                        Owner: oData.Owner
                    });
                    this.getView().setModel(this._oTurfModel, "turfModel");
                }.bind(this),
                error: function () { console.error("Turf load failed"); }
            });

            // Load existing slots
            oModel.read("/SlotSet", {
                filters: [new Filter("TurfId", "EQ", this._sTurfId)],
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
                oButton.setType(
                    aExisting.indexOf(sSlotId) !== -1 ? "Emphasized" : "Default"
                );
            });
        },
        onSlotPress: function (oEvent) {
            var oButton = oEvent.getSource();
            oButton.setType(oButton.getType() === "Default" ? "Emphasized" : "Default");
        },

        // CONFIRM SLOTS
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

        // CANCEL SLOTS
        onCancelSlots: function () { this._oDialog.close(); },

        // SAVE
        onSave: function () {
            var oData = this._oTurfModel.getData();

            if (!oData.Name) { MessageBox.error("Turf Name cannot be empty!"); return; }
            if (!oData.Location) { MessageBox.error("Location cannot be empty!"); return; }
            if (!oData.Locationurl) { MessageBox.error("Location URL cannot be empty!"); return; }
            if (!oData.Type) { MessageBox.error("Please select Turf Type!"); return; }
            if (!oData.Price) { MessageBox.error("Price cannot be empty!"); return; }
            if (!this._aSelectedSlots.length) {
                MessageBox.error("Please select at least one slot!"); return;
            }

            var oPayload = {
                Id: this._sTurfId,
                Name: oData.Name,
                Location: oData.Location,
                Locationurl: oData.Locationurl,
                Type: oData.Type,
                Price: parseFloat(oData.Price).toFixed(2),
                Cuky: "INR",
                Owner: oData.Owner,
                turfedit_slot_nav: this._aSelectedSlots
            };

            this.getOwnerComponent().getModel().create("/TurfEditSet", oPayload, {
                success: function (oResponse) {
                    MessageToast.show("Turf updated successfully!");

                    setTimeout(function () {
                        this.getOwnerComponent().getRouter().navTo("RouteOwnDash");
                    }.bind(this), 2000);
                }.bind(this),



                error: function (oError) {
                    try {
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    } catch (e) {
                        MessageBox.error(oError.message || "Update failed.");
                    }
                }
            });
        }

    });
});