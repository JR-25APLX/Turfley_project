sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Registration", {
        onInit() {
            var oJson = new JSONModel({
                user: { Name: "", Userid: "", Password: "", Phone: "", Role: "" }
            });
            this.getView().setModel(oJson);
        },
        onNameChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var nameRegex = /^[a-zA-Z\s]{3,}$/;

            if (!nameRegex.test(sValue)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Name must be at least 3 letters and contain no numbers/symbols");
            } else {
                oInput.setValueState("None");
            }
        },
        onEmailChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.(com|in|org|net|co\.in)$/;
            // var emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|org|net|co\.in)$/;

            if (!emailRegex.test(sValue)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Please enter a valid email address");
            } else {
                oInput.setValueState("None");
            }
        },
        onPasswordChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var passRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,15}$/;

            if (!passRegex.test(sValue)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Password must be minimum 8 and maximum 15 characters with at least one letter and one number");
            } else {
                oInput.setValueState("None");
            }
            this._validateConfirmPassword();
        },
        onConfirmPasswordChange: function () {
            this._validateConfirmPassword();
        },

        _validateConfirmPassword: function () {
            var oPass = this.getView().byId("i5");
            var oConf = this.getView().byId("i6");

            if (oConf.getValue() !== oPass.getValue()) {
                oConf.setValueState("Error");
                oConf.setValueStateText("Passwords do not match");
            } else if (oConf.getValue() === "") {
                oConf.setValueState("None");
            } else {
                oConf.setValueState("Success");
            }
        },
            onPhoneChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue().replace(/_/g, ""); // remove unfilled mask slots

                if (sValue.length < 10) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Please enter all 10 digits");
                } else if (!/^[6-9]/.test(sValue)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Mobile number must start with 6, 7, 8 or 9");
                } else {
                    oInput.setValueState("None");
                }
            },


        // onPhoneChange: function (oEvent) {
        //     var oInput = oEvent.getSource();
        //     var sValue = oInput.getValue();
        //     var phoneRegex = /^[0-9]{10,10}$/;

        //     if (!phoneRegex.test(sValue)) {
        //         oInput.setValueState("Error");
        //         oInput.setValueStateText("Phone number must be exactly 10 digits");
        //     } else {
        //         oInput.setValueState("None");
        //     }
        // },

        onRegister: function () {
            var oView = this.getView();
            var oDataModel = this.getOwnerComponent().getModel();


            var bValidationError = false;
            var aInputs = [oView.byId("i3"), oView.byId("i4"), oView.byId("i5"), oView.byId("i6"), oView.byId("i7")];

            aInputs.forEach(oInput => {
                if (oInput.getValueState() === "Error" || !oInput.getValue()) {
                    oInput.setValueState("Error");
                    bValidationError = true;
                }
            });

            var sRole = oView.byId("i8").getSelectedKey();
            if (!sRole) {
                MessageToast.show("Please select a Role");
                return;
            }

            if (bValidationError) {
                MessageBox.error("Please fix the errors in the form before registering.");
                return;
            }

            var oPayload = {
                Name: oView.byId("i3").getValue(),
                UserId: oView.byId("i4").getValue().trim().toLowerCase(),
                Password: oView.byId("i5").getValue().trim(),
                Phone: oView.byId("i7").getValue(),
                Role: sRole
            };

            oView.setBusy(true);
            oDataModel.create("/RegistrationSet", oPayload, {
                success: function (data) {
                    oView.setBusy(false);
                    MessageToast.show(data.Message);
                    this.getOwnerComponent().getRouter().navTo("RouteHome");
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    try {
                        var sEmsg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error("Registration Failed: " + sEmsg);
                    } catch (e) {
                        MessageBox.error("Connection Error");
                    }
                }
            });
        }
    });
});