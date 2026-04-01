sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/StandardListItem"
], (Controller, Filter, FilterOperator, StandardListItem) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserHome", {

        onInit() {
        },

        onMyBookings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMyBook");
        },

        onSearch: function(oEvent) { 
            var sValue = oEvent.getParameter("newValue");
            var oList  = this.getView().byId("t1");
            var oBnd   = oList.getBinding("items");

            if (!sValue) {
                oBnd.filter([]);
                return;
            }

            var oMaster = new Filter({
                filters: [
                    new Filter("Name",     FilterOperator.Contains, sValue),
                    new Filter("Location", FilterOperator.Contains, sValue),
                    new Filter("Type", FilterOperator.Contains, sValue)
                ],
                and: false
            });
            oBnd.filter([oMaster]);
        },

        onFilter: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();

            if (sKey === "location") {
                if (!this._oLocationDialog) {
                    this._oLocationDialog = new sap.m.SelectDialog({
                        title: "Filter by Location",
                        confirm: function (oEv) {
                            var sLocation = oEv.getParameter("selectedItem").getTitle();
                            this.byId("t1")
                                .getBinding("items")
                                .filter(new Filter("Location", FilterOperator.Contains, sLocation));
                        }.bind(this),
                        cancel: function () {
                            this._oLocationDialog.close();
                        }.bind(this),
                        items: [
                            new StandardListItem({ title: "Thiruvananthapuram" }),
                            new StandardListItem({ title: "Kollam" }),
                            new StandardListItem({ title: "Pathanamthitta" }),
                            new StandardListItem({ title: "Alappuzha" }),
                            new StandardListItem({ title: "Kottayam" }),
                            new StandardListItem({ title: "Idukki" }),
                            new StandardListItem({ title: "Ernakulam" }),
                            new StandardListItem({ title: "Thrissur" }),
                            new StandardListItem({ title: "Palakkad" }),
                            new StandardListItem({ title: "Malappuram" }),
                            new StandardListItem({ title: "Kozhikode" }),
                            new StandardListItem({ title: "Wayanad" }),
                            new StandardListItem({ title: "Kannur" }),
                            new StandardListItem({ title: "Kasaragod" })
                        ]
                    });
                    this.getView().addDependent(this._oLocationDialog);
                }
                this._oLocationDialog.open();

            } else if (sKey === "turfType") {
                if (!this._oTurfTypeDialog) {
                    this._oTurfTypeDialog = new sap.m.SelectDialog({
                        title: "Filter by Turf Type",
                        confirm: function (oEv) {
                            var sTitle = oEv.getParameter("selectedItem").getTitle();
                            var sCode  = sTitle === "Football" ? "F" :
                                         sTitle === "Cricket"  ? "C" : "B";
                            this.byId("t1")
                                .getBinding("items")
                                .filter(new Filter("Type", FilterOperator.EQ, sCode));
                        }.bind(this),
                        cancel: function () {
                            this._oTurfTypeDialog.close();
                        }.bind(this),
                        items: [
                            new StandardListItem({ title: "Football"  }),
                            new StandardListItem({ title: "Cricket"   }),
                            new StandardListItem({ title: "Badminton" })
                        ]
                    });
                    this.getView().addDependent(this._oTurfTypeDialog);
                }
                this._oTurfTypeDialog.open();
            }
        },

        onBookTurf: function (oEvent) {
            var tId = oEvent.getSource().getParent().getParent()
                          .getBindingContext().getProperty("Id");
            this.getOwnerComponent().getRouter().navTo("RouteBooking", { turfId: tId });
        },

        onMap: function (oEvent) {
            var sUrl = oEvent.getSource().getParent().getParent()
                           .getBindingContext().getProperty("Locationurl");
            window.open(sUrl, "_blank");
        }

    });
});