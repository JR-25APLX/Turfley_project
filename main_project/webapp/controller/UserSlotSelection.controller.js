// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
//     "sap/m/MessageToast",
//     "sap/m/MessageBox"
// ], function (Controller, JSONModel, MessageToast, MessageBox) {
//     "use strict";

//     return Controller.extend("com.applexus.mainproject.controller.UserSlotSelection", {

//         onInit: function () {
//             this.getOwnerComponent().getRouter().getRoute("RouteSlotSelect")
//                                     .attachPatternMatched(this._onObjectMatched, this);

//             this.getView().byId("datePicker").setMinDate(new Date());
//         },

//         _onObjectMatched: function (oEvent) {
//     var oArgs = oEvent.getParameter("arguments");
//     var oModel = this.getOwnerComponent().getModel();

//     var oViewModel = new JSONModel({
//         turfId       : oArgs.turfId,
//         turfName     : decodeURIComponent(oArgs.turfName),
//         turfLocation : decodeURIComponent(oArgs.turfLocation),
//         selectedDate : "",
//         selectedSlots: [],
//         totalPrice   : 0,
//         basePrice    : 0,
//         commPercent  : 0 
//     });
//     this.getView().setModel(oViewModel, "viewModel");

//     oModel.read("/TurfSet('" + oArgs.turfId + "')", {
//         success: function(oData) {
//             oViewModel.setProperty("/commPercent", oData.CommissionPercent);
//         },
//         error: function() {
//             oViewModel.setProperty("/commPercent", 5); // Fallback if read fails
//         }
//     });

//     this._resetAllButtons();
// },

//         onDateChange: function (oEvent) {
//             var oDP    = oEvent.getSource();
//             var sValue = oDP.getValue(); 

//             if (!sValue || !oDP.isValidValue()) {
//                 MessageToast.show("Please select a valid date");
//                 return;
//             }

           
//             var aParts = sValue.split("/");             
//             var sISO   = aParts[2] + "-" + aParts[1] + "-" + aParts[0]; 

//             var oVM = this.getView().getModel("viewModel");
//             oVM.setProperty("/selectedDate",   sISO);
//             oVM.setProperty("/selectedSlots",  []);
//             oVM.setProperty("/totalPrice",     0);

//             this._loadSlots(oVM.getProperty("/turfId"), sISO);
//         },

//         _loadSlots: function (sTurfId, sISO) {
//             var oModel = this.getOwnerComponent().getModel();

//             var sPath = "/ZIB18_GRP1_SLOT_AVAILABILITY"
//                       + "(p_turf_id='" + sTurfId + "'"
//                       + ",p_book_date=datetime'" + sISO + "T00%3A00%3A00'"
//                       + ")/Set";

//             var oView = this.getView();
//             oView.setBusy(true);

//             oModel.read(sPath, {
//                 success: function (oData) {
//                     oView.setBusy(false);
//                     this._applySlotColors(oData.results);
//                 }.bind(this),
//                 error: function (oError) {
//                     oView.setBusy(false);
//                     var sMsg = oError.responseText
//                         ? JSON.parse(oError.responseText).error.message.value
//                         : "Failed to load slots.";
//                     MessageBox.error(sMsg);
//                 }
//             });
//         },

//         _applySlotColors: function (aSlots) {
//             this._resetAllButtons();

//             if (!aSlots || aSlots.length === 0) {
//                 MessageToast.show("No slots defined for this turf.");
//                 return;
//             }

//             var oSlotMap = {};
//             aSlots.forEach(function (oSlot) {
//                 var iHour = Math.floor(oSlot.Start_Time.ms / 3600000);
//                 oSlotMap[iHour] = oSlot;
//             });

//             var oVM = this.getView().getModel("viewModel");
//             if (aSlots[0] && aSlots[0].Base_price) {
//                 oVM.setProperty("/basePrice", parseFloat(aSlots[0].Base_price));
//             }
//             var oGrid    = this.getView().byId("slotGrid");
//             var aButtons = oGrid.getContent();

//             aButtons.forEach(function (oBtn) {
//                 var iStartHour = parseInt(oBtn.data("startHour"), 10);
//                 var oSlot      = oSlotMap[iStartHour];

//                 if (!oSlot) {
//                     oBtn.setType("Default");
//                     oBtn.setEnabled(false);
//                     oBtn.data("status", "");
//                     oBtn.data("slotId", "");
//                     return;
//                 }

//                 oBtn.setEnabled(true);
//                 oBtn.data("slotId", oSlot.Slot_Id);

//                 if (oSlot.Availability_status === "Booked") {
//                     oBtn.setType("Reject");    // Red
//                     oBtn.data("status", "B");
//                 } else {
//                     oBtn.setType("Accept");    // Green
//                     oBtn.data("status", "A");
//                 }
//             });
//         },

//         _resetAllButtons: function () {
//             var oGrid = this.getView().byId("slotGrid");
//             if (!oGrid) return;

//             oGrid.getContent().forEach(function (oBtn) {
//                 oBtn.setType("Default");
//                 oBtn.setEnabled(false);
//                 oBtn.data("status", "");
//                 oBtn.data("slotId", "");
//                 oBtn.removeStyleClass("selectedSlot");
//             });
//         },

//         onSlotPress: function (oEvent) {
//             var oBtn    = oEvent.getSource();
//             var sStatus = oBtn.data("status");
//             var sSlotId = oBtn.data("slotId");
//             var sText   = oBtn.getText();

//             var oVM   = this.getView().getModel("viewModel");
//             var sDate = oVM.getProperty("/selectedDate");

//             if (!sDate) {
//                 MessageToast.show("Please select a date first");
//                 return;
//             }

//             if (sStatus === "B") {
//                 MessageToast.show("This slot is already booked");
//                 return;
//             }

//             var aSelected = oVM.getProperty("/selectedSlots");
//             var iIndex    = aSelected.findIndex(function (s) {
//                 return s.slotId === sSlotId;
//             });

//             if (iIndex > -1) {
                
//                 aSelected.splice(iIndex, 1);
//                 oBtn.setType("Accept");
//                 oBtn.removeStyleClass("selectedSlot");
//             } else {
                
//                 aSelected.push({ slotId: sSlotId, slotText: sText });
//                 oBtn.setType("Emphasized");   // Blue = selected
//                 oBtn.addStyleClass("selectedSlot");
//             }

    
//             var fBase  = oVM.getProperty("/basePrice");
//             oVM.setProperty("/selectedSlots", aSelected);
//             oVM.setProperty("/totalPrice",    aSelected.length * fBase);

//             MessageToast.show(aSelected.length + " slot(s) selected");
//         },

//         // onBookNow: function () {
//         //     var oVM    = this.getView().getModel("viewModel");
//         //     var oData  = oVM.getData();
//         //     var aSlots = oData.selectedSlots;

//         //     if (!oData.selectedDate) {
//         //         MessageBox.error("Please select a booking date first.");
//         //         return;
//         //     }
//         //     if (!aSlots || aSlots.length === 0) {
//         //         MessageBox.error("Please select at least one slot.");
//         //         return;
//         //     }
//         //     var sSlotIds   = aSlots.map(function (s) { return s.slotId; }).join(",");
//         //     var sSlotTexts = aSlots.map(function (s) { return s.slotText; }).join("|");

//         //     this.getOwnerComponent().getRouter().navTo("RouteBooking", {
//         //         turfId      : oData.turfId,
//         //         turfName    : encodeURIComponent(oData.turfName),
//         //         turfLocation: encodeURIComponent(oData.turfLocation),
//         //         bookingDate : oData.selectedDate,
//         //         slotIds     : encodeURIComponent(sSlotIds),
//         //         slotTexts   : encodeURIComponent(sSlotTexts),
//         //         basePrice   : oData.basePrice
//         //     });
//         // },
//         onBookNow: function () {
//     var oVM    = this.getView().getModel("viewModel");
//     var oData  = oVM.getData();
//     var aSlots = oData.selectedSlots;

//     if (!oData.selectedDate || aSlots.length === 0) {
//         MessageBox.error("Please select a date and at least one slot.");
//         return;
//     }

//     var sSlotIds   = aSlots.map(function (s) { return s.slotId; }).join(",");
//     var sSlotTexts = aSlots.map(function (s) { return s.slotText; }).join("|");

//     this.getOwnerComponent().getRouter().navTo("RouteBooking", {
//         turfId      : oData.turfId,
//         turfName    : encodeURIComponent(oData.turfName),
//         turfLocation: encodeURIComponent(oData.turfLocation),
//         bookingDate : oData.selectedDate,
//         slotIds     : encodeURIComponent(sSlotIds),
//         slotTexts   : encodeURIComponent(sSlotTexts),
//         basePrice   : oData.basePrice,
//         commPercent : oData.commPercent 
//     });
// }
//     });
// });

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
            var oArgs = oEvent.getParameter("arguments");
            var oModel = this.getOwnerComponent().getModel();

            var oViewModel = new JSONModel({
                turfId: oArgs.turfId,
                turfName: decodeURIComponent(oArgs.turfName),
                turfLocation: decodeURIComponent(oArgs.turfLocation),
                selectedDate: "",
                selectedSlots: [],
                totalPrice: 0,
                basePrice: 0,
                commPercent: 0 
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Fetch dynamic Price and Commission from the database
            oModel.read("/TurfSet('" + oArgs.turfId + "')", {
                success: function(oData) {
                    oViewModel.setProperty("/commPercent", oData.CommissionPercent);
                    oViewModel.setProperty("/basePrice", parseFloat(oData.Price).toFixed(2));
                },
                error: function() {
                    oViewModel.setProperty("/commPercent", 5); // Fallback
                }
            });

            this._resetAllButtons();
        },

        onDateChange: function (oEvent) {
            var oDP = oEvent.getSource();
            var sISO = oDP.getValue(); 

            if (!sISO || !oDP.isValidValue()) {
                MessageToast.show("Please select a valid date");
                return;
            }

            var oVM = this.getView().getModel("viewModel");
            oVM.setProperty("/selectedDate", sISO);
            oVM.setProperty("/selectedSlots", []);
            oVM.setProperty("/totalPrice", 0);

            this._loadSlots(oVM.getProperty("/turfId"), sISO);
        },

        _loadSlots: function (sTurfId, sISO) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/ZIB18_GRP1_SLOT_AVAILABILITY"
                      + "(p_turf_id='" + sTurfId + "'"
                      + ",p_book_date=datetime'" + sISO + "T00%3A00%3A00'"
                      + ")/Set";

            var oView = this.getView();
            oView.setBusy(true);

            oModel.read(sPath, {
                success: function (oData) {
                    oView.setBusy(false);
                    this._applySlotColors(oData.results);
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
                // Map Start_Time from backend to hour for buttons
                if (oSlot.Start_Time && typeof oSlot.Start_Time.ms !== "undefined") {
                    var iHour = Math.floor(oSlot.Start_Time.ms / 3600000);
                    oSlotMap[iHour] = oSlot;
                }
            });

            var oGrid = this.getView().byId("slotGrid");
            var aButtons = oGrid.getContent();

            aButtons.forEach(function (oBtn) {
                var iStartHour = parseInt(oBtn.data("startHour"), 10);
                var oSlot = oSlotMap[iStartHour];

                if (!oSlot) {
                    oBtn.setEnabled(false);
                    return;
                }

                oBtn.setEnabled(true);
                oBtn.data("slotId", oSlot.Slot_Id);

                var sStatus = oSlot.Availability_status ? oSlot.Availability_status.trim() : "";
                if (sStatus === "Booked") {
                    oBtn.setType("Reject"); // Red
                    oBtn.data("status", "B");
                } else {
                    oBtn.setType("Accept"); // Green
                    oBtn.data("status", "A");
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
            var oBtn = oEvent.getSource();
            var sStatus = oBtn.data("status");
            var sSlotId = oBtn.data("slotId");
            var sText = oBtn.getText();
            var oVM = this.getView().getModel("viewModel");

            if (!oVM.getProperty("/selectedDate")) {
                MessageToast.show("Please select a date first");
                return;
            }

            if (sStatus === "B") {
                MessageToast.show("This slot is already booked");
                return;
            }

            var aSelected = oVM.getProperty("/selectedSlots");
            var iIndex = aSelected.findIndex(function (s) { return s.slotId === sSlotId; });

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
            var oVM = this.getView().getModel("viewModel");
            var oData = oVM.getData();
            var aSlots = oData.selectedSlots;

            if (!oData.selectedDate || aSlots.length === 0) {
                MessageBox.error("Please select a date and at least one slot.");
                return;
            }

            var sSlotIds = aSlots.map(function (s) { return s.slotId; }).join(",");
            var sSlotTexts = aSlots.map(function (s) { return s.slotText; }).join("|");

            this.getOwnerComponent().getRouter().navTo("RouteBooking", {
                turfId: oData.turfId,
                turfName: encodeURIComponent(oData.turfName),
                turfLocation: encodeURIComponent(oData.turfLocation),
                bookingDate: oData.selectedDate,
                slotIds: encodeURIComponent(sSlotIds),
                slotTexts: encodeURIComponent(sSlotTexts),
                basePrice: oData.basePrice,
                commPercent: oData.commPercent
            });
        }
    });
});