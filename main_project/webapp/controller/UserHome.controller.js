sap.ui.define([
    "sap/ui/core/mvc/Controller", 
    "sap/ui/model/Filter", 
    "sap/ui/model/FilterOperator"
], (Controller, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserHome", {
        onInit() {

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData("../SampleData/turf.json");
            this.getView().setModel(oModel, "SampleData");
        }, 
        onSearch: function(oControlEvent)
        {
            debugger; 
            var sValue = oControlEvent.getParameter("newValue"); // It Captures What User Enters 
            var oList = this.getView().byId("turfTable") 
            var Obinding = oList.getBinding("Turfs")
            

        }
    });
});