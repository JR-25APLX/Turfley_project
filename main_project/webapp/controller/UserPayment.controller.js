sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    var admin_upi = "admin-1@okhdfc";

    return Controller.extend("com.applexus.mainproject.controller.UserPayment", {

        onInit: function () {
            var oJson = new JSONModel({
                payment: {
                    UpiId          : "",
                    isPaymentDone  : false,
                    isButtonEnabled: false
                }
            });
            this.getView().setModel(oJson);

            this.getOwnerComponent().getRouter()
                .getRoute("RoutePay")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArgs        = oEvent.getParameter("arguments");
            var sTotalAmount = oArgs.totalAmount;

            var oPayModel = new JSONModel({
                bookingId : "",
                totalPrice: parseFloat(sTotalAmount).toFixed(2)
            });
            this.getView().setModel(oPayModel, "payModel");

            this.getView().getModel().setProperty("/payment", {
                UpiId          : "",
                isPaymentDone  : false,
                isButtonEnabled: false
            });

            var oUpiInput = this.getView().byId("upiInput");
            if (oUpiInput) { oUpiInput.setValue(""); }
        },

        onUpiChange: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim();
            var oModel = this.getView().getModel();
            oModel.setProperty("/payment/isButtonEnabled", !!sValue);
            oModel.setProperty("/payment/UpiId", sValue);
        },

        onConfirmPayment: function () {
            var oView     = this.getView();
            var oJson     = oView.getModel();
            var sUpiId    = oJson.getProperty("/payment/UpiId").trim();
            var oAppModel = this.getOwnerComponent().getModel("appModel");
            var oModel    = this.getOwnerComponent().getModel();

            if (!sUpiId) {
                MessageToast.show("Please enter your UPI ID");
                return;
            }

            var oBooking = oAppModel ? oAppModel.getProperty("/pendingBooking") : null;

            if (!oBooking) {
                MessageBox.error("Booking data not found. Please go back and try again.");
                return;
            }

            var sUserId = localStorage.getItem("userId");

            var aParts = oBooking.rawDate.split("-");
            var sDate = new Date(
                                  parseInt(aParts[0], 10),     
                                  parseInt(aParts[1], 10) - 1,  
                                  parseInt(aParts[2], 10),
                                  12, 0, 0, 0
                                );

            var oPayload = {
                Bookingid        : "",
                Userid           : sUserId,
                Turfid           : oBooking.turfId,
                Bookingdate      : sDate,
                Commissionamount : parseFloat(oBooking.commissionAmount).toFixed(3),
                Cuky             : "INR",
                Status           : "A",
                booking_header_item_nav: oBooking.slotIds.map(function (sSlotId) {
                    return {
                        Slotid    : sSlotId.trim(),
                        Slotprice : (parseFloat(oBooking.slotTotal) / oBooking.slotIds.length).toFixed(3),
                        Cuky      : "INR"
                    };
                }),
                Booking_header_payment_nav: [{   
                    PaymentMethod: "UPI",
                    PaymentFrom  : sUpiId,
                    PaymentTo    : admin_upi,
                    PaymentType  : "N"
                }]
            };

            oJson.setProperty("/payment/isButtonEnabled", false);
            oView.setBusy(true);

            oModel.create("/Booking_HeaderSet", oPayload, {
                success: function (oCreated) {
                    oView.setBusy(false);
                    oJson.setProperty("/payment/isPaymentDone", true);

                    if (oAppModel) {
                        oAppModel.setProperty("/pendingBooking", null);
                    }

                    var sBookingId = oCreated.Bookingid
                                  || oCreated.Bookid
                                  || oCreated.BookId
                                  || oCreated.BOOKINGID;

                    var sSuccessMsg = "Payment Successful! Your turf is booked." +
                                      (sBookingId ? " Booking ID: " + sBookingId : "");

                    MessageBox.success(sSuccessMsg, {
                        onClose: function () {
                            oModel.refreshSecurityToken(
                                function () {
                                    this.getOwnerComponent().getRouter().navTo("RouteUserBooking");
                                }.bind(this),
                                function () {
                                    this.getOwnerComponent().getRouter().navTo("RouteUserBooking");
                                }.bind(this),
                                true
                            );
                        }.bind(this)
                    });
                }.bind(this),

                error: function (oError) {
                    oView.setBusy(false);
                    oJson.setProperty("/payment/isButtonEnabled", true);
                    var sErrorMsg = "Payment failed. Please try again.";
                    try {
                        sErrorMsg = JSON.parse(oError.responseText).error.message.value;
                    } catch (e) {}
                    MessageBox.error(sErrorMsg);
                }
            });
        },

        onUpiInfo: function () {
            MessageBox.information("Your UPI ID is collected only for refund purposes.");
        }
    });
});