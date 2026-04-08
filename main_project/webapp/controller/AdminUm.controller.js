sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminUm", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ users: [] }), "userModel");
            this._loadUsers();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminUm").attachPatternMatched(
                this._onRouteMatched, this
            );
        },

        _onRouteMatched: function () {
            this._loadUsers();
        },

        // LOAD USERS
        _loadUsers: function () {
            this.getOwnerComponent().getModel().read("/ZIB18_GRP1_USER", {
                success: function (oData) {
                    this.getView().getModel("userModel")
                        .setProperty("/users", oData.results);

                }.bind(this),
                error: function (oError) {
                    MessageBox.error("Failed to load users!");
                }
            });
        },
        // BLOCK / UNBLOCK
        onBlockUnblock: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("userModel");
            var sUserId = oContext.getProperty("UserId");
            var sStatus = oContext.getProperty("Status");
            var sNewStatus = sStatus === "B" ? "A" : "B";
            var sAction = sStatus === "B" ? "Unblock" : "Block";

            MessageBox.confirm("Are you sure you want to " + sAction + " " + sUserId + "?", {
                onClose: function (sChoice) {
                    if (sChoice !== MessageBox.Action.OK) { return; }

                    this.getOwnerComponent().getModel().update(
                        "/UserSet('" + sUserId + "')",
                        { Status: sNewStatus },
                        {
                            merge: true,
                            success: function () {
                                MessageToast.show(sUserId + " " + sAction + "ed!");
                                this._loadUsers();
                            }.bind(this),
                            error: function (oError) {
                                MessageBox.error("Failed to " + sAction + "!");
                            }
                        }
                    );
                }.bind(this)
            });
        }

    });
});