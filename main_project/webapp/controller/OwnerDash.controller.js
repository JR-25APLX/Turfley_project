sap.ui.define([
    "sap/ui/core/mvc/Controller",
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerDash", {
        onInit() {
            
        }, 
        onAdd: function()
        {
            this.getOwnerComponent().getRouter().navTo("RouteOAddTurf")
        }
    });
});