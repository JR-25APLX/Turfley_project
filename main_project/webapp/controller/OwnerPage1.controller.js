sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerPage1", {
        onInit() {
        }, 
        onTabSelect: function(oEvent){
             
            var skey = oEvent.getParameter("key"); // Capturing Icon Clicked By the User, which will get stores in sKey

            var oEditSection = this.getView().byId("edit"); // Finding Edit Section by ID and Storing it in by OEditSection
            var oAddSection = this.getView().byId("add"); // Finding Add Section by ID and Storing it in by OAddSection

            var turfId = this.getView().byId(""

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