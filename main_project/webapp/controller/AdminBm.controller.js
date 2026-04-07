sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (Controller, Filter, FilterOperator, MessageBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminBm", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminBm").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // SmartTable auto-binds, so we just trigger a refresh if needed
            var oSmartTable = this.getView().byId("bookingsSmartTable");
            if (oSmartTable) {
                oSmartTable.rebindTable();
            }
        },

        // Triggered when Go is pressed or Tab is switched
        onBeforeRebindTable: function (oEvent) {
            var mParams = oEvent.getParameter("bindingParams");
            var sKey = this.getView().byId("bookingTabBar").getSelectedKey();
            var oToday = new Date();
            oToday.setHours(0, 0, 0, 0);

            if (sKey === "Active") {
                mParams.filters.push(new Filter("BookingDate", FilterOperator.GE, oToday));
            } else if (sKey === "Past") {
                mParams.filters.push(new Filter("BookingDate", FilterOperator.LT, oToday));
            }
        },

        onTabSelect: function () {
            this.getView().byId("bookingsSmartTable").rebindTable();
        },

        formatCancelEnabled: function (sStatus) {
            return sStatus === "Active";
        },

        onCancelBooking: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sBookingId = oContext.getProperty("BookingId");

            MessageBox.confirm("Are you sure you want to cancel Booking " + sBookingId + "?", {
                title: "Confirm Cancellation",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        this._processCancellation(sBookingId);
                    }
                }.bind(this)
            });
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
                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Cancellation failed.");
                }
            });
        },

        _fetchOriginalPaymentAndRefund: function (sBookingId, oView, oModel) {
            var oRefundPayload = { BookId: sBookingId, PaymentType: "R" };
            oModel.create("/PaymentSet", oRefundPayload, {
                success: function () {
                    oView.setBusy(false);
                    MessageBox.success("Refund initiated!", {
                        onClose: function () { oModel.refresh(); }
                    });
                }.bind(this),
                error: function () {
                    oView.setBusy(false);
                    MessageBox.warning("Refund creation failed.");
                }
            });
        }
    });
});