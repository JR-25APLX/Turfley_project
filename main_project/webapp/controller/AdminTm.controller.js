sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminTm", {

        onInit: function () {
            // Flag to block switch events during re-render
            this._bTableRefreshing = false;
 
            var oModel = this.getOwnerComponent().getModel();
            oModel.refreshSecurityToken(
                function () {
                    console.log("Token fetched");
                },
                function () {
                    console.log(" Token failed");
                }
            );
 
            // Every time table finishes loading → set switch colors
            var oTable = this.byId("turfEditTable");
            oTable.attachUpdateFinished(function () {
                this._setSwitchStates();
            }.bind(this));
        },
 
        // ================================================
        // SET SWITCH COLORS MANUALLY
        // Called after every table load/refresh
        // ================================================
        _setSwitchStates: function () {
            // Lock — prevent change events while we set states
            this._bTableRefreshing = true;
            console.log("Setting switch states");
 
            var oTable = this.byId("turfEditTable");
            var aItems = oTable.getItems();
 
            aItems.forEach(function (oItem) {
                // Get Status from backend for this row
                var sStatus = oItem.getBindingContext()
                                   .getProperty("Status");
 
                // Get switch — index 7 (count your columns!)
                var oSwitch = oItem.getCells()[7];
 
                if (oSwitch) {
                    // Set green if "A", red if "D"
                    oSwitch.setState(sStatus === "A");
                    console.log("Turf status:", sStatus,
                                "Switch:", sStatus === "A");
                }
            });
 
            // Unlock after short delay
            // Delay needed because setState is async in UI5
            setTimeout(function () {
                this._bTableRefreshing = false;
                console.log("Switch states set — unlocked ");
            }.bind(this), 500);
        },
 
        // ================================================
        // TAB SELECT
        // ================================================
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
 
            if (sKey === "Edit") {
                var oTable = this.byId("turfEditTable");
                var oBinding = oTable.getBinding("items");
 
                if (oBinding) {
                    // Lock before refresh
                    this._bTableRefreshing = true;
                    console.log("Tab clicked — locked");
 
                    // Refresh table data
                    oBinding.refresh();
 
                    // _setSwitchStates will auto fire
                    // because attachUpdateFinished is set in onInit
                }
            }
        },
 
        // ================================================
        // STATUS CHANGE — Switch toggled by user
        // ================================================
        onStatusChange: function (oEvent) {
 
            // If table is refreshing — ignore this event
            if (this._bTableRefreshing) {
                console.log("Blocked — table refreshing");
                return;
            }
 
            var oSwitch = oEvent.getSource();
            var bState = oEvent.getParameter("state");
            var sNewStatus = bState ? "A" : "D";
 
            var oContext = oSwitch.getBindingContext();
            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("User toggled Turf:", sTurfId, "→", sNewStatus);
 
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
                                    console.log("Backend updated!");
                                    MessageToast.show(
                                        bState
                                            ? "Turf Activated Successfully!"
                                            : "Turf Disabled Successfully!"
                                    );
                                    // NO refresh at all!
                                    // Switch is already in correct state
                                    // User just toggled it manually
                                    // Backend is updated
                                    // Nothing else needed!
                                },
 
                                error: function (oError) {
                                    console.error(" Failed:", oError.responseText);
                                    MessageToast.show("Update Failed!");
 
                                    // Revert switch — lock first
                                    this._bTableRefreshing = true;
                                    oSwitch.setState(!bState);
                                    setTimeout(function () {
                                        this._bTableRefreshing = false;
                                    }.bind(this), 500);
                                }.bind(this)
                            });
 
                        } else {
                            // User cancelled — revert switch
                            this._bTableRefreshing = true;
                            oSwitch.setState(!bState);
                            setTimeout(function () {
                                this._bTableRefreshing = false;
                            }.bind(this), 500);
                        }
 
                    }.bind(this)
                }
            );
        },
 
        // ================================================
        // EDIT BUTTON
        // ================================================
        onEditTurf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sTurfId = oContext.getProperty("Turf_Id");
            console.log("Edit:", sTurfId);
        }
 
    });
});