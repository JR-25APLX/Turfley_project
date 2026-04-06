sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminDash", {
        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteAdminDash")
                .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            var sUserId;
            var oAppModel = this.getOwnerComponent().getModel("appModel");
            if (oAppModel) {
                sUserId = oAppModel.getProperty("/userId");
            }
            if (!sUserId) {
                sUserId = localStorage.getItem("userId");
            }

            if (!sUserId) {
                MessageBox.error("Session expired. Please log in again.");
                this.getOwnerComponent().getRouter().navTo("RouteHome");
                return;
            }
            this.getView().setModel(new JSONModel({
                activeUsers : 0,
                blockedUsers: 0,
                owners      : 0,
                turfs       : 0,
                turfStatus  : [],
                turfType    : []
            }), "dashModel");

            this._loadUserStats(sUserId);
            this._loadTurfStats();
        },
        _loadUserStats: function (sUserId) {
            var oODataModel = this.getOwnerComponent().getModel();
            var sPath = "/ZIB18_GRP1_Admin_Dash('" + sUserId + "')";

            oODataModel.read(sPath, {
                success: function (oData) {
                    var oDashModel = this.getView().getModel("dashModel");
                    oDashModel.setProperty("/activeUsers",  oData.ActiveUsers  || 0);
                    oDashModel.setProperty("/blockedUsers", oData.BlockedUsers || 0);
                    oDashModel.setProperty("/owners",       oData.Owners       || 0);
                }.bind(this),

                error: function (oError) {
                    var sMsg = "Failed to load user statistics.";
                    try { sMsg = JSON.parse(oError.responseText).error.message.value; } catch (e) { /**/ }
                    MessageBox.error(sMsg);
                }
            });
        },
        _loadTurfStats: function () {
            var oODataModel = this.getOwnerComponent().getModel();

            oODataModel.read("/ZIB18_GRP1_TURF", {
                success: function (oData) {
                    var aTurfs = oData.results || [];
                    var mStatusMap = {};
                    var mTypeMap   = {};
                    aTurfs.forEach(function (oTurf) {
                        var sStatusCode  = oTurf.Status_code || "?";
                        var sStatusLabel = oTurf.Status      || sStatusCode;
                        if (!mStatusMap[sStatusCode]) {
                            mStatusMap[sStatusCode] = { type: sStatusLabel, count: 0 };
                        }
                        mStatusMap[sStatusCode].count++;
                        var sType = oTurf.TurfType || "?";
                        if (!mTypeMap[sType]) {
                            mTypeMap[sType] = { type: sType, count: 0 };
                        }
                        mTypeMap[sType].count++;
                    });

                    var oDashModel = this.getView().getModel("dashModel");
                    oDashModel.setProperty("/turfs",      aTurfs.length);
                    oDashModel.setProperty("/turfStatus", Object.values(mStatusMap));
                    oDashModel.setProperty("/turfType",   Object.values(mTypeMap));
                }.bind(this),

                error: function (oError) {
                    var sMsg = "Failed to load turf statistics.";
                    sMsg = JSON.parse(oError.responseText).error.message.value; 
                    MessageBox.error(sMsg);
                }
            });
        },
        onTmPress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminTm");
        },
        onBmPress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminBm");
        },
        onUmPress: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAdminUm");
        }
    });
});