// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/Filter",
//     "sap/ui/model/FilterOperator",
//     "sap/m/MessageBox",
//     "sap/m/ColumnListItem",
//     "sap/m/Text",
//     "sap/m/Link",
//     "sap/m/Button",
//     "sap/m/ObjectNumber"
// ], function (Controller, Filter, FilterOperator, MessageBox, ColumnListItem, Text, Link, Button, ObjectNumber) {
//     "use strict";

//     return Controller.extend("com.applexus.mainproject.controller.UserMyBookings", {

//         onInit: function () {
//             var oRouter = this.getOwnerComponent().getRouter();
//             oRouter.getRoute("RouteUserBooking").attachMatched(this._onRouteMatched, this);
//         },

//         _onRouteMatched: function () {
//             var oAppModel = this.getOwnerComponent().getModel("appModel");
//             var sUserId = oAppModel ? oAppModel.getProperty("/userId") : null;


            
//             var sPath = "/ZIB18_GRP1_USERBOOKINGS(p_user_id='" + sUserId + "')/Set";
//             var oTable = this.getView().byId("myBookings");
//             var oActionsColumn = this.getView().byId("actions");
//             if (oActionsColumn) {
//                 oActionsColumn.setVisible(true);
//             }

//             oTable.bindItems({
//                 path: sPath,
//                 template: new ColumnListItem({
//                     cells: [
//                         new Text({ text: "{BookingId}" }),
//                         new Text({ text: "{TurfName}" }),
//                         new Link({
//                             text: "{Location}",
//                             press: this.onLocationPress.bind(this)
//                         }),
//                         new Text({
//                             text: {
//                                 path: "BookingDate",
//                                 type: "sap.ui.model.type.Date",
//                                 formatOptions: { style: "medium" }
//                             }
//                         }),
//                         new ObjectNumber({
//                             number: "{AmountPaid}",
//                             unit: "{Currency}"
//                         }),
//                         new Button({
//                             text: "Cancel",
//                             type: "Emphasized",
//                             press: this.onCancel.bind(this),
//                             enabled: {
//                                 path: "BookingDate",
//                                 formatter: this.isUpcoming.bind(this)
//                             }
//                         })
//                     ]
//                 })
//             });
//         },

//         isUpcoming: function (sBookingDate) {
//             if (!sBookingDate) return false;
//             var oBookingDate = new Date(sBookingDate);
//             var oToday = new Date();
//             oToday.setHours(0, 0, 0, 0);
//             oBookingDate.setHours(0, 0, 0, 0);
//             return oBookingDate >= oToday;
//         },

//         onTabSelect: function (oEvent) {
//             var sKey = oEvent.getParameter("key");
//             var oTable = this.getView().byId("myBookings");
//             var oBinding = oTable.getBinding("items");
//             var oActionsColumn = this.getView().byId("actions");

//             if (oActionsColumn) {
//                 oActionsColumn.setVisible(sKey === "Active");
//             }

//             if (!oBinding) return;

//             var oToday = new Date();
//             oToday.setHours(0, 0, 0, 0);

//             var aFilters = [];
//             if (sKey === "Active") {
//                 aFilters.push(new Filter("BookingDate", FilterOperator.GE, oToday));
//             } else if (sKey === "Past") {
//                 aFilters.push(new Filter("BookingDate", FilterOperator.LT, oToday));
//             }

//             oBinding.filter(aFilters);
//         },

//         onCancel: function (oEvent) {
//             var oContext = oEvent.getSource().getBindingContext();
//             var sBookingId = oContext.getProperty("BookingId");

//             MessageBox.confirm(
//                 "Are you sure you want to cancel Booking " + sBookingId,
//                 {
//                     title: "Confirm Cancellation",
//                     actions: [MessageBox.Action.YES, MessageBox.Action.NO],
//                     onClose: function (sAction) {
//                         if (sAction === MessageBox.Action.YES) {
//                             this._processCancellation(sBookingId);
//                         }
//                     }.bind(this)
//                 }
//             );
//         },

//         _processCancellation: function (sBookingId) {
//             var oView = this.getView();
//             var oModel = this.getOwnerComponent().getModel();

//             oView.setBusy(true);

//             oModel.update("/Booking_HeaderSet('" + sBookingId + "')", {
//                 Bookingid: sBookingId,
//                 Status: "C"
//             }, {
//                 merge: true,
//                 success: function () {
//                     this._fetchOriginalPaymentAndRefund(sBookingId, oView, oModel);
//                 }.bind(this),
//                 error: function (oError) {
//                     oView.setBusy(false);
//                     var sMsg = "Cancellation failed.";
//                     try {
//                         sMsg = JSON.parse(oError.responseText).error.message.value;
//                     } catch (e) { }
//                     MessageBox.error(sMsg);
//                 }
//             });
//         },

//         _fetchOriginalPaymentAndRefund: function (sBookingId, oView, oModel) {
//             var oRefundPayload = {
//                 BookId: sBookingId,
//                 PaymentType: "R"
//             };

//             oModel.create("/PaymentSet", oRefundPayload, {
//                 success: function () {
//                     oView.setBusy(false);
//                     MessageBox.success(
//                         "Booking " + sBookingId + " cancelled. Refund initiated!",
//                         {
//                             onClose: function () {
//                                 oModel.refresh();
//                             }
//                         }
//                     );
//                 }.bind(this),
//                 error: function (oError) {
//                     oView.setBusy(false);
//                     var sMsg = "Refund creation failed. Please contact support.";
//                     try {
//                         sMsg = JSON.parse(oError.responseText).error.message.value;
//                     } catch (e) { }
//                     MessageBox.warning(sMsg);
//                 }
//             });
//         },

//         onLocationPress: function (oEvent) {
//             var oContext = oEvent.getSource().getBindingContext();
//             var sUrl = oContext.getProperty("LocationUrl")
//             if(sUrl){
//                 sap.m.URLHelper.redirect(sUrl,true);
//             } else {
//                 MessageToast.show("No URL Provided");
//             }
//         }

//     });
// });










sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Link",
    "sap/m/Button",
    "sap/m/ObjectNumber",
    "sap/m/ObjectStatus" 
], function (Controller, Filter, FilterOperator, MessageBox, MessageToast, ColumnListItem, Text, Link, Button, ObjectNumber, ObjectStatus) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserMyBookings", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteUserBooking").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oAppModel = this.getOwnerComponent().getModel("appModel");
            var sUserId = oAppModel ? oAppModel.getProperty("/userId") : null;

            if (!sUserId) {
                return;
            }

            var sPath = "/ZIB18_GRP1_USERBOOKINGS(p_user_id='" + sUserId + "')/Set";
            var oTable = this.getView().byId("myBookings");

            oTable.bindItems({
                path: sPath,
                template: new ColumnListItem({
                    cells: [
                        new Text({ text: "{BookingId}" }),
                        new Text({ text: "{TurfName}" }),
                        new Link({
                            text: "{Location}",
                            press: this.onLocationPress.bind(this)
                        }),
                        new Text({
                            text: {
                                path: "BookingDate",
                                type: "sap.ui.model.type.Date",
                                formatOptions: { pattern: 'dd/MM/yyyy' }
                            }
                        }),
                        new ObjectNumber({
                            number: "{AmountPaid}",
                            unit: "{Currency}"
                        }),
                        // Status with Criticality (Colors)
                        new ObjectStatus({
                            text: "{BookingStatus}",
                            state: {
                                path: "StatusCriticality",
                                formatter: this.formatStatusState
                            }
                        }),
                        new Button({
                            text: "Cancel",
                            type: "Reject",
                            press: this.onCancel.bind(this),
                            enabled: {
                                path: "BookingStatus",
                                formatter: this.formatCancelEnabled
                            }
                        })
                    ]
                })
            });
        },

        formatStatusState: function (iCriticality) {
            switch (iCriticality) {
                case 3: return "Success"; // Green
                case 1: return "Error";   // Red
                case 2: return "Warning"; // Yellow
                default: return "None";
            }
        },

        formatCancelEnabled: function (sStatus) {
            // Only allow cancellation for Active/Confirmed bookings
            return sStatus === "Confirmed";
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oTable = this.getView().byId("myBookings");
            var oBinding = oTable.getBinding("items");
            
            if (!oBinding) return;

            var oToday = new Date();
            oToday.setHours(0, 0, 0, 0);

            var aFilters = [];
            if (sKey === "Active") {
                aFilters.push(new Filter("BookingDate", FilterOperator.GE, oToday));
            } else if (sKey === "Past") {
                aFilters.push(new Filter("BookingDate", FilterOperator.LT, oToday));
            }

            oBinding.filter(aFilters);
        },

        onCancel: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sBookingId = oContext.getProperty("BookingId");

            MessageBox.confirm("Are you sure you want to cancel Booking " + sBookingId + "?", {
                title: "Confirm Cancellation",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        this._processCancellation(sBookingId);
                    }
                }.bind(this)
            });
        },

        _processCancellation: function (sBookingId) {
            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel();
            oView.setBusy(true);

            oModel.update("/Booking_HeaderSet('" + sBookingId + "')", {
                Bookingid: sBookingId,
                Status: "C"
            }, {
                merge: true,
                success: function () {
                    this._fetchOriginalPaymentAndRefund(sBookingId, oView, oModel);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    var sMsg = "Cancellation failed.";
                    try {
                        sMsg = JSON.parse(oError.responseText).error.message.value;
                    } catch (e) { }
                    MessageBox.error(sMsg);
                }
            });
        },

        _fetchOriginalPaymentAndRefund: function (sBookingId, oView, oModel) {
            var oRefundPayload = {
                BookId: sBookingId,
                PaymentType: "R"
            };

            oModel.create("/PaymentSet", oRefundPayload, {
                success: function () {
                    oView.setBusy(false);
                    MessageBox.success("Booking " + sBookingId + " cancelled. Refund initiated!", {
                        onClose: function () {
                            oModel.refresh();
                        }
                    });
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.warning("Refund creation failed. Please contact support.");
                }
            });
        },

        onLocationPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sUrl = oContext.getProperty("LocationUrl");
            if (sUrl) {
                sap.m.URLHelper.redirect(sUrl, true);
            } else {
                MessageToast.show("No URL Provided");
            }
        }
    });
});