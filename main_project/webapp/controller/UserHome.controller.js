sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/StandardListItem"
], (Controller, Filter, FilterOperator, JSONModel, StandardListItem) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserHome", {

        onInit: function () {
          
            var oFilterModel = new JSONModel(
                sap.ui.require.toUrl("com/applexus/mainproject/SampleData/FilterData.json")
            );
            this.getView().setModel(oFilterModel, "filterData");
        },

        onMyBookings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteUserBooking");
        },

        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("newValue");
            var oBnd   = this.getView().byId("t1").getBinding("items");

            
            var aFilters = [new Filter("Status_code", FilterOperator.EQ, "A")];

            if (sValue) {
                var oSearchFilter = new Filter({
                    filters: [
                        new Filter("Name",     FilterOperator.Contains, sValue),
                        new Filter("Location", FilterOperator.Contains, sValue),
                        new Filter("TurfType", FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                aFilters.push(oSearchFilter);
            }

            oBnd.filter(aFilters);
        },

        onFilter: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();

            if (sKey === "reset") {
     
                this.getView().byId("t1")
                    .getBinding("items")
                    .filter([new Filter("Status_code", FilterOperator.EQ, "A")]);
                return;
            }

            if (sKey === "location") {
                this._openFilterDialog(
                    "_oLocationDialog",
                    "Filter by Location",
                    "filterData>/locations",
                    function (oEv) {
                        var sLocation = oEv.getParameter("selectedItem").getTitle();
                        this._applyFilter("Location", FilterOperator.Contains, sLocation);
                    }.bind(this)
                );

            } else if (sKey === "turfType") {
                this._openFilterDialog(
                    "_oTurfTypeDialog",
                    "Filter by Turf Type",
                    "filterData>/turfTypes",
                    function (oEv) {
                        var sCode = oEv.getParameter("selectedItem")
                                       .getBindingContext("filterData")
                                       .getProperty("code");
                        this._applyFilter("TurfType", FilterOperator.EQ, sCode);
                    }.bind(this)
                );
            }
        },

        _openFilterDialog: function (sCacheKey, sTitle, sModelPath, fnConfirm) {
            if (!this[sCacheKey]) {
                this[sCacheKey] = new sap.m.SelectDialog({
                    title: sTitle,
                    confirm: fnConfirm,
                    cancel: function () {
                        this[sCacheKey].close();
                    }.bind(this),
                    items: {
                        path: sModelPath,
                        template: new StandardListItem({ title: "{filterData>title}" })
                    }
                });
                this.getView().addDependent(this[sCacheKey]);
            }
            this[sCacheKey].open();
        },

        _applyFilter: function (sField, oOperator, sValue) {
            var aFilters = [
                new Filter("Status_code", FilterOperator.EQ, "A"),
                new Filter(sField, oOperator, sValue)
            ];
            this.getView().byId("t1").getBinding("items").filter(aFilters);
        },

        onBookTurf: function (oEvent) {
            var oContext = oEvent.getSource().getParent().getBindingContext();
            var tId       = oContext.getProperty("TurfId");
            var tName     = oContext.getProperty("Name");
            var tLocation = oContext.getProperty("Location");

            this.getOwnerComponent().getRouter().navTo("RouteSlotSelect", {
                turfId      : tId,
                turfName    : tName,
                turfLocation: tLocation
            });
        },

        onMap: function (oEvent) {
            var sUrl = oEvent.getSource().getParent().getBindingContext().getProperty("LocationUrl");
            window.open(sUrl, "_blank");
        }

    });
});