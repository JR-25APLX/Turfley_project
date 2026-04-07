sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerDash", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOwnDash").attachPatternMatched(
                this._onRouteMatched, this
            );
        },

        _onRouteMatched: function () {

            var oUserModel = sap.ui.getCore().getModel("user");

            var sOwnerId = oUserModel.getProperty("/OwnerId");

            if (!sOwnerId) {
                console.error("OwnerId is empty!");
                return;
            }

            this._sOwnerId = sOwnerId;

            this._loadTurfs(sOwnerId);
        },

        _loadTurfs: function (sOwnerId) {

            var oDataModel = this.getOwnerComponent().getModel();
            var sPath = "/ZIB18_GRP1_OWNER(p_ownerid='" + sOwnerId + "')/Set";


            oDataModel.read(sPath, {
                success: function (oData) {

                    var oTurfModel = new JSONModel({ turfs: oData.results });
                    this.getView().setModel(oTurfModel, "turfModel");
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching turfs:", oError);
                }
            });
        },

        onAdd: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOwnAddTurf");
        },


        onEditTurf: function (oEvent) { 
            var oContext = oEvent.getSource().getBindingContext("turfModel");

            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("Navigating to edit turf:", sTurfId);

            this.getOwnerComponent().getRouter().navTo("RouteOwnEditTurf", {
                turfId: sTurfId
            });
        },


        onViewMyBookings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOwnTurfBooking");
        }

    });
});