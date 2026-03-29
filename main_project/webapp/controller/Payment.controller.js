sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Payment", {

        onInit() {
            var oJson = new JSONModel();
            oJson.setData({
                payment: {
                    UpiId          : "",
                    isPaymentDone  : false,
                    isButtonEnabled: false
                }
            });
            this.getView().setModel(oJson);
        },

        onUpiChange: function(oEvent) {
            var sValue = oEvent.getParameter("value").trim();
            var oJson  = this.getView().getModel();

            // Enable button only when UPI ID is entered
            if (sValue) {
                oJson.setProperty("/payment/isButtonEnabled", true);
            } else {
                oJson.setProperty("/payment/isButtonEnabled", false);
            }
            oJson.setProperty("/payment/UpiId", sValue);
        },

        onUpiInfo: function() {
            MessageBox.information("Your UPI ID is collected only for refund purposes and will not be used for any other transactions.");
        },

        onConfirmPayment: function() {
            var oJson  = this.getView().getModel();
            var sUpiId = oJson.getProperty("/payment/UpiId");

            if (!sUpiId) {
                MessageToast.show("Please Enter your UPI ID");
                return;
            }

            // Show success state
            oJson.setProperty("/payment/isPaymentDone", true);
        }
    });
});