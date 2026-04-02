sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
    ], (Controller, JSONModel, MessageToast, MessageBox) => {
        "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminDash", {
        onInit: function () {

            // JSON Data
            var oData = {
                activeUsers: 1234,
                blockedUsers: 56,
                owners: 120,
                turfs: 420,

                turfStatus: [
                    { type: "Active", count: 300 },
                    { type: "Disabled", count: 100 }
                ],

                turfTypes: [
                    { type: "Cricket", count: 200 },
                    { type: "Football", count: 150 },
                    { type: "Badminton", count: 50 }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);

            this._setChartProperties();
        },

        _setChartProperties: function () {

            var oStatusChart = this.byId("idStatusChart");
            var oTypeChart = this.byId("idTypeChart");

            oStatusChart.setVizProperties({
    plotArea: {
        colorPalette: ["#7FB3FF", "#FFD580"], 
        dataLabel: {
            visible: true,
            type: "percentage"
        }
    },
    legend: { visible: true }
});

oTypeChart.setVizProperties({
    plotArea: {
        colorPalette: ["#7FB3FF", "#A3E4D7", "#F9E79F"], 
        dataLabel: {
            visible: true,
            type: "value"
        }
    },
    legend: { visible: true }
});
        }
    });
});