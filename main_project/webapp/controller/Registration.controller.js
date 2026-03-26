sap.ui.define([
    "sap/ui/core/mvc/Controller", 
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Registration", {
        onInit() {
        }, 
        onRegister: function()
        {
            debugger; 
            var fname = this.getView().byId("i3").getValue();
            var mailId = this.getView().byId("i4").getValue(); 
            var password = this.getView().byId("i5").getValue();
            var cPassword = this.getView().byId("i6").getValue(); 
            var phone = this.getView().byId("i7").getValue(); 

            if (!fname || !mailId || !password || !cPassword){
                MessageToast.show("Please Enter the Values in all Mandatory Fields"); 
                return; 
            } 

            if (fname && mailId && password && cPassword){
                   
                if ( !mailId.endsWith("@gmail.com") )
                {
                   MessageToast.show("Please Enter a Valid Mail Id")
                }
                if ( password !== cPassword) 
                {
                    MessageToast.show("Both passwords must Match")
                }

            }








        }
    });
});