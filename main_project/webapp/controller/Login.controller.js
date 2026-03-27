sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Login", {
        onInit() {
            var oJson = new sap.ui.model.json.JSONModel();
            oJson.setData({
                user:{
                   Email: "",
                   Password: ""
                }
                });
            this.getView().setModel(oJson);
        },
        onLogin: function()
        {
            debugger; 

                var oJson = this.getView().getModel(); // This is your JSON model from onInit
                var oDataModel = this.getOwnerComponent().getModel(); // Your OData model
                var that = this;
            var userId = this.getView().byId("i1").getValue();
            var password = this.getView().byId("i2").getValue(); 

            userId = userId.trim();
            password = password.trim();
 
            if (!userId || !password) {
                MessageToast.show("Please Enter both UserID and Password");
                return; 
            }
            
            if (!userId.endsWith("gmail.com")){
                MessageToast.show("Please Enter a Valid Mail Id");
                return;
            }  


    
    // 3. SET the data into your JSON Model first (as requested)
    oJson.setProperty("/user/Email", userId);
    oJson.setProperty("/user/Password", password);

    // 4. GET the payload from the JSON Model
    var oPayload = oJson.getProperty("/user");

    // 5. Trigger the OData Create
    oDataModel.create("/LoginSet", oPayload, {
        success: function(data) {
            // Data contains 'Role' and 'Msg' from the backend
            sap.m.MessageToast.show("Status: " + data.Msg);

            if (data.Role === "Admin") {
                that.getOwnerComponent().getRouter().navTo("RouteReg");
            } else {
                that.getOwnerComponent().getRouter().navTo("RouteReg");
            }
        },
        error: function(oError) {
            try {
                var sErrorMsg = JSON.parse(oError.responseText).error.message.value;
                MessageBox.error("Login Failed: " + sErrorMsg);
            } catch (e) {
                MessageBox.error("Connection Error");
            }
        }
    });



        },
        onSignup: function(){
            var oRoute = this.getOwnerComponent().getRouter();
            oRoute.navTo("RouteReg");
        }
    });
});