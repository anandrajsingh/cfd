import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();


const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (email: string, token: string) => {
    const magiclink = `${process.env.URL}/signin/post?token=${token}`;

    await resend.emails.send({
        from : `${process.env.RESEND_API_EMAIL}`,
        to : email,
        subject: "Confirm Your Email",
        html: `<p>Click <a href="${magiclink}">here</a> to confirm your email</p>`
    })
}