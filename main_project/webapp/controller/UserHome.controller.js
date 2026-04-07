sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserHome", {

        onInit: function () {
            // Initialization logic if needed
        },

        /**
         * Triggered when the 'Go' button on the SmartFilterBar is pressed.
         */
        onFilterSearch: function () {
            this.byId("turfSmartTable").rebindTable();
        },

        /**
         * Navigation to the User's Bookings page.
         */
        onMyBookings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteUserBooking");
        },

        /**
         * Handles the 'Book Now' button press.
         * Since the button is in the XML template, getBindingContext() 
         * automatically returns the data for that specific row.
         */
        onBookTurf: function (oEvent) {
    var oContext = oEvent.getSource().getBindingContext();
    
    // Use the exact aliases from your CDS view
    var sId       = oContext.getProperty("TurfId"); 
    var sName     = oContext.getProperty("Name");
    var sLocation = oContext.getProperty("Location");

    // Defensive check to prevent the 'segment required' crash
    if (!sId) {
        sap.m.MessageToast.show("Critical Error: TurfId not loaded from backend.");
        return;
    }

    this.getOwnerComponent().getRouter().navTo("RouteSlotSelect", {
        turfId      : sId,
        turfName    : encodeURIComponent(sName || "Turf"),
        turfLocation: encodeURIComponent(sLocation || "Location")
    });
},

onMap: function (oEvent) {
    var oContext = oEvent.getSource().getBindingContext();
    // Matches 'locationurl as LocationUrl' in CDS
    var sUrl = oContext.getProperty("LocationUrl");

    if (sUrl) {
        window.open(sUrl, "_blank");
    } else {
        sap.m.MessageToast.show("No Map URL maintained for this turf.");
    }
},

      onLogout: function () {
    localStorage.clear();
    this.getOwnerComponent().setModel(null, "appModel");
    this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
}


    });
});