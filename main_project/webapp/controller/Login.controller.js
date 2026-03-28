sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Login", {
        onInit() {
            var oJson = new JSONModel();
            oJson.setData({
                user:{
                   Userid: "",
                   Password: ""
                }
            });
            this.getView().setModel(oJson);
        },

        onSignup: function(){
            var oRoute = this.getOwnerComponent().getRouter();
            oRoute.navTo("RouteReg");
        },


        onLogin: function()
        {
            var oJson = this.getView().getModel();
            var oDataModel = this.getOwnerComponent().getModel();
            var that = this;
            var userId = this.getView().byId("i1").getValue();
            var password = this.getView().byId("i2").getValue(); 

            userId = userId.trim().toLowerCase();
            password = password.trim();
 
            if (!userId || !password) {
                MessageToast.show("Enter both UserID and Password");
                return; 
            }
            
            var emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|org|net|co\.in)$/;
                if (!emailRegex.test(userId)) {
                    MessageToast.show("Please Enter a Valid Email Id");
                    return;
                }     
            oJson.setProperty("/user/Userid", userId);
            oJson.setProperty("/user/Password", password);
            var oPayload = oJson.getProperty("/user");
            oDataModel.create("/LoginSet", oPayload, {
                success: function(data) {
                    MessageToast.show("Status: " + data.Message);
                    if(data.Role === "Admin") {
                        that.getOwnerComponent().getRouter().navTo("RouteReg");
                    } 
                    else if(data.Role === "Owner"){
                        that.getOwnerComponent().getRouter().navTo("RouteReg");
                    }
                    else if(data.Role === "User"){
                        that.getOwnerComponent().getRouter().navTo("RouteReg");
                    }
                },
                error: function(oError) {
                    try {
                        var sEmsg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error("Login Failed: " + sEmsg);
                    } 
                    catch (e) {
                        MessageBox.error("Connection Error");
                    }
                }
            });
        },

    });
});