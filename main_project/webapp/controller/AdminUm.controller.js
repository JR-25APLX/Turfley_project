sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
    ], (Controller, JSONModel, MessageToast) => {
        "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminUm", {
        onInit() {
            var oJson = new JSONModel();
            oJson.setData({ users: [] });
            this.getView().setModel(oJson, "oJson");
            this._sSelectedUserId = null;
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminUm").attachMatched(this.loadUsers, this);       
        },

        loadUsers: function () {
            var that = this;
            var oModel = this.getView().getModel(); 

            oModel.read("/ZIB18_GRP1_USER", {
                success: function (oData) {
                    console.log("Data received:", oData);
                    var oJson = that.getView().getModel("oJson");
                    oJson.setProperty("/users", oData.results); 
                    MessageToast.show("Users loaded successfully!");
                },
                error: function (oError) {
                    console.log("Error loading users:", oError);
                    alert("Failed to load users");
                }
            });
        },

        onBlock: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("oJson");
            this._sSelectedUserId = oContext.getProperty("UserId"); 
            this.byId("confirm").open();
        },

        onConfirm: function () {
            var that = this;
            var oModel = this.getView().getModel(); 

            oModel.update("/ZIB18_GRP1_USER('" + this._sSelectedUserId + "')", { Status: "B" }, {
                success: function () {
                    MessageToast.show("User " + that._sSelectedUserId + " has been blocked!");
                    that._sSelectedUserId = null;
                    that.byId("confirm").close();
                    that.loadUsers(); 
                },
                error: function (oError) {
                    console.log("Block Error:", oError);
                    alert("Failed to block user");
                    that.byId("confirm").close();
                }
            });
        },

        onCancel: function () {
            this._sSelectedUserId = null;
            this.byId("confirm").close();
        }

    });
});