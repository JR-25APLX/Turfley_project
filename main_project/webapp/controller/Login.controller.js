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
            debugger; 
            var userId = this.getView().byId("i1").getValue();
            var password = this.getView().byId("i2").getValue(); 

            userId = userId.trim();
            password = password.trim();
 
            if (!userId || !password) {
                MessageToast.show("Please Enter both UserID and Password");
                return; 
            }
            
            if (!userId.endsWith("gmail.com")){
                MessageToast.show("Please Enter a Valid Mail Id")
            }           

        }
    });
});