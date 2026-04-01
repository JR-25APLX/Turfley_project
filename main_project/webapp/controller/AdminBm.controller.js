sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Bookings", {

        onInit: function () {
            var oModel = this.getOwnerComponent().getModel();

            oModel.refreshSecurityToken(
                function () {
                    console.log("CSRF Token fetched:", oModel.getSecurityToken());
                },
                function () {
                    console.log("CSRF Token fetch failed");
                }
            );

            this._bTableRefreshing = false;
        },
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");

            var sTableId = sKey === "Active" ? "activeBookingsTable" : "pastBookingsTable";
            var oTable   = this.byId(sTableId);
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                this._bTableRefreshing = true;
                oBinding.refresh();

                oTable.attachEventOnce("updateFinished", function () {
                    this._bTableRefreshing = false;
                }.bind(this));
            }
        },
        onCancelBooking: function (oEvent) {

            if (this._bTableRefreshing) {
                return;
            }

            var oContext    = oEvent.getSource().getBindingContext();
            var sBookingId  = oContext.getProperty("Booking_Id");
            var sUpdatePath = "/ActiveBookingsSet('" + sBookingId + "')";
            var oModel      = this.getOwnerComponent().getModel();

            MessageBox.confirm(
                "Are you sure you want to cancel booking " + sBookingId + "?",
                {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {

                            oModel.update(sUpdatePath, {
                                Status: "X"   // 'X' = Cancelled — update if your backend uses a different value
                            }, {
                                merge: true,

                                success: function () {
                                    MessageToast.show("Booking " + sBookingId + " cancelled successfully!");

                                    this._bTableRefreshing = true;

                                    var oTable = this.byId("activeBookingsTable");
                                    oTable.getBinding("items").refresh();

                                    oTable.attachEventOnce("updateFinished", function () {
                                        this._bTableRefreshing = false;
                                    }.bind(this));

                                }.bind(this),

                                error: function (oError) {
                                    console.error("Cancel failed:", oError.responseText);
                                    MessageToast.show("Cancellation failed! Please try again.");

                                    this._bTableRefreshing = false;
                                }.bind(this)
                            });

                        }
                    }.bind(this)
                }
            );
        }

    });
});