import transporter from "@/lib/nodemailer";

const sendContactEmail=async(data)=>{
    const {fullName,email,projectCategory,detailMessage}=data;

    await transporter.sendMail({
        from:`"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
        to:process.env.EMAIL_TO,
        replyTo:email,
        subject:`New Contact Form Submission from ${fullName}`,
        html:`
            <h2>Contact Form Submission</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Project Category:</strong> ${projectCategory}</p>
            <p><strong>Message:</strong></p>
            <p>${detailMessage}</p>
        `
    })
}