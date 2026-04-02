sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
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
    var oArgs      = oEvent.getParameter("arguments");

    var oAppModel  = this.getOwnerComponent().getModel("appModel");
    var fTotal     = oAppModel ? parseFloat(oAppModel.getProperty("/totalPrice")) : 0;

    var oPayModel = new JSONModel({
        bookingId : oArgs.bookingId,
        totalPrice: fTotal.toFixed(2)
    });
    this.getView().setModel(oPayModel, "payModel");

    this.getView().getModel().setData({
        payment: {
            UpiId          : "",
            isPaymentDone  : false,
            isButtonEnabled: false
        }
    });
    this.getView().byId("upiInput").setValue("");
},

        onUpiChange: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim();
            var oJson  = this.getView().getModel();
            oJson.setProperty("/payment/isButtonEnabled", !!sValue);
            oJson.setProperty("/payment/UpiId", sValue);
        },

        onUpiInfo: function () {
            MessageBox.information(
                "Your UPI ID is collected only for refund purposes " +
                "and will not be used for any other transactions."
            );
        },

        onConfirmPayment: function () {
            var oJson     = this.getView().getModel();
            var oPayModel = this.getView().getModel("payModel");
            var sUpiId    = oJson.getProperty("/payment/UpiId").trim();

            if (!sUpiId) {
                MessageToast.show("Please enter your UPI ID");
                return;
            }

            var oModel     = this.getOwnerComponent().getModel();
            var sBookingId = oPayModel.getProperty("/bookingId");

            oJson.setProperty("/payment/isButtonEnabled", false);

            var oPayload = {
                Book_id        : sBookingId,
                Payment_method : "UPI",
                Payment_time   : "/Date(" + new Date().getTime() + ")/",
                Payment_from   : sUpiId,
                Payment_to     : admin_upi,
                Payment_type   : "N"
            };

            oModel.create("/PaymentSet", oPayload, {
                success: function () {
                    oJson.setProperty("/payment/isPaymentDone",   true);
                    oJson.setProperty("/payment/isButtonEnabled", false);
                    MessageToast.show("Payment confirmed!");
                },
                error: function (oError) {
                    oJson.setProperty("/payment/isButtonEnabled", true);
                    var sMsg = "Payment failed. Please try again.";
                    try { sMsg = JSON.parse(oError.responseText).error.message.value; }
                    catch (e) { }
                    MessageBox.error(sMsg);
                }
            });
        }

    });
});