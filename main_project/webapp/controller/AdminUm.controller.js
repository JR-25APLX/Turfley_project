sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminUm", {

        onInit: function () {
        },

        onBlockUnblock: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sUserId = oContext.getProperty("UserId");
            var sStatus = oContext.getProperty("Status");

            var sNewStatus = sStatus === "B" ? "A" : "B";
            var sAction = sStatus === "B" ? "Unblock" : "Block";

            MessageBox.confirm("Are you sure you want to " + sAction + " " + sUserId + "?", {
                onClose: function (sChoice) {
                    if (sChoice !== MessageBox.Action.OK) { return; }

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
                            MessageBox.error("Update failed.");
                        }
                    });
                }.bind(this)
            });
        }
    });
});