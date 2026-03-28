sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox" 
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("com.applexus.mainproject.controller.Registration", {
        onInit() {
            var oJson = new JSONModel();
            oJson.setData({
                user: {
                    Name: "",
                    Userid: "",
                    Password: "",
                    Phone: "",
                    Role: "" 
                }
            });
            this.getView().setModel(oJson);
        },

        onRegister: function() {
            debugger;
            var oJson = this.getView().getModel();
            var oDataModel = this.getOwnerComponent().getModel();
            var that = this;
            var fname    = this.getView().byId("i3").getValue();
            var mailId   = this.getView().byId("i4").getValue().trim().toLowerCase();
            var password = this.getView().byId("i5").getValue().trim();
            var cPassword= this.getView().byId("i6").getValue().trim();
            var phone    = this.getView().byId("i7").getValue();
            var role     = this.getView().byId("i8").getSelectedKey();
            if (!fname || !mailId || !password || !cPassword || !phone || !role) {
                MessageToast.show("Please Enter values in all fields");
                return;
            }
            var emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|org|net|co\.in)$/;
            if (!emailRegex.test(mailId)) {
                MessageToast.show("Please Enter a Valid Email Id");
                return;
            }
            if (password !== cPassword) {
                MessageToast.show("Both Passwords must Match");
                return;
            }
            var phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                MessageToast.show("Please Enter a Valid 10-digit Phone Number");
                return;
            }
            oJson.setProperty("/user/Name",     fname);
            oJson.setProperty("/user/Userid",   mailId);
            oJson.setProperty("/user/Password", password);
            oJson.setProperty("/user/Phone",    phone);
            oJson.setProperty("/user/Role", role);
            var oPayload = oJson.getProperty("/user");

            oDataModel.create("/RegistrationSet", oPayload, {
                success: function() {
                    MessageToast.show("Registration Successful!");
                    that.getOwnerComponent().getRouter().navTo("RouteLogin");
                },
                error: function(oError) {
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