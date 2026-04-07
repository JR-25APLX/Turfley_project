sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserSlotSelection", {

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteSlotSelect")
                .attachPatternMatched(this._onObjectMatched, this);

            this.getView().byId("datePicker").setMinDate(new Date());
        },

        _onObjectMatched: function (oEvent) {
            var oArgs  = oEvent.getParameter("arguments");
            var oModel = this.getOwnerComponent().getModel();

            var oViewModel = new JSONModel({
                turfId       : oArgs.turfId,
                turfName     : decodeURIComponent(oArgs.turfName),
                turfLocation : decodeURIComponent(oArgs.turfLocation),
                selectedDate : "",
                selectedSlots: [],
                totalPrice   : 0,
                basePrice    : 0,
                commPercent  : 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            oModel.read("/TurfSet('" + oArgs.turfId + "')", {
                success: function (oData) {
                    oViewModel.setProperty("/commPercent", oData.CommissionPercent);
                    oViewModel.setProperty("/basePrice", parseFloat(oData.Price).toFixed(2));
                },
                error: function () {
                    oViewModel.setProperty("/commPercent", 5);
                }
            });

            // ── Restore state saved before navigating to booking summary ──
            var oAppModel   = this.getOwnerComponent().getModel("appModel");
            var oPending    = oAppModel && oAppModel.getProperty("/slotSelectionState");

            // Only restore if it belongs to the same turf
            if (oPending && oPending.turfId === oArgs.turfId) {
                oViewModel.setProperty("/selectedDate",  oPending.selectedDate);
                oViewModel.setProperty("/selectedSlots", oPending.selectedSlots);
                oViewModel.setProperty("/totalPrice",    oPending.totalPrice);

                // Sync the DatePicker control to the restored date
                var oDP = this.getView().byId("datePicker");
                if (oDP) { oDP.setValue(oPending.selectedDate); }

                // Reload slot colours for the saved date, then re-highlight selections
                this._loadSlots(oArgs.turfId, oPending.selectedDate, oPending.selectedSlots);
            } else {
                this._resetAllButtons();
            }
        },

        onDateChange: function (oEvent) {
            var oDP  = oEvent.getSource();
            var sISO = oDP.getValue();

            if (!sISO || !oDP.isValidValue()) {
                MessageToast.show("Please select a valid date");
                return;
            }

            var oVM = this.getView().getModel("viewModel");
            oVM.setProperty("/selectedDate",  sISO);
            oVM.setProperty("/selectedSlots", []);   // fresh date → clear old picks
            oVM.setProperty("/totalPrice",    0);

            this._loadSlots(oVM.getProperty("/turfId"), sISO, []);
        },

        // aRestoreSlots is optional — passed only when coming back from booking summary
        _loadSlots: function (sTurfId, sISO, aRestoreSlots) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath  = "/ZIB18_GRP1_SLOT_AVAILABILITY"
                       + "(p_turf_id='" + sTurfId + "'"
                       + ",p_book_date=datetime'" + sISO + "T00%3A00%3A00'"
                       + ")/Set";

            var oView = this.getView();
            oView.setBusy(true);

            oModel.read(sPath, {
                success: function (oData) {
                    oView.setBusy(false);
                    this._applySlotColors(oData.results);

                    // Re-highlight previously chosen slots after colours are applied
                    if (aRestoreSlots && aRestoreSlots.length) {
                        this._restoreSelectedSlots(aRestoreSlots);
                    }
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    var sMsg = "Failed to load slots.";
                    try { sMsg = JSON.parse(oError.responseText).error.message.value; } catch (e) { }
                    MessageBox.error(sMsg);
                }
            });
        },

        _applySlotColors: function (aSlots) {
            this._resetAllButtons();

            if (!aSlots || aSlots.length === 0) {
                MessageToast.show("No slots defined for this turf.");
                return;
            }

            var oSlotMap = {};
            aSlots.forEach(function (oSlot) {
                if (oSlot.Start_Time && typeof oSlot.Start_Time.ms !== "undefined") {
                    var iHour = Math.floor(oSlot.Start_Time.ms / 3600000);
                    oSlotMap[iHour] = oSlot;
                }
            });

            var oGrid    = this.getView().byId("slotGrid");
            var aButtons = oGrid.getContent();

            aButtons.forEach(function (oBtn) {
                var iStartHour = parseInt(oBtn.data("startHour"), 10);
                var oSlot      = oSlotMap[iStartHour];

                if (!oSlot) { oBtn.setEnabled(false); return; }

                oBtn.setEnabled(true);
                oBtn.data("slotId", oSlot.Slot_Id);

                var sStatus = oSlot.Availability_status ? oSlot.Availability_status.trim() : "";
                if (sStatus === "Booked") {
                    oBtn.setType("Reject");
                    oBtn.data("status", "B");
                } else {
                    oBtn.setType("Accept");
                    oBtn.data("status", "A");
                }
            });
        },

        // ── Mirror of OwnerAddTurf._restoreSelectedSlots ──────────────────
        _restoreSelectedSlots: function (aSelectedSlots) {
            var oGrid = this.getView().byId("slotGrid");
            oGrid.getContent().forEach(function (oBtn) {
                var sSlotId = oBtn.data("slotId");
                var bWasPicked = aSelectedSlots.some(function (s) {
                    return s.slotId === sSlotId;
                });
                if (bWasPicked && oBtn.data("status") !== "B") {
                    oBtn.setType("Emphasized");
                    oBtn.addStyleClass("selectedSlot");
                }
            });
        },

        _resetAllButtons: function () {
            var oGrid = this.getView().byId("slotGrid");
            if (!oGrid) return;
            oGrid.getContent().forEach(function (oBtn) {
                oBtn.setType("Default");
                oBtn.setEnabled(false);
                oBtn.data("status", "");
                oBtn.data("slotId", "");
                oBtn.removeStyleClass("selectedSlot");
            });
        },

        onSlotPress: function (oEvent) {
            var oBtn    = oEvent.getSource();
            var sStatus = oBtn.data("status");
            var sSlotId = oBtn.data("slotId");
            var sText   = oBtn.getText();
            var oVM     = this.getView().getModel("viewModel");

            if (!oVM.getProperty("/selectedDate")) {
                MessageToast.show("Please select a date first"); return;
            }
            if (sStatus === "B") {
                MessageToast.show("This slot is already booked"); return;
            }

            var aSelected = oVM.getProperty("/selectedSlots");
            var iIndex    = aSelected.findIndex(function (s) { return s.slotId === sSlotId; });

            if (iIndex > -1) {
                aSelected.splice(iIndex, 1);
                oBtn.setType("Accept");
                oBtn.removeStyleClass("selectedSlot");
            } else {
                aSelected.push({ slotId: sSlotId, slotText: sText });
                oBtn.setType("Emphasized");
                oBtn.addStyleClass("selectedSlot");
            }

            var fBase = parseFloat(oVM.getProperty("/basePrice"));
            oVM.setProperty("/selectedSlots", aSelected);
            oVM.setProperty("/totalPrice", (aSelected.length * fBase).toFixed(2));
        },

        onBookNow: function () {
            var oVM   = this.getView().getModel("viewModel");
            var oData = oVM.getData();
            var aSlots = oData.selectedSlots;

            if (!oData.selectedDate || aSlots.length === 0) {
                MessageBox.error("Please select a date and at least one slot."); return;
            }

            var oAppModel = this.getOwnerComponent().getModel("appModel");
            if (oAppModel) {
                oAppModel.setProperty("/slotSelectionState", {
                    turfId       : oData.turfId,
                    selectedDate : oData.selectedDate,
                    selectedSlots: oData.selectedSlots,
                    totalPrice   : oData.totalPrice
                });
            }

            var sSlotIds   = aSlots.map(function (s) { return s.slotId;   }).join(",");
            var sSlotTexts = aSlots.map(function (s) { return s.slotText; }).join("|");

            this.getOwnerComponent().getRouter().navTo("RouteBooking", {
                turfId       : oData.turfId,
                turfName     : encodeURIComponent(oData.turfName),
                turfLocation : encodeURIComponent(oData.turfLocation),
                bookingDate  : oData.selectedDate,
                slotIds      : encodeURIComponent(sSlotIds),
                slotTexts    : encodeURIComponent(sSlotTexts),
                basePrice    : oData.basePrice,
                commPercent  : oData.commPercent
            });
        }
    });
});