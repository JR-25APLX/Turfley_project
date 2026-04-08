sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerBooking", {

        onInit: function () {
            this._sOwnerId = null;
            this._bTableReady = false;

            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteOwnTurfBooking")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {


            var sOwnerId = localStorage.getItem('userId')


            this._sOwnerId = sOwnerId.trim();


            this.byId("OwnerBookingSmartTable").rebindTable();

        },

        onSmartTableInit: function () {
            this._bTableReady = true;

        },

        onFilterSearch: function () {
            if (!this._sOwnerId) {
                MessageBox.warning("Owner ID is not set. Cannot load bookings.");
                return;
            }
            this.byId("OwnerBookingSmartTable").rebindTable();
        },

        onBeforeRebindTable: function (oEvent) {

            var sOwnerId = localStorage.getItem('userId')
            var oSmartTable = oEvent.getSource();
            var sPath = "/ZIB18_GRP1_OWNER_BOOKING(p_ownerid='" + sOwnerId + "')/Set";
            oSmartTable.setTableBindingPath(sPath);
        }

    });
});