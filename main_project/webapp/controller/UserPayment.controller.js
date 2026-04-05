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
                    UpiId: "",
                    isPaymentDone: false,
                    isButtonEnabled: false
                }
            });
            this.getView().setModel(oJson);

            this.getOwnerComponent().getRouter()
                .getRoute("RoutePay")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var sBookingId = oArgs.bookingId;
            var sTotalAmount = oArgs.totalAmount;

            var oPayModel = new JSONModel({
                bookingId: sBookingId,
                totalPrice: parseFloat(sTotalAmount).toFixed(2)
            });
            this.getView().setModel(oPayModel, "payModel");

            this.getView().getModel().setProperty("/payment", {
                UpiId: "",
                isPaymentDone: false,
                isButtonEnabled: false
            });

            var oUpiInput = this.getView().byId("upiInput");
            if (oUpiInput) {
                oUpiInput.setValue("");
            }
        },

        onUpiChange: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim();
            var oModel = this.getView().getModel();
            
            oModel.setProperty("/payment/isButtonEnabled", !!sValue);
            oModel.setProperty("/payment/UpiId", sValue);
        },

        onConfirmPayment: function () {
            debugger;
            var oView = this.getView();
            var oJson = oView.getModel();
            var sUpiId = oJson.getProperty("/payment/UpiId").trim();
            var sBookingId = oView.getModel("payModel").getProperty("/bookingId");

            if (!sUpiId) {
                MessageToast.show("Please enter your UPI ID");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            oJson.setProperty("/payment/isButtonEnabled", false);

            var oPayload = {
                "BookId": sBookingId,
                "PaymentMethod": "UPI",
                "PaymentFrom": sUpiId,
                "PaymentTo": admin_upi,
                "PaymentType": "N"
            };

            oView.setBusy(true);

            oModel.create("/PaymentSet", oPayload, {
                success: function (oData) {
                    oView.setBusy(false);
                    oJson.setProperty("/payment/isPaymentDone", true);

                    var sSuccessMsg = oData.Message || "Payment Successful! Your turf is booked.";

                    MessageBox.success(sSuccessMsg, {
                        onClose: function () {
                            var oODataModel = this.getOwnerComponent().getModel();
                            oODataModel.refreshSecurityToken(
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
                    } catch (e) {
                        
                    }
                    MessageBox.error(sErrorMsg);
                }
            });
        },
        onUpiInfo: function () {
            MessageBox.information("Your UPI ID is collected only for refund purposes.");
        }
    });
});