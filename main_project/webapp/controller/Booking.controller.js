sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Booking", {
        onInit() {
            var oJson = new JSONModel();
            oJson.setData({
                booking: {
                    CustomerName : "Alex",
                    TurfName     : "GreenField Turf",
                    TurfType     : "Cricket",
                    BookingId    : "T001",
                    Date         : "Monday, March 23, 2026",
                    TimeSlots    : [
                        { Slot: "2:00 PM TO 3:00 PM" },
                        { Slot: "3:00 PM TO 4:00 PM" }
                    ],
                    TotalAmount  : "Rs. 2000/-"
                }
            });
            this.getView().setModel(oJson);
        },

        onMakePayment: function() {
            this.getOwnerComponent().getRouter().navTo("RoutePay");
            
        }
    });
});