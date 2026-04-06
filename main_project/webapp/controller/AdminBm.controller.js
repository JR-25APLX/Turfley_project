sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/ObjectNumber",
    "sap/m/ObjectStatus"
], function (Controller, Filter, FilterOperator, MessageBox, ColumnListItem, Text, Button, ObjectNumber, ObjectStatus) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminBm", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminBm").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var sPath = "/ZIB18_GRP1_AD_BOOKINGS";
            var oTable = this.getView().byId("bookingsTable");
            var oActionsColumn = this.getView().byId("actionsColumn");
            if (oActionsColumn) {
                oActionsColumn.setVisible(true);
            }

            oTable.bindItems({
                path: sPath,
                template: new ColumnListItem({
                    cells: [
                        new Text({ text: "{BookingId}" }),
                        new Text({ text: "{UserId}" }),
                        new Text({ text: "{TurfName}" }),
                        new Text({ text: "{Location}" }),
                        new Text({
                            text: {
                                path: "BookingDate",
                                type: "sap.ui.model.type.Date",
                                formatOptions: { style: "medium" }
                            }
                        }),
                        new ObjectNumber({
                            number: "{AmountPaid}",
                            unit: "{Currency}"
                        }),
                        new ObjectStatus({
                            text: "{Status}",
                            state: {
                                path: "Status",
                                formatter: this.formatStatusState.bind(this)
                            }
                        }),
                        new Button({
                            text: "Cancel",
                            type: "Emphasized",
                            press: this.onCancelBooking.bind(this),
                            enabled: {
                                path: "BookingDate",
                                formatter: this.isUpcoming.bind(this)
                            }
                        })
                    ]
                })
            });
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "Confirmed": return "Success";
                case "C":         return "Error";
                default:          return "None";
            }
        },

        formatCancelEnabled: function (sStatus) {
            return sStatus !== "C";
        },

        isUpcoming: function (sBookingDate) {
            if (!sBookingDate) return false;
            var oBookingDate = new Date(sBookingDate);
            var oToday = new Date();
            oToday.setHours(0, 0, 0, 0);
            oBookingDate.setHours(0, 0, 0, 0);
            return oBookingDate >= oToday;
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oTable = this.getView().byId("bookingsTable");
            var oBinding = oTable.getBinding("items");
            var oActionsColumn = this.getView().byId("actionsColumn");
            if (oActionsColumn) {
                oActionsColumn.setVisible(sKey === "Active");
            }

            if (!oBinding) return;

            var oToday = new Date();
            oToday.setHours(0, 0, 0, 0);

            var aFilters = [];
            if (sKey === "Active") {
                aFilters.push(new Filter("BookingDate", FilterOperator.GE, oToday));
            } else if (sKey === "Past") {
                aFilters.push(new Filter("BookingDate", FilterOperator.LT, oToday));
            }

            oBinding.filter(aFilters);
        },

        onCancelBooking: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sBookingId = oContext.getProperty("BookingId");

            MessageBox.confirm(
                "Are you sure you want to cancel Booking " + sBookingId,
                {
                    title: "Confirm Cancellation",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            this._processCancellation(sBookingId);
                        }
                    }.bind(this)
                }
            );
        },

        _processCancellation: function (sBookingId) {
            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel();
            oView.setBusy(true);

            oModel.update("/Booking_HeaderSet('" + sBookingId + "')", {
                Bookingid: sBookingId,
                Status: "C"
            }, {
                merge: true,
                success: function () {
                    this._fetchOriginalPaymentAndRefund(sBookingId, oView, oModel);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    var sMsg = "Cancellation failed.";
                    try {
                        sMsg = JSON.parse(oError.responseText).error.message.value;
                    } catch (e) { }
                    MessageBox.error(sMsg);
                }
            });
        },

        _fetchOriginalPaymentAndRefund: function (sBookingId, oView, oModel) {
            var oRefundPayload = {
                BookId: sBookingId,
                PaymentType: "R"
            };

            oModel.create("/PaymentSet", oRefundPayload, {
                success: function () {
                    oView.setBusy(false);
                    MessageBox.success(
                        "Booking " + sBookingId + " cancelled. Refund initiated!",
                        {
                            onClose: function () {
                                oModel.refresh();
                            }
                        }
                    );
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    var sMsg = "Refund creation failed. Please contact support.";
                    try {
                        sMsg = JSON.parse(oError.responseText).error.message.value;
                    } catch (e) { }
                    MessageBox.warning(sMsg);
                }
            });
        }

    });
});