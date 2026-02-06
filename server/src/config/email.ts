import nodemailer from 'nodemailer';

const EMAIL_PASS = process.env.EMAIL_PASSWORD as string;
const EMAIL_USER = process.env.EMAIL_USER as string;

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, resetUrl: string, fullName: string) => {
    const mailOptions = {
        from: `PeerPicks <${EMAIL_USER}>`,
        to,
        subject,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - PeerPicks</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            
            <!-- Preheader -->
            <div style="display: none; max-height: 0; overflow: hidden;">
                Reset your PeerPicks password - this link expires in 1 hour
            </div>
            
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0b10;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #13151f; border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.08);">
                            
                            <!-- Header with Logo -->
                            <tr>
                                <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                                    <h1 style="margin: 0; color: #D4FF33; font-size: 32px; font-weight: 800; letter-spacing: -1px;">
                                        PeerPicks
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    
                                    <!-- Greeting -->
                                    <h2 style="margin: 0 0 24px 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">
                                        Hi ${fullName},
                                    </h2>
                                    
                                    <!-- Main Message -->
                                    <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                                        We received a request to reset your password. Click the button below to create a new password for your PeerPicks account.
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td style="padding: 32px 0;">
                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                    <tr>
                                                        <td style="border-radius: 10px; background: linear-gradient(135deg, #D4FF33 0%, #bce830 100%); box-shadow: 0 4px 16px rgba(212, 255, 51, 0.25);">
                                                            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 48px; color: #000000; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 10px; letter-spacing: 0.3px;">
                                                                Reset Password
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Expiry Notice -->
                                    <div style="background-color: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; padding: 16px; border-radius: 8px; margin-bottom: 32px;">
                                        <p style="margin: 0; color: #fcd34d; font-size: 14px; line-height: 1.6;">
                                            <strong>⏱️ This link expires in 1 hour</strong> for your security. If it expires, you'll need to request a new password reset.
                                        </p>
                                    </div>
                                    
                                    <!-- Divider -->
                                    <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 32px 0;"></div>
                                    
                                    <!-- Security Notice -->
                                    <div style="background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; border-radius: 10px;">
                                        <p style="margin: 0 0 14px 0; color: #D4FF33; font-size: 15px; font-weight: 700; letter-spacing: 0.3px;">
                                            🔒 Security Information
                                        </p>
                                        <p style="margin: 0 0 12px 0; color: #cbd5e1; font-size: 14px; line-height: 1.7;">
                                            <strong style="color: #e2e8f0;">Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email. Your password won't be changed.
                                        </p>
                                        <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.7;">
                                            <strong style="color: #e2e8f0;">Keep it secure:</strong> Never share your password reset link with anyone. We'll never ask for your password via email.
                                        </p>
                                    </div>
                                    
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 32px 40px; background-color: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0 0 16px 16px;">
                                    <p style="margin: 0 0 18px 0; color: #ffffff; font-size: 15px; font-weight: 600; text-align: center;">
                                        Need Help?
                                    </p>
                                    <p style="margin: 0 0 14px 0; color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
                                        <strong style="color: #cbd5e1;">Probs</strong> - Owner/Admin
                                    </p>
                                    <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
                                        📧 <a href="mailto:sthapravesh2@gmail.com" style="color: #D4FF33; text-decoration: none;">sthapravesh2@gmail.com</a>
                                    </p>
                                    <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
                                        📞 <a href="tel:+9779824120601" style="color: #D4FF33; text-decoration: none;">+977 9824120601</a>
                                    </p>
                                    <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
                                        © 2026 PeerPicks. All rights reserved.<br>
                                        This is an automated message, please do not reply to this email.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                        
                        <!-- Outside Footer -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 24px auto 0;">
                            <tr>
                                <td style="padding: 0 20px; text-align: center;">
                                    <p style="margin: 0; color: #475569; font-size: 12px; line-height: 1.6;">
                                        You received this email because a password reset was requested for your account.<br>
                                        If you have concerns about your account security, please contact us immediately.
                                    </p>
                                </td>
                            </tr>
                        </table>
                        
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `,
    };

    await transporter.sendMail(mailOptions);
};