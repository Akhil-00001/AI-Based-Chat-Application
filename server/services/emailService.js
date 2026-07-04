const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp, name) => {
  await transporter.sendMail({
    from: `"FWDP Chat" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Email",
    html: `
    <div style="
        font-family:Arial;
        max-width:600px;
        margin:auto;
        border:1px solid #eee;
        border-radius:12px;
        overflow:hidden;
    ">
    
        <div style="
            background:#4f9cff;
            color:white;
            padding:20px;
            text-align:center;
        ">
            <h2>FWDP Chat</h2>
        </div>

        <div style="padding:30px">

            <h3>Hello ${name}, 👋</h3>

            <p>
                Thanks for registering with FWDP Chat.
            </p>

            <p>
                Your email verification code is
            </p>

            <div style="
                font-size:36px;
                font-weight:bold;
                letter-spacing:8px;
                color:#4f9cff;
                text-align:center;
                margin:25px 0;
            ">
                ${otp}
            </div>

            <p>
                This code is valid for
                <strong>5 minutes.</strong>
            </p>

            <p>
                If you didn't request this,
                simply ignore this email.
            </p>

        </div>

        <div style="
            background:#f5f5f5;
            text-align:center;
            padding:15px;
            font-size:12px;
            color:#666;
        ">
            © FWDP Chat
        </div>

    </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
};