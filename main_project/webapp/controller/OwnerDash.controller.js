sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerDash", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOwnDash").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var sUserId = localStorage.getItem("userId");
            var sRole = localStorage.getItem("userRole");
            if (!sUserId || sRole !== "O") {
                this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
            }
            var oSmartTable = this.getView().byId("smartTableOwn");
            if (oSmartTable) {
                oSmartTable.rebindTable();
            }
        },

        onBeforeRebind: function (oEvent) {
            var sOwnerId = localStorage.getItem('userId')
            var oSmartTable = oEvent.getSource();
            var sPath = "/ZIB18_GRP1_OWNER(p_ownerid='" + sOwnerId + "')/Set";
            oSmartTable.setTableBindingPath(sPath);
        },

        onEditTurf: function (oEvent) {
            var oContext = oEvent.getSource().getParent().getBindingContext();

            if (oContext) {
                var sPath = oContext.getPath();
                var oMatch = sPath.match(/Turf_Id='([^']+)'/);
                if (oMatch && oMatch[1]) {
                    var sTurfId = oMatch[1];
                    this.getOwnerComponent().getRouter().navTo("RouteOwnEditTurf", {
                        turfId: sTurfId
                    });
                }
            }
        },

        onAdd: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOwnAddTurf");
        },

        onViewMyBookings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOwnTurfBooking");
        },

        onLogout: function () {
            localStorage.clear();
            sap.ui.getCore().setModel(null, "user");
            this.getOwnerComponent().setModel(null, "appModel");
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

    });
});