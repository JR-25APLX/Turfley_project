sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerPage1", {
        onInit() {
        }, 
        onTabSelect: function(oEvent){
             
            var skey = oEvent.getParameter("key");

            var oEditSection = this.getView().byId("edit"); 
            var oAddSection = this.getView().byId("add"); 

            var turfId = this.getView().byId("i8").getValue();
            

            if (skey === "Edit"){
                oEditSection.setVisible(true);
                oAddSection.setVisible(false); 
              
            }else{
                oEditSection.setVisible(false);
                oAddSection.setVisible(true); 
            }
        }
    });
});