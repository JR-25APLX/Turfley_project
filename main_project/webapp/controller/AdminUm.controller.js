sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";
    return Controller.extend("com.applexus.mainproject.controller.AdminUm", {

        onInit: function () {},

        // Added formatter for Switch initial state
        formatStatusSwitch: function (sStatus) {
            return sStatus === "Active"; // "Active" = green ON, "Blocked" = red OFF
        },

        onBlockUnblock: function (oEvent) {
            var bState = oEvent.getParameter("state"); //  Get switch state
            var oContext = oEvent.getSource().getBindingContext();
            var sUserId = oContext.getProperty("UserId");
            var sNewStatus = bState ? "A" : "B"; //  true=Active, false=Blocked
            var sAction = bState ? "Unblock" : "Block";

            MessageBox.confirm("Are you sure you want to " + sAction + " " + sUserId + "?", {
                onClose: function (sChoice) {
                    if (sChoice !== MessageBox.Action.OK) {
                        //  Revert switch if user cancels
                        oEvent.getSource().setState(!bState);
                        return;
                    }
                    var oModel = this.getOwnerComponent().getModel();
                    oModel.update("/UserSet('" + sUserId + "')", {
                        Status: sNewStatus
                    }, {
                        merge: true,
                        success: function () {
                            MessageToast.show(sUserId + " has been " + sAction + "ed!");
                            this.getView().byId("userSmartTable").rebindTable();
                        }.bind(this),
                        error: function () {
                            //  Revert switch on error
                            oEvent.getSource().setState(!bState);
                            MessageBox.error("Update failed.");
                        }
                    });
                }.bind(this)
            });
        }
    });
});