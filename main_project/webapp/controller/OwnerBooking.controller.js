sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerBooking", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOwnTurfBooking").attachPatternMatched(
                this._onRouteMatched, this
            );
        },

        _onRouteMatched: function () {
            var sOwnerId = sap.ui.getCore().getModel("user").getProperty("/OwnerId");

            if (!sOwnerId) {
                MessageToast.show("Owner ID not found!");
                return;
            }

            // Same path pattern as OwnerDash
            var sPath = "/ZIB18_GRP1_OWNER_BOOKING(p_ownerid='" + sOwnerId + "')/Set";
            console.log("Path:", sPath);

            this.getOwnerComponent().getModel().read(sPath, {
                success: function (oData) {
                    console.log("Bookings loaded:", oData.results);
                    var oModel = new JSONModel(oData.results || []);
                    this.getView().setModel(oModel, "bookingModel");
                }.bind(this),
                error: function (oError) {
                    console.error("Booking load failed:", oError);
                }
            });
        },


        // Format Date
        formatDate: function (oDate) {
            if (!oDate) { return ""; }
            return new Date(oDate).toLocaleDateString("en-IN");
            // Output: 01/06/2025
        },

        // Format Time
        formatTime: function (oTime) {
            if (!oTime || !oTime.ms) { return ""; }
            return new Date(oTime.ms).toISOString().substring(11, 16);
            // Output: 08:00
        }


    });
});