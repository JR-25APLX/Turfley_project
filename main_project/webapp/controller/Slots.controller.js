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
                turf: {
                    TurfId   : "T001",
                    Name     : "Green Field Turf",
                    Location : "Khazakottam"
                },
                slots: [
                    { SlotId: "S001", Time: "9 - 10 AM",   Status: "A" },
                    { SlotId: "S002", Time: "10 - 11 AM",  Status: "B" },
                    { SlotId: "S003", Time: "11 - 12 PM",  Status: "A" },
                    { SlotId: "S004", Time: "12 - 01 PM",  Status: "B" },
                    { SlotId: "S005", Time: "1 - 2 PM",    Status: "A" },
                    { SlotId: "S006", Time: "2 - 3 PM",    Status: "A" },
                    { SlotId: "S007", Time: "3 - 4 PM",    Status: "A" },
                    { SlotId: "S008", Time: "4 - 5 PM",    Status: "B" },
                    { SlotId: "S009", Time: "5 - 6 PM",    Status: "B" },
                    { SlotId: "S010", Time: "6 - 7 PM",    Status: "B" },
                    { SlotId: "S011", Time: "7 - 8 PM",    Status: "B" },
                    { SlotId: "S012", Time: "8 - 9 PM",    Status: "A" },
                    { SlotId: "S013", Time: "9 - 10 PM",   Status: "A" },
                    { SlotId: "S014", Time: "10 - 11 PM",  Status: "A" }
                ],
                selectedDate: ""
            });
            this.getView().setModel(oJson);
        },

        onDateChange: function(oEvent) {
            var sDate = oEvent.getParameter("value");
            if (!sDate) return;

            var oJson = this.getView().getModel();
            oJson.setProperty("/selectedDate", sDate);
            MessageToast.show("Fetching slots for: " + sDate);

            // Backend call will go here later
            // For now slots load from JSON automatically
        },

        onSlotPress: function(oEvent) {
            var oButton  = oEvent.getSource();
            var sStatus  = oButton.data("status");
            var sTime    = oButton.getText();
            var oJson    = this.getView().getModel();
            var sDate    = oJson.getProperty("/selectedDate");

            if (!sDate) {
                MessageToast.show("Please Select a Date First");
                return;
            }

            if (sStatus === "B") {
                MessageToast.show(sTime + " is Already Booked!");
                return;
            }

            MessageToast.show(sTime + " Selected!");
        },

        onBookNow: function() {
            var oJson = this.getView().getModel();
            var sDate = oJson.getProperty("/selectedDate");

            if (!sDate) {
                MessageBox.error("Please Select a Date before Booking");
                return;
            }

            MessageToast.show("Proceeding to Book...");
            // Navigation to payment or confirmation will go here
        }
    });
});