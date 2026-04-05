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

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOwnEditTurf").attachPatternMatched(
                this._onRouteMatched, this
            );
        },

        _onRouteMatched: function (oEvent) {
            this._sTurfId = oEvent.getParameter("arguments").turfId;
            console.log("Turf ID:", this._sTurfId);

            this._aSelectedSlots = [];
            this._aExistingSlotIds = [];
            this._oDialog = null;

            var oModel = this.getOwnerComponent().getModel();

            //  Load turf details
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
                error: function (oError) {
                    console.error("Turf load failed:", oError);
                }
            });

            //  Load existing slots — TurfId no underscore
            oModel.read("/SlotSet", {
                filters: [new Filter("TurfId", "EQ", this._sTurfId)],
                success: function (oData) {
                    console.log("Slots loaded:", JSON.stringify(oData.results));
                    console.log("First slot keys:", oData.results.length > 0 ? Object.keys(oData.results[0]) : "No slots");

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

                    console.log("Existing Slot IDs:", this._aExistingSlotIds);

                }.bind(this),
                error: function (oError) {
                    console.error("Slot load failed:", oError);
                }
            });
        },


        // OPEN SLOTS DIALOG

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

        // ================================================
        // PRE-SELECT EXISTING SLOTS
        // ================================================
        _preSelectSlots: function () {
            var aExisting = this._aExistingSlotIds || [];
            console.log("Pre-selecting:", aExisting);

            var oVBox = this._oDialog.getContent()[0];
            var oPanel = oVBox.getItems()[1];
            var oGrid = oPanel.getContent()[0];

            oGrid.getContent().forEach(function (oButton) {
                var iHour = parseInt(oButton.data("startHour"));
                var iSlotNum = iHour + 1;
                var sSlotId = "S" + (iSlotNum < 10 ? "00" + iSlotNum : "0" + iSlotNum);

                if (aExisting.indexOf(sSlotId) !== -1) {
                    oButton.setType("Emphasized"); // blue
                } else {
                    oButton.setType("Default");    // grey
                }
            });
        },

        // ================================================
        // SLOT BUTTON TOGGLE
        // ================================================
        onSlotPress: function (oEvent) {
            var oButton = oEvent.getSource();
            if (oButton.getType() === "Default") {
                oButton.setType("Emphasized");
            } else {
                oButton.setType("Default");
            }
        },

        // ================================================
        // CONFIRM SLOTS
        // ================================================
        onConfirmSlots: function () {
            var aSelectedSlots = [];

            var oVBox = this._oDialog.getContent()[0];
            var oPanel = oVBox.getItems()[1];
            var oGrid = oPanel.getContent()[0];

            oGrid.getContent().forEach(function (oButton) {
                if (oButton.getType() === "Emphasized") {
                    var iHour = parseInt(oButton.data("startHour"));
                    var iEnd = iHour + 1;
                    var iSlotNum = iHour + 1;

                    var sSlotId = "S" + (iSlotNum < 10 ? "00" + iSlotNum : "0" + iSlotNum);
                    var sStart = "PT" + (iHour < 10 ? "0" + iHour : "" + iHour) + "H00M00S";
                    var sEnd = "PT" + (iEnd < 10 ? "0" + iEnd : "" + iEnd) + "H00M00S";

                    aSelectedSlots.push({
                        SlotId: sSlotId,
                        StartTime: sStart,
                        EndTime: sEnd
                    });
                }
            });

            if (aSelectedSlots.length === 0) {
                MessageBox.warning("Please select at least one slot!");
                return;
            }

            this._aSelectedSlots = aSelectedSlots;
            this._aExistingSlotIds = aSelectedSlots.map(function (s) {
                return s.SlotId;
            });

            MessageToast.show(aSelectedSlots.length + " slot(s) selected!");
            this._oDialog.close();
        },

        // ================================================
        // CANCEL SLOTS
        // ================================================
        onCancelSlots: function () {
            this._oDialog.close();
        },

        // SAVE button

        onSave: function () {
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
                MessageBox.error("Please select Turf Type!");
                return;
            }
            if (!oData.Price || isNaN(oData.Price)) {
                MessageBox.error("Price cannot be empty!");
                return;
            }
            if (!this._aSelectedSlots || this._aSelectedSlots.length === 0) {
                MessageBox.error("Please select at least one slot!");
                return;
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

            console.log("Edit Payload:", JSON.stringify(oPayload));

            this.getOwnerComponent().getModel().create("/TurfEditSet", oPayload, {
                success: function (oResponse) {
                    var sMsg = (oResponse && oResponse.Message)
                        ? oResponse.Message
                        : "Turf updated successfully!";
                    MessageToast.show(sMsg);
                    this.getOwnerComponent().getRouter().navTo("RouteOwnDash");
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