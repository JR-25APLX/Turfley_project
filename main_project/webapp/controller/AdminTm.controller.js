sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/VBox"
], function (Controller, MessageBox, MessageToast, JSONModel, Dialog, Button, Input, Label, VBox) {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.AdminTm", {

        onInit: function () {
            this._aSelectedSlots = [];
            this._oTurfModel = new JSONModel({
                Name: "", Location: "", Locationurl: "", Type: "",
                Owner: "", Price: "", Cuky: "INR", Commission_Perc: ""
            });
            this.getView().setModel(this._oTurfModel, "turfModel");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdminTm").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            if (this.byId("turfEditSmartTable")) {
                this.byId("turfEditSmartTable").rebindTable();
            }
        },

        formatStatusSwitch: function (sStatus) {
            return sStatus === "Active" || sStatus === "A";
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            if (sKey === "Edit") { this.byId("turfEditSmartTable").rebindTable(); }
            if (sKey === "Approvals") { this.byId("approvalsSmartTable").rebindTable(); }
        },

        onStatusChange: function (oEvent) {
            var oSwitch = oEvent.getSource();
            var bState = oEvent.getParameter("state");
            var sNewStatus = bState ? "A" : "D";
            var sTurfId = oSwitch.getBindingContext().getProperty("TurfId");
            var sPath = "/TurfSet('" + sTurfId + "')";
            var oModel = this.getOwnerComponent().getModel();

            MessageBox.confirm("Change status to " + (bState ? "ACTIVE" : "DISABLED") + "?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.update(sPath, { Status: sNewStatus }, {
                            merge: true,
                            success: function () {
                                MessageToast.show("Status Updated!");
                                this.byId("turfEditSmartTable").rebindTable();
                            }.bind(this),
                            error: function () {
                                oSwitch.setState(!bState);
                                MessageToast.show("Update Failed!");
                            }
                        });
                    } else {
                        oSwitch.setState(!bState);
                    }
                }.bind(this)
            });
        },

        onEditTurf: function (oEvent) {
            var sTurfId = oEvent.getSource().getBindingContext().getProperty("TurfId");
            this.getOwnerComponent().getRouter().navTo("RouteAdminEditTurf", { turfId: sTurfId });
        },

        onApproveTurf: function (oEvent) {
            var sTurfId = oEvent.getSource().getBindingContext().getProperty("TurfId");
            this._sPendingApproveTurfId = sTurfId;
            var oDialog = this._getApprovalDialog();
            this._oCommissionInput.setValue("");
            this._oApproveBtn.setEnabled(false);
            oDialog.open();
        },

        _getApprovalDialog: function () {
            if (this._oApprovalDialog) { return this._oApprovalDialog; }
            this._oCommissionInput = new Input({
                type: "Number",
                liveChange: function (oEvent) {
                    var sVal = oEvent.getParameter("value").trim();
                    this._oApproveBtn.setEnabled(sVal !== "" && !isNaN(sVal) && parseFloat(sVal) >= 0);
                }.bind(this)
            });
            this._oApproveBtn = new Button({
                text: "Approve", type: "Accept", enabled: false,
                press: this._onConfirmApproval.bind(this)
            });
            this._oApprovalDialog = new Dialog({
                title: "Approve Turf",
                content: [new VBox({ items: [new Label({ text: "Commission Percent", design: "Bold" }), this._oCommissionInput] }).addStyleClass("sapUiSmallMargin")],
                beginButton: this._oApproveBtn,
                endButton: new Button({ text: "Cancel", press: function () { this._oApprovalDialog.close(); }.bind(this) })
            });
            this.getView().addDependent(this._oApprovalDialog);
            return this._oApprovalDialog;
        },

        _onConfirmApproval: function () {
            var sCommission = this._oCommissionInput.getValue().trim();
            var sTurfId = this._sPendingApproveTurfId;
            this.getOwnerComponent().getModel().update("/TurfSet('" + sTurfId + "')", {
                Status: "A", CommissionPercent: sCommission
            }, {
                merge: true,
                success: function () {
                    MessageToast.show("Approved!");
                    this._oApprovalDialog.close();
                    this.byId("approvalsSmartTable").rebindTable();
                    this.byId("turfEditSmartTable").rebindTable();
                }.bind(this)
            });
        },

        onAdd: function () {
            var oData = this._oTurfModel.getData();
            var oEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            var oUrlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

            if (!oData.Name || oData.Name.trim() === "") {
                MessageBox.error("Please enter the Turf Name!");
                return;
            }
            if (!oData.Location || oData.Location.trim() === "") {
                MessageBox.error("Please enter the Location!");
                return;
            }
            if (!oData.Locationurl || oData.Locationurl.trim() === "") {
                MessageBox.error("Please enter the Location URL!");
                return;
            }
            if (!oUrlRegex.test(oData.Locationurl.trim())) {
                MessageBox.error("Please enter a valid Location URL (e.g. https://maps.google.com/...)!");
                return;
            }
            if (!oData.Type || oData.Type.trim() === "") {
                MessageBox.error("Please select the Turf Type!");
                return;
            }
            if (!oData.Price || oData.Price === "") {
                MessageBox.error("Please enter the Price!");
                return;
            }
            if (isNaN(oData.Price) || parseFloat(oData.Price) < 250 || parseFloat(oData.Price) > 10000) {
                MessageBox.error("Price must be between ₹200 and ₹10000!");
                return;
            }
            if (isNaN(oData.Price) || parseFloat(oData.Price) <= 0) {
                MessageBox.error("Please enter a valid Price greater than 0!");
                return;
            }
            if (!oData.Owner || oData.Owner.trim() === "") {
                MessageBox.error("Please enter the Owner Email ID!");
                return;
            }
            if (!oEmailRegex.test(oData.Owner.trim())) {
                MessageBox.error("Please enter a valid Owner Email ID (e.g. owner@example.com)!");
                return;
            }
            if (!oData.Commission_Perc || oData.Commission_Perc === "") {
                MessageBox.error("Please enter the Commission Percentage!");
                return;
            }
            if (isNaN(oData.Commission_Perc) || parseFloat(oData.Commission_Perc) < 0) {
                MessageBox.error("Please enter a valid Commission Percentage!");
                return;
            }

            if (!this._aSelectedSlots || this._aSelectedSlots.length === 0) {
                MessageBox.error("Please add at least one time slot before adding the turf!");
                return;
            }

            var oPayload = {
                Name: oData.Name.trim(),
                Location: oData.Location.trim(),
                Locationurl: oData.Locationurl.trim(),
                Type: oData.Type.trim(),
                Owner: oData.Owner.trim(),
                Price: parseFloat(oData.Price).toFixed(2),
                Cuky: "INR",
                CommissionPercent: parseFloat(oData.Commission_Perc).toFixed(2),
                Status: "A",
                turf_slot_nav: this._aSelectedSlots
            };

            this.getOwnerComponent().getModel().create("/TurfSet", oPayload, {
                success: function () {
                    MessageToast.show("Turf added successfully!");
                    this._oTurfModel.setData({
                        Name: "", Location: "", Locationurl: "", Type: "",
                        Owner: "", Price: "", Cuky: "INR", Commission_Perc: ""
                    });
                    this._aSelectedSlots = [];
                }.bind(this),
                error: function (oError) { MessageBox.error("Error creating turf."); }
            });
        },

        onAddSlots: function () {
            if (!this._oDialog) {
                this.loadFragment({ name: "com.applexus.mainproject.fragments.EditSlot" }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(this._oDialog);
                    this._attachSlotToggleHandlers();
                    this._restoreSelectedSlots();
                    this._oDialog.open();
                }.bind(this));
            } else {
                this._restoreSelectedSlots();
                this._oDialog.open();
            }
        },

        onConfirmSlots: function () {
            var aSel = [];
            this._getGrid().getContent().forEach(function (oBtn) {
                if (oBtn.getType() === "Emphasized") {
                    var iH = parseInt(oBtn.data("startHour"));
                    aSel.push({
                        SlotId: "S" + (iH + 1 < 10 ? "00" + (iH + 1) : "0" + (iH + 1)),
                        StartTime: "PT" + (iH < 10 ? "0" + iH : iH) + "H00M00S",
                        EndTime: "PT" + (iH + 1 < 10 ? "0" + (iH + 1) : (iH + 1)) + "H00M00S"
                    });
                }
            });
            this._aSelectedSlots = aSel;
            this._oDialog.close();

            if (aSel.length > 0) {
                MessageToast.show(aSel.length + " slot(s) selected successfully!");
            } else {
                MessageToast.show("No slots selected. Please select at least one slot before adding the turf.");
            }
        },

        onCancelSlots: function () { this._oDialog.close(); },

        _getGrid: function () { return this._oDialog.getContent()[0].getItems()[1].getContent()[0]; },

        _attachSlotToggleHandlers: function () {
            this._getGrid().getContent().forEach(function (oBtn) {
                oBtn.attachPress(function () {
                    oBtn.setType(oBtn.getType() === "Emphasized" ? "Default" : "Emphasized");
                });
            });
        },

        _restoreSelectedSlots: function () {
            var aIds = (this._aSelectedSlots || []).map(function (s) { return s.SlotId; });
            this._getGrid().getContent().forEach(function (oBtn) {
                var iSlot = parseInt(oBtn.data("startHour")) + 1;
                var sId = "S" + (iSlot < 10 ? "00" + iSlot : "0" + iSlot);
                oBtn.setType(aIds.indexOf(sId) !== -1 ? "Emphasized" : "Default");
            });
        }
    });
});
