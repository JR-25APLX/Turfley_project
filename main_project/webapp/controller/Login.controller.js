sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Login", {
        onInit() {
        },
        onLogin: function()
        {
         
            var userId = this.getView().byId("i1").getValue();
            var password = this.getView().byId("i2").getValue(); 
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            userId = userId.trim();
            password = password.trim();
 
            if (!userId || !password) {
                MessageToast.show("Please Enter both UserID and Password");
                return; 
            }

            if (!emailPattern.test(userId)) {
            sap.m.MessageToast.show("Please enter a valid email address");

            
            // if (!userId.endsWith("gmail.com")){
            //     MessageToast.show("Please Enter a Valid Mail Id")
            // }
            
        

        }
    });
});