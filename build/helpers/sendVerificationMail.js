"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
async function sendVerificationEmail(email, username, verifyCode) {
    try {
        await resend.emails.send({
            from: `MysteryMessage <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mystery Message Verification Code',
            html: `<strong>hello ${username} <br/> Verificaton Code : ${verifyCode}</strong>`,
        });
        return { success: true, message: "Verification email sent" };
    }
    catch (emailError) {
        console.error("Error sending verification email", emailError);
        return { success: false, message: "Error sending verification email" };
    }
}
