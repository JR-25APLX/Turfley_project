sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.UserMyBookings", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteUserBooking")
                .attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            var sUserId = localStorage.getItem("userId");
            if (!sUserId) {
                MessageBox.warning("Session expired. Please login again.");
                this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
                return;
            }
            this.byId("myBookingsSmartTable").rebindTable();
        },
        onTabSelect: function () {
            this.byId("myBookingsSmartTable").rebindTable();
        },

        onRebindTable: function (oEvent) {
            var sUserId = localStorage.getItem("userId");
            var sPath = "/ZIB18_GRP1_USERBOOKINGS(p_user_id='" + sUserId + "')/Set";
            oEvent.getSource().setTableBindingPath(sPath);

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

        formatCancelEnabled: function (sStatus) {   //disabling cancel button
            return sStatus === "Confirmed";
        },
        onCancel: function (oEvent) {
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
                    MessageBox.success("Booking " + sBookingId + " cancelled. Refund initiated!", {
                        onClose: function () {
                            oModel.refresh();
                        }
                    });
                }.bind(this),
                error: function () {
                    oView.setBusy(false);
                    MessageBox.warning("Refund creation failed. Please contact support.");
                }
            });
        },

        onLocationPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sUrl = oContext.getProperty("LocationUrl");
            if (sUrl) {
                sap.m.URLHelper.redirect(sUrl, true);
            } else {
                MessageToast.show("No URL Provided");
            }
        }
    });
});