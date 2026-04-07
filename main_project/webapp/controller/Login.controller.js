// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
//     "sap/m/MessageToast",
//     "sap/m/MessageBox"
// ], (Controller, JSONModel, MessageToast, MessageBox) => {
//     "use strict";

//     return Controller.extend("com.applexus.mainproject.controller.Login", {

//         onInit: function () {
//             var oJson = new JSONModel();
//             oJson.setData({
//                 user: {
//                     UserId: "",
//                     Password: ""
//                 }
//             });
//             this.getView().setModel(oJson);
//         },

//         onSignup: function () {
//             this.getOwnerComponent().getRouter().navTo("RouteReg");
//         },

//         onLogin: function () {
//             var oJson = this.getView().getModel();
//             var oDataModel = this.getOwnerComponent().getModel();

//             var UserId = this.getView().byId("i1").getValue().trim().toLowerCase();
//             var Password = this.getView().byId("i2").getValue().trim();

//             if (!UserId || !Password) {
//                 MessageToast.show("Enter both UserID and Password");
//                 return;
//             }

//             var emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|org|net|co\.in)$/;
//             if (!emailRegex.test(UserId)) {
//                 MessageToast.show("Please Enter a Valid Email Id");
//                 return;
//             }

//             oJson.setProperty("/user/UserId", UserId);
//             oJson.setProperty("/user/Password", Password);

//             oDataModel.create("/LoginSet", oJson.getProperty("/user"), {
//                 success: function (data) {
//                     MessageToast.show(data.Message);

//                     localStorage.setItem("userId", data.UserId);
//                     localStorage.setItem("userRole", data.Role);
//                     var oAppModel = new JSONModel({
//                         userId: data.UserId,
//                         role: data.Role
//                     });
//                     var oUserModel = new sap.ui.model.json.JSONModel({
//                             OwnerId: data.UserId});
 
//                     sap.ui.getCore().setModel(oUserModel, "user");

//                     this.getOwnerComponent().setModel(oAppModel, "appModel");
//                     if (data.Role === "A") {
//                         this.getOwnerComponent().getRouter().navTo("RouteAdminDash");
//                     } else if (data.Role === "O") {
//                         this.getOwnerComponent().getRouter().navTo("RouteOwnDash");
//                     } else if (data.Role === "U") {
//                         this.getOwnerComponent().getRouter().navTo("RouteUserDash");
//                     }
//                 }.bind(this),

//                 error: function (oError) {
//                     try {
//                         var sMsg = JSON.parse(oError.responseText).error.message.value;
//                         MessageBox.error("Login Failed: " + sMsg);
//                     } catch (e) {
//                         MessageBox.error("Connection Error");
//                     }
//                 }
//             });
//         }
//     });
// });


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Login", {

        onInit: function () {
            var oJson = new JSONModel();
            oJson.setData({
                user: {
                    UserId: "",
                    Password: ""
                }
            });
            this.getView().setModel(oJson);

            // Clear session/local storage every time the Login view is shown
            this.getView().addEventDelegate({
                onBeforeShow: function () {
                    localStorage.clear();
                    this.getOwnerComponent().setModel(null, "appModel");
                }.bind(this)
            });
        },

        onSignup: function () {
            this.getOwnerComponent().getRouter().navTo("RouteReg");
        },

        onLogin: function () {
            var oJson = this.getView().getModel();
            var oDataModel = this.getOwnerComponent().getModel();

            var UserId = this.getView().byId("i1").getValue().trim().toLowerCase();
            var Password = this.getView().byId("i2").getValue().trim();

            if (!UserId || !Password) {
                MessageToast.show("Enter both UserID and Password");
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|org|net|co\.in)$/;
            if (!emailRegex.test(UserId)) {
                MessageToast.show("Please Enter a Valid Email Id");
                return;
            }

            oJson.setProperty("/user/UserId", UserId);
            oJson.setProperty("/user/Password", Password);

            oDataModel.create("/LoginSet", oJson.getProperty("/user"), {
                success: function (data) {
                    MessageToast.show(data.Message);

                    localStorage.setItem("userId", data.UserId);
                    localStorage.setItem("userRole", data.Role);
                    var oAppModel = new JSONModel({
                        userId: data.UserId,
                        role: data.Role
                    });
                    var oUserModel = new sap.ui.model.json.JSONModel({
                        OwnerId: data.UserId
                    });

                    sap.ui.getCore().setModel(oUserModel, "user");
                    this.getOwnerComponent().setModel(oAppModel, "appModel");

                    // Use bReplace=true (3rd parameter) to replace login in browser history
                    var oRouter = this.getOwnerComponent().getRouter();
                    if (data.Role === "A") {
                        oRouter.navTo("RouteAdminDash", {}, true);
                    } else if (data.Role === "O") {
                        oRouter.navTo("RouteOwnDash", {}, true);
                    } else if (data.Role === "U") {
                        oRouter.navTo("RouteUserDash", {}, true);
                    }
                }.bind(this),

                error: function (oError) {
                    try {
                        var sMsg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error("Login Failed: " + sMsg);
                    } catch (e) {
                        MessageBox.error("Connection Error");
                    }
                }
            });
        }
    });
});