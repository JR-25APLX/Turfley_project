sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token"
], function (Controller, JSONModel, Token) {
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
            var fBasePrice   = parseFloat(oArgs.basePrice)   || 0;
            var fCommPercent = parseFloat(oArgs.commPercent) || 0;

            var iSlotCount  = aSlotIds.length;
            var fSlotTotal  = fBasePrice * iSlotCount;
            var fCommission = (fCommPercent / 100) * fSlotTotal;
            var fTotal      = fSlotTotal + fCommission;

            var aParts       = oArgs.bookingDate.split("-");
            var sDisplayDate = aParts[2] + "/" + aParts[1] + "/" + aParts[0];

            var oViewModel = new JSONModel({
                turfId          : oArgs.turfId,
                turfName        : decodeURIComponent(oArgs.turfName),
                turfLocation    : decodeURIComponent(oArgs.turfLocation),
                bookingDate     : sDisplayDate,
                rawDate         : oArgs.bookingDate,
                slotIds         : aSlotIds,
                slotTexts       : aSlotTexts,
                basePrice       : fBasePrice.toFixed(2),
                slotCount       : iSlotCount,
                slotTotal       : fSlotTotal.toFixed(2),
                commissionPercent : fCommPercent,
                commissionAmount  : fCommission.toFixed(2),
                totalPrice        : fTotal.toFixed(2)
            });

            this.getView().setModel(oViewModel, "viewModel");
            this._renderSlotTokens(aSlotTexts);
        },

        _renderSlotTokens: function (aSlotTexts) {
            var oBox = this.getView().byId("slotTokenBox");
            if (!oBox) return;
            oBox.removeAllItems();
            aSlotTexts.forEach(function (sText) {
                oBox.addItem(new Token({
                    text    : sText.trim(),
                    editable: false
                }));
            });
        },

        onConfirmBooking: function () {
            var oView     = this.getView();
            var oData     = oView.getModel("viewModel").getData();
            var oAppModel = this.getOwnerComponent().getModel("appModel");

            if (oAppModel) {
                oAppModel.setProperty("/pendingBooking", {
                    turfId          : oData.turfId,
                    turfName        : oData.turfName,
                    turfLocation    : oData.turfLocation,
                    rawDate         : oData.rawDate,
                    slotIds         : oData.slotIds,
                    slotTotal       : oData.slotTotal,
                    commissionAmount: oData.commissionAmount,
                    totalPrice      : oData.totalPrice
                });
            }

            this.getOwnerComponent().getRouter().navTo("RoutePay", {
                bookingId   : "PENDING",          
                totalAmount : oData.totalPrice
            });
        },

        onCancelBooking: function () {
            var oVM = this.getView().getModel("viewModel");
            this.getOwnerComponent().getRouter().navTo("RouteSlotSelect", {
                turfId       : oVM.getProperty("/turfId"),
                turfName     : encodeURIComponent(oVM.getProperty("/turfName")),
                turfLocation : encodeURIComponent(oVM.getProperty("/turfLocation"))
            });
        }
    });
});