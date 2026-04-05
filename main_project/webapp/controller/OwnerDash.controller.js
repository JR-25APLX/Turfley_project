sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerDash", {

        //Runs Automatically When this Page loads
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOwnDash").attachPatternMatched(
                this._onRouteMatched, this
            );
        },

        _onRouteMatched: function () {

            // Getting the Logged In Details from the user Model
            var oUserModel = sap.ui.getCore().getModel("user");

            // To Prevent Crashing, if oUserModel is Missing 
            if (!oUserModel) {
                console.error("User model not found!");
                return;
            }

            // Here, We get the OwnerId from the Login Page and stored in sOwnerId
            var sOwnerId = oUserModel.getProperty("/OwnerId");
            console.log("OwnerId:", sOwnerId);

            // Checking Whether Owner Id is containg any info or not
            if (!sOwnerId) {
                console.error("OwnerId is empty!");
                return;
            }

            // Storing Locally for Future purpose
            this._sOwnerId = sOwnerId;

            //Calling this Function
            this._loadTurfs(sOwnerId);
        },

        _loadTurfs: function (sOwnerId) {

            var oDataModel = this.getOwnerComponent().getModel();
            var sPath = "/ZIB18_GRP1_OWNER(p_ownerid='" + sOwnerId + "')/Set";


            // OData Call
            oDataModel.read(sPath, {
                success: function (oData) {
                    console.log("Turfs fetched:", oData.results);

                    //Converting Backend Data into UI Data
                    var oTurfModel = new JSONModel({ turfs: oData.results });
                    this.getView().setModel(oTurfModel, "turfModel");
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching turfs:", oError);
                }
            });
        },

        // When Owner Wants to add a new Turf
        onAdd: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOwnAddTurf");
        },


        // When Owner Wants to edit the turf 
        onEditTurf: function (oEvent) {
            // It gives the info about the row clicked by Owner, 
            var oContext = oEvent.getSource().getBindingContext("turfModel");

            if (!oContext) {
                console.error("No binding context!");
                return;
            }

            // Since oContext is pointing to the row
            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("Navigating to edit turf:", sTurfId);

            if (!sTurfId) {
                console.error("TurfID is undefined!");
                return;
            }

            // Navigating to the Edit Screen with this TurfId
            this.getOwnerComponent().getRouter().navTo("RouteOwnEditTurf", {
                turfId: sTurfId
            });
        },


        // When Owner Wants to see his bookings
        onViewMyBookings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOwnTurfBooking");
        }

    });
});