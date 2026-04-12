sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminDash", {

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteAdminDash").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {

            var sUserId = localStorage.getItem("userId");
            var sRole = localStorage.getItem("userRole");
            if (!sUserId || sRole !== "A") {
                this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
            }

            var sUserId;
            var oAppModel = this.getOwnerComponent().getModel("appModel");
            if (oAppModel) {
                sUserId = oAppModel.getProperty("/userId");
            }
            if (!sUserId) {
                sUserId = localStorage.getItem("userId");
            }

            var oDashModel = new JSONModel({
                activeUsers: 0,
                blockedUsers: 0,
                owners: 0,
                turfs: 0,
                turfStatus: [],
                turfType: []
            });
            this.getView().setModel(oDashModel, "dashModel");
            this._loadUserStats(sUserId);
            this._loadTurfStatus();
            this._loadTurfType();
        },


        _loadUserStats: function (sUserId) {

            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/ZIB18_GRP1_AD_User_count('" + sUserId + "')";

            oModel.read(sPath, {
                success: function (oData) {

                    var oDashModel = this.getView().getModel("dashModel");

                    oDashModel.setProperty("/activeUsers", oData.ActiveUsers || 0);
                    oDashModel.setProperty("/blockedUsers", oData.BlockedUsers || 0);
                    oDashModel.setProperty("/owners", oData.Owners || 0);

                }.bind(this),

                error: function () {
                    MessageBox.error("Failed to load user statistics");
                }
            });
        },

        //TURF STATUS CHART
        _loadTurfStatus: function () {

            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/ZIB18_GRP1_AD_Turf_Count", {
                success: function (oData) {

                    var aResults = oData.results || [];
                    var iTotal = 0;

                    var aFormatted = aResults.map(function (oItem) {

                        iTotal += oItem.TurfCount;

                        return {
                            type: oItem.TurfStatusText,
                            count: oItem.TurfCount
                        };
                    });

                    var oDashModel = this.getView().getModel("dashModel");

                    oDashModel.setProperty("/turfStatus", aFormatted);
                    oDashModel.setProperty("/turfs", iTotal);

                }.bind(this),

                error: function () {
                    MessageBox.error("Failed to load turf status data");
                }
            });
        },

        // TURF TYPE CHART
        _loadTurfType: function () {

            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/ZIB18_GRP1_AD_Turf_Ratio", {
                success: function (oData) {

                    var aResults = oData.results || [];

                    var aFormatted = aResults.map(function (oItem) {
                        return {
                            type: oItem.TurfType,
                            count: oItem.TurfCount
                        };
                    });

                    var oDashModel = this.getView().getModel("dashModel");

                    oDashModel.setProperty("/turfType", aFormatted);

                }.bind(this),

                error: function () {
                    MessageBox.error("Failed to load turf type data");
                }
            });
        },

        //Navigation
        onTmPress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminTm");
        },

        onBmPress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminBm");
        },

        onUmPress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminUm");
        },

        onLogout: function () {
            localStorage.clear();
            sap.ui.getCore().setModel(null, "user");
            this.getOwnerComponent().setModel(null, "appModel");
            this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
        }

    });
});