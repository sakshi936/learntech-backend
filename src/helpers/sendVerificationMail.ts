import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerificationEmail(email: string, username:string, verifyCode: string) {
    try {
        await resend.emails.send({
            from:`LearnTech <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'LearnTech Verification Code',
            html: `<strong>hello ${username} <br/> Verificaton Code : ${ verifyCode}</strong>`,
        });
        return {success: true, message: "Verification email sent"};      
    } catch (emailError) {
        console.error("Error sending verification email", emailError);
        return {success: false, message: "Error sending verification email"};
    }  
}