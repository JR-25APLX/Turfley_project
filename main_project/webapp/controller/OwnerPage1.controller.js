sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OwnerPage1", {
        onInit() {
             var oTurfModel = new sap.ui.model.json.JSONModel({
                Id: "", 
                Name: "", 
                Location: "", 
                Locationurl: "", 
                Type: "", 
                Owner: "", 
                Price: "", 
                Cuky: "INR"                
             })

             this.getView().setModel(oTurfModel, "turfModel")

        }, 
        onTabSelect: function(oEvent){
             
            var skey = oEvent.getParameter("key");

            var oEditSection = this.getView().byId("edit"); 
            var oAddSection = this.getView().byId("add");      

            if (skey === "Edit"){
                oEditSection.setVisible(true);
                oAddSection.setVisible(false); 
              
            }else{
                oEditSection.setVisible(false);
                oAddSection.setVisible(true); 
            } 

        }, 
        onAdd: function()
        {
           debugger; 
           var oTurfModel = this.getView().getModel("turfModel"); 
           var oData = oTurfModel.getData(); 

            if (!oData.Id) {
                sap.m.MessageBox.error("Turf ID cannot be empty!");
                return;
            }
            if (!oData.Name) {
                sap.m.MessageBox.error("Turf Name cannot be empty!");
                return;
            }
            if (!oData.Location){
                sap.m.MessageBox.error("Location cannot be empty!"); 
                return;
            }
            if (!oData.Locationurl){
                sap.m.MessageBox.error("Location Url cannot be empty!"); 
                return;
            }
            if (!oData.Type) {
                sap.m.MessageBox.error("Type cannot be empty!");
                return;
            }
            if (!oData.Owner){
                sap.m.MessageBox.error("Owner Id cannot be empty!"); 
                return;
            }
            if (!oData.Price){
                sap.m.MessageBox.error("Price cannot be empty!"); 
                return;
            }
            if (!oData.Cuky){
                sap.m.MessageBox.error("Currency key cannot be empty!"); 
                return;
            }
            var oODataModel = this.getView().getModel();

            oODataModel.create("/TurfSet", oData, {

            
                success: function() {
                   MessageToast.show("Turf added successfully!");

                // Step 5 — Reset form after successful add
                oTurfModel.setData({
                            Id: "", 
                            Name: "", 
                            Location: "", 
                            Locationurl: "", 
                            Type: "", 
                            Owner: "", 
                            Price: "", 
                            Cuky: ""   

                });
                },

                // Step 6 — Error from backend
                error: function(oError) {
                var sMessage = "An error occurred.";
                try {
                    var oResponse = JSON.parse(oError.responseText);
                    sMessage = oResponse.error.message.value;
                } catch (e) {
                    sMessage = oError.message || sMessage;
                }
                    MessageBox.error(sMessage);
                }

  });


        }
    });
});