sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserHome", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteUserDash")
                .attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            var sUserId = localStorage.getItem("userId");
            var sRole = localStorage.getItem("userRole");

            if (!sUserId || sRole !== "U") {
                this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
            }
        },

        onFilterSearch: function () {
            this.byId("turfSmartTable").rebindTable();
        },

        onMyBookings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteUserBooking");
        },

        onBookTurf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();


            var sId = oContext.getProperty("TurfId");
            var sName = oContext.getProperty("Name");
            var sLocation = oContext.getProperty("Location");

            if (!sId) {
                sap.m.MessageToast.show("Critical Error: TurfId not loaded from backend.");
                return;
            }

            this.getOwnerComponent().getRouter().navTo("RouteSlotSelect", {
                turfId: sId,
                turfName: encodeURIComponent(sName || "Turf"),
                turfLocation: encodeURIComponent(sLocation || "Location")
            });
        },

        onMap: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();

            var sUrl = oContext.getProperty("LocationUrl");

            if (sUrl) {
                window.open(sUrl, "_blank");
            } else {
                sap.m.MessageToast.show("No Map URL maintained for this turf.");
            }
        },

        onLogout: function () {

            localStorage.clear();
            sap.ui.getCore().setModel(null, "user");
            this.getOwnerComponent().setModel(null, "appModel");
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

    });
});