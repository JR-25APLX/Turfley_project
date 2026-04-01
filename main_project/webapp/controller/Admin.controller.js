sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Admin", {

        onInit: function () {
            var oModel = this.getOwnerComponent().getModel();

            // Fetch CSRF token
            oModel.refreshSecurityToken(
                function () {
                    console.log("✅ CSRF Token fetched:", oModel.getSecurityToken());
                },
                function () {
                    console.log("❌ CSRF Token fetch failed");
                }
            );

            // Flag to block switch events during refresh
            this._bTableRefreshing = false;
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");

            if (sKey === "Edit") {
                var oTable = this.byId("turfEditTable");
                var oBinding = oTable.getBinding("items");

                if (oBinding) {
                    // Lock switches before refresh
                    this._bTableRefreshing = true;
                    console.log("Table refreshing — switches locked 🔒");

                    oBinding.refresh();

                    // Unlock after table finishes loading
                    oTable.attachEventOnce("updateFinished", function () {
                        this._bTableRefreshing = false;
                        console.log("Table finished — switches unlocked 🔓");
                    }.bind(this));
                }
            }
        },

        onStatusChange: function (oEvent) {

            // Block events during table refresh
            if (this._bTableRefreshing) {
                console.log("Blocked during refresh 🔒");
                return;
            }

            var oSwitch = oEvent.getSource();
            var bState = oEvent.getParameter("state");
            var sNewStatus = bState ? "A" : "D";

            var oContext = oSwitch.getBindingContext();
            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("Turf ID:", sTurfId);

            var sUpdatePath = "/TurfSet('" + sTurfId + "')";
            var oModel = this.getOwnerComponent().getModel();

            MessageBox.confirm(
                "Are you sure you want to " +
                (bState ? "ACTIVATE" : "DISABLE") +
                " this turf?",
                {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {

                            oModel.update(sUpdatePath, {
                                Status: sNewStatus
                            }, {
                                merge: true,

                                success: function () {
                                    console.log("✅ Update success!");
                                    MessageToast.show(
                                        bState
                                            ? "Turf Activated Successfully!"
                                            : "Turf Disabled Successfully!"
                                    );

                                    // ✅ Lock switches before refresh
                                    this._bTableRefreshing = true;

                                    // ✅ Refresh only table binding
                                    var oTable = this.byId("turfEditTable");
                                    oTable.getBinding("items").refresh();

                                    // ✅ Unlock after table re-renders
                                    oTable.attachEventOnce("updateFinished", function () {
                                        this._bTableRefreshing = false;
                                        console.log("Refresh done — unlocked 🔓");
                                    }.bind(this));

                                }.bind(this),

                                error: function (oError) {
                                    console.error("❌ Update failed:", oError.responseText);
                                    MessageToast.show("Update Failed! Please try again.");

                                    // ✅ Lock before reverting switch
                                    // Prevents revert from triggering other switches
                                    this._bTableRefreshing = true;
                                    oSwitch.setState(!bState);

                                    // Unlock after short delay
                                    setTimeout(function () {
                                        this._bTableRefreshing = false;
                                    }.bind(this), 500);

                                }.bind(this)
                            });

                        } else {
                            // ✅ Lock before reverting on cancel
                            this._bTableRefreshing = true;
                            oSwitch.setState(!bState);

                            // Unlock after short delay
                            setTimeout(function () {
                                this._bTableRefreshing = false;
                            }.bind(this), 500);
                        }

                    }.bind(this)
                }
            );
        },

        onEditTurf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("Edit clicked for:", sTurfId);
        }

    });
});