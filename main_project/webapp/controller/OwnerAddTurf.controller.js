sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerAddTurf", {

        onInit: function () {
            var sUserId = localStorage.getItem("userId");
            this._sOwnerId = sUserId;
            this._aSelectedSlots = [];
            this._oTurfModel = new JSONModel({
                Name: "",
                Location: "",
                Locationurl: "",
                Type: "",
                Owner: this._sOwnerId,
                Price: "",
                Cuky: "INR"
            });

            this.getView().setModel(this._oTurfModel, "turfModel");
        },

        _getGrid: function () {
            return this._oDialog.getContent()[0].getItems()[1].getContent()[0];
        },

        onAddSlots: function () {
            var oData = this._oTurfModel.getData();

            if (!oData.Name || oData.Name.trim() === "") {
                MessageBox.error("Please fill Turf Name before selecting slots!"); return;
            }
            if (!oData.Location || oData.Location.trim() === "") {
                MessageBox.error("Please fill Location before selecting slots!"); return;
            }
            if (!oData.Locationurl || oData.Locationurl.trim() === "") {
                MessageBox.error("Please fill Location URL before selecting slots!"); return;
            }
            if (!oData.Type || oData.Type.trim() === "") {
                MessageBox.error("Please select Turf Type before selecting slots!"); return;
            }
            if (!oData.Price || isNaN(oData.Price)) {
                MessageBox.error("Please fill Price before selecting slots!"); return;
            }

            if (!this._oDialog) {
                this.loadFragment({
                    name: "com.applexus.mainproject.fragments.EditSlot"
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(this._oDialog);
                    this._restoreSelectedSlots();
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._restoreSelectedSlots();
                this._oDialog.open();
            }
        },

        _restoreSelectedSlots: function () {
            var aSelected = this._aSelectedSlots;
            this._getGrid().getContent().forEach(function (oButton) {
                var sSlotId = "S" + ("00" + (parseInt(oButton.data("startHour")) + 1)).slice(-3);
                oButton.setType(
                    aSelected.some(function (s) { return s.SlotId === sSlotId; })
                        ? "Emphasized" : "Default"
                );
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
            MessageToast.show(aSlots.length + " slot(s) selected!");
            this._oDialog.close();
        },

        // CANCEL SLOTS
        onCancelSlots: function () { this._oDialog.close(); },

        onAdd: function () {
            var oData = this._oTurfModel.getData();
            var oUrlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

            if (!oData.Name || oData.Name.trim() === "") {
                MessageBox.error("Turf Name cannot be empty!"); return;
            }
            if (!oData.Location || oData.Location.trim() === "") {
                MessageBox.error("Location cannot be empty!"); return;
            }
            if (!oUrlRegex.test(oData.Locationurl.trim())) {
                MessageBox.error("Please enter a valid Location URL (e.g. https://maps.google.com/...)!");
                return;
            }
            if (!oData.Type || oData.Type.trim() === "") {
                MessageBox.error("Please select a Turf Type!"); return;
            }
            if (oData.Type !== "C" && oData.Type !== "B" && oData.Type !== "F") {
                MessageBox.error("Turf Type must be Cricket, Badminton, or Football!"); return;
            }
            if (!oData.Price || oData.Price === "") {
                MessageBox.error("Please enter the Price!");
                return;
            }
            if (isNaN(oData.Price) || parseFloat(oData.Price) < 250 || parseFloat(oData.Price) > 10000) {
                MessageBox.error("Price must be between ₹200 and ₹10000!");
                return;
            }
            if (isNaN(oData.Price) || parseFloat(oData.Price) <= 0) {
                MessageBox.error("Please enter a valid Price greater than 0!");
                return;
            }
            if (!this._aSelectedSlots || !this._aSelectedSlots.length) {
                MessageBox.error("Please select at least one slot!"); return;
            }

            var oPayload = {
                Name: oData.Name,
                Location: oData.Location,
                Locationurl: oData.Locationurl,
                Type: oData.Type,
                Owner: this._sOwnerId,
                Price: parseFloat(oData.Price).toFixed(2),
                Cuky: "INR",
                Status: "P",
                turf_slot_nav: this._aSelectedSlots
            };

            this.getOwnerComponent().getModel().create("/TurfSet", oPayload, {
                success: function () {
                    MessageToast.show("Turf submitted for approval!");

                    this._oTurfModel.setData({
                        Name: "",
                        Location: "",
                        Locationurl: "",
                        Type: "",
                        Owner: this._sOwnerId, //  Keep OwnerId after reset
                        Price: "",
                        Cuky: "INR"
                    });

                    this._aSelectedSlots = [];
                    this.getOwnerComponent().getRouter().navTo("RouteOwnDash");

                }.bind(this),

                error: function (oError) {
                    try {
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    } catch (e) {
                        MessageBox.error(oError.message || "An error occurred.");
                    }
                }
            });
        }

    });
});