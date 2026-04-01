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
                   UserId: "",
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
         
            var UserId = this.getView().byId("i1").getValue();
            var Password = this.getView().byId("i2").getValue();
 
            UserId = UserId.trim().toLowerCase();
            Password = Password.trim();
 
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
            var oPayload = oJson.getProperty("/user");
            oDataModel.create("/LoginSet", oPayload, {
                success: function(data) {
 
 
                    MessageToast.show("Status: " + data.Message);
                    if(data.Role === "A") {
                        that.getOwnerComponent().getRouter().navTo("RouteReg");
                    }
                    else if(data.Role === "O"){
               
                        var oUserModel = new sap.ui.model.json.JSONModel({ OwnerId: data.UserId });                        
                        sap.ui.getCore().setModel(oUserModel, "user");
                        that.getOwnerComponent().getRouter().navTo("RouteOwnDash");
                    }
                    else if(data.Role === "U"){
                        that.getOwnerComponent().getRouter().navTo("RouteUser1");
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