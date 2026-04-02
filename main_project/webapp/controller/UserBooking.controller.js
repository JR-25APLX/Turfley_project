sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Token"
], function (Controller, JSONModel, MessageToast, MessageBox, Token) {
    "use strict";

    
    return Controller.extend("com.applexus.mainproject.controller.UserBooking", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteBooking")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var oArgs      = oEvent.getParameter("arguments");
            var aSlotIds   = decodeURIComponent(oArgs.slotIds).split(",");
            var aSlotTexts = decodeURIComponent(oArgs.slotTexts).split("|");
            var fBasePrice = parseFloat(oArgs.basePrice) || 0;
            var iSlotCount = aSlotIds.length;
            var fSlotTotal = fBasePrice * iSlotCount;
            var COMMISSION_PERCENT = 15; 

            var fCommission = ((COMMISSION_PERCENT / 100) * fSlotTotal);
            var fTotal      = fSlotTotal + fCommission;

            var aParts       = oArgs.bookingDate.split("-");
            var sDisplayDate = aParts[2] + "/" + aParts[1] + "/" + aParts[0];

            var oViewModel = new JSONModel({
                turfId            : oArgs.turfId,
                turfName          : decodeURIComponent(oArgs.turfName),
                turfLocation      : decodeURIComponent(oArgs.turfLocation),
                bookingDate       : sDisplayDate,
                rawDate           : oArgs.bookingDate,
                slotIds           : aSlotIds,
                slotTexts         : aSlotTexts,
                basePrice         : fBasePrice.toFixed(2),
                slotCount         : iSlotCount,
                slotTotal         : fSlotTotal.toFixed(2),
                commissionPercent : COMMISSION_PERCENT,
                commissionAmount  : fCommission.toFixed(2),
                totalPrice        : fTotal.toFixed(2)
            });

            this.getView().setModel(oViewModel, "viewModel");
            this._renderSlotTokens(aSlotTexts);
        },

        _renderSlotTokens: function (aSlotTexts) {
            var oBox = this.getView().byId("slotTokenBox");
            oBox.removeAllItems();
            aSlotTexts.forEach(function (sText) {
                oBox.addItem(new Token({
                    text    : sText.trim(),
                    editable: false
                }));
            });
        },

                onConfirmBooking: function () {
    var oData  = this.getView().getModel("viewModel").getData();
    var oModel = this.getOwnerComponent().getModel();

    var aParts = oData.rawDate.split("-");
    var sDate  = "/Date(" + new Date(Date.UTC(+aParts[0],
                                              +aParts[1] - 1,
                                              +aParts[2]))
                                              .getTime() + ")/";

    var oPayload = {
        Bookingid        : "",
        Userid           : "joelreji@gmail.com",
        Turfid           : oData.turfId,
        Bookingdate      : sDate,
        Commissionamount : parseFloat(oData.commissionAmount).toFixed(3),
        Cuky             : "INR",
        Status           : "P",
        booking_header_item_nav: oData.slotIds.map(function (sSlotId) {
            return {
                Slotid    : sSlotId.trim(),
                Slotprice : (parseFloat(oData.slotTotal) / oData.slotIds.length).toFixed(3),
                Cuky      : "INR"
            };
        })
    };

    oModel.create("/Booking_HeaderSet", oPayload, {
        success: function (oCreated) {
            this.getOwnerComponent().setModel(
                new sap.ui.model.json.JSONModel({ totalPrice: oData.totalPrice }),
                "appModel"
            );
            MessageToast.show("Booking Confirmed! ID: " + oCreated.Bookingid);
            this.getOwnerComponent().getRouter().navTo("RoutePay");
        }.bind(this),
        error: function (oError) {
            var sMsg = "Booking creation failed.";
            try { sMsg = JSON.parse(oError.responseText).error.message.value; }
            catch (e) { }
            MessageBox.error(sMsg);
        }
    });
},
                
        onCancelBooking: function () {
            var oVM = this.getView().getModel("viewModel");
            this.getOwnerComponent().getRouter().navTo("RouteSlotSelect", {
                turfId      : oVM.getProperty("/turfId"),
                turfName    : encodeURIComponent(oVM.getProperty("/turfName")),
                turfLocation: encodeURIComponent(oVM.getProperty("/turfLocation"))
            });
        }

    });
});