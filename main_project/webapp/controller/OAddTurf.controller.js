sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.OAddTurf", {

        // onInit — runs when page loads
    
        onInit: function() {

            var oTurfModel = new JSONModel({
                Id         : "",
                Name       : "",
                Location   : "",
                Locationurl: "",
                Type       : "",
                Owner      : "",
                Price      : "",
                Cuky       : "INR"    
            });

            // Attach model to view
            this.getView().setModel(oTurfModel, "turfModel");
        },

        onAdd: function() {
            var oTurfModel = this.getView().getModel("turfModel");
            var oData      = oTurfModel.getData();

  
            if (!oData.Id) {
                MessageBox.error("Turf ID cannot be empty!");
                return;
            }
            if (!oData.Name) {
                MessageBox.error("Turf Name cannot be empty!");
                return;
            }
            if (!oData.Location) {
                MessageBox.error("Location cannot be empty!");
                return;
            }
            if (!oData.Locationurl) {
                MessageBox.error("Location URL cannot be empty!");
                return;
            }
            if (!oData.Type) {
                MessageBox.error("Turf Type cannot be empty!");
                return;
            }
            if (!oData.Owner) {
                MessageBox.error("Owner ID cannot be empty!");
                return;
            }
            if (!oData.Price) {
                MessageBox.error("Price cannot be empty!");
                return;
            }
            if (!oData.Cuky) {
                MessageBox.error("Currency Key cannot be empty!");
                return;
            }

            var oODataModel = this.getOwnerComponent().getModel();
            var oTurfModelRef = oTurfModel;

 
            oODataModel.create("/TurfSet", oData, {

             
                success: function() {

              
                    MessageToast.show("Turf added successfully!");

 
                    oTurfModelRef.setData({
                        Id         : "",
                        Name       : "",
                        Location   : "",
                        Locationurl: "",
                        Type       : "",
                        Owner      : "",
                        Price      : "",
                        Cuky       : "INR"  
                    });
                },


                error: function(oError) {

                    var sMessage = "An error occurred.";

                    try {
                        // Parse backend error message
                        var oResponse = JSON.parse(oError.responseText);
                        // This is our ABAP ev_msg value
                        sMessage = oResponse.error.message.value;
                    } catch (e) {
                        sMessage = oError.message || sMessage;
                    }

                    // Show error in big popup
                    MessageBox.error(sMessage);
                }
            });
        }
    });
});