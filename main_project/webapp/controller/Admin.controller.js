sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Admin", {

        onInit: function () {

        },

        // Fires when IconTabBar tab is changed
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");

            if (sKey === "Edit") {
                // Refresh the turf table when Edit tab is opened
                var oTable = this.byId("turfEditTable");
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh();
                }
            }
        },

        // Fires when the Switch is toggled
        onStatusChange: function (oEvent) {
            var oSwitch = oEvent.getSource();           
            var bState = oEvent.getParameter("state");  
            var sNewStatus = bState ? "A" : "D";        

            // Get which turf row was toggled
            var oContext = oSwitch.getBindingContext();
            var sPath = oContext.getPath(); // e.g. /ZIB18_GRP1_TURF_SLOT('T002')

            // Get OData model (connection to ABAP backend)
            var oModel = this.getView().getModel();

            // Show confirmation popup
            MessageBox.confirm(
                "Are you sure you want to " + (bState ? "ACTIVATE" : "DISABLE") + " this turf?",
                {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {

                            // ✅ Send PATCH to ABAP OData backend
                            oModel.update(sPath, {
                                Status: sNewStatus  // Sends "A" or "D"
                            }, {
                                success: function () {
                                    MessageToast.show(
                                        bState ? "Turf Activated Successfully!" : "Turf Disabled Successfully!"
                                    );
                                    oModel.refresh(); // Refresh table
                                },
                                error: function () {
                                    MessageToast.show("Update Failed! Please try again.");
                                    oSwitch.setState(!bState); // Revert switch on failure
                                }
                            });

                        } else {
                            // User clicked Cancel → revert switch back
                            oSwitch.setState(!bState);
                        }
                    }.bind(this)
                }
            );
        }

    });
});