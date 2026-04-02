sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserMyBookings", {
        onInit() {
            var oModel1 = new sap.ui.model.json.JSONModel(); 
            oModel1.loadData("")

            this.getView().setModel(oModel1, "SampleData");

        }, 
        onTabSelect:function(oEvent){
            
            var sKey = oEvent.getParameter("key"); 
            var oTable = this.getView().byId("myBookings");
            var OBinding = oTable.getBinding("items");
            var oFilter = new sap.ui.model.Filter("Status" , sap.ui.model.FilterOperator.EQ, sKey);
            OBinding.filter([oFilter])
        }
 
    });
});