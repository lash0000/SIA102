const generateOTPEmail = (otp) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
            <p>Hello,</p>
            <p>Use the OTP below to complete your registration:</p>
            <h1 style="letter-spacing: 5px; text-align: center;">${otp}</h1>
            <p>This OTP is valid for a limited time. Do not share it with anyone.</p>
            <p>Thank you for choosing SIA102 Hotel Services.</p>
            <hr>
            <p style="font-size: 12px; color: #888;">If you didn't request this OTP, please ignore this email.</p>
        </div>
    `;
};

module.exports = { generateOTPEmail };