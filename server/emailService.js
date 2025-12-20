const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Email Templates
const emailTemplates = {
    verification: (verificationLink, userName) => ({
        subject: 'Verify Your Email Address',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                              color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #888; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Our Store! 🎉</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${userName || 'there'}!</h2>
                        <p>Thank you for registering with us. To complete your registration, please verify your email address by clicking the button below:</p>
                        <center>
                            <a href="${verificationLink}" class="button">Verify Email Address</a>
                        </center>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #8b5cf6;">${verificationLink}</p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Your Store. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    orderConfirmation: (order, items) => ({
        subject: `Order Confirmation - Order #${order.id}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .item { border-bottom: 1px solid #eee; padding: 15px 0; }
                    .item:last-child { border-bottom: none; }
                    .total { font-size: 20px; font-weight: bold; color: #8b5cf6; margin-top: 20px; }
                    .footer { text-align: center; color: #888; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Order Confirmed! ✅</h1>
                        <p>Order #${order.id}</p>
                    </div>
                    <div class="content">
                        <h2>Thank you for your order!</h2>
                        <p>We've received your order and will process it shortly.</p>
                        
                        <div class="order-info">
                            <h3>Order Details</h3>
                            ${items.map(item => `
                                <div class="item">
                                    <strong>${item.product_name}</strong><br>
                                    Quantity: ${item.quantity}<br>
                                    Price: $${item.price.toFixed(2)}
                                </div>
                            `).join('')}
                            <div class="total">
                                Total: $${order.total_amount.toFixed(2)}
                            </div>
                        </div>

                        <div class="order-info">
                            <h3>Shipping Information</h3>
                            <p>
                                ${order.full_name}<br>
                                ${order.address}<br>
                                ${order.city}, ${order.postal_code}<br>
                                ${order.country}<br>
                                Phone: ${order.phone}
                            </p>
                        </div>

                        <p>You'll receive another email when your order ships.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Your Store. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    orderStatusUpdate: (order, newStatus) => ({
        subject: `Order #${order.id} - Status Updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status { background: white; padding: 20px; border-radius: 5px; text-align: center; 
                              font-size: 24px; font-weight: bold; color: #8b5cf6; margin: 20px 0; }
                    .footer { text-align: center; color: #888; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Order Update 📦</h1>
                        <p>Order #${order.id}</p>
                    </div>
                    <div class="content">
                        <h2>Your order status has been updated</h2>
                        <div class="status">
                            ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                        </div>
                        <p>${getStatusMessage(newStatus)}</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Your Store. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    contactFormSubmission: (formData) => ({
        subject: `Contact Form: ${formData.subject}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .label { font-weight: bold; color: #8b5cf6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Contact Form Submission</h1>
                    </div>
                    <div class="content">
                        <div class="info">
                            <span class="label">From:</span> ${formData.name}
                        </div>
                        <div class="info">
                            <span class="label">Email:</span> ${formData.email}
                        </div>
                        <div class="info">
                            <span class="label">Subject:</span> ${formData.subject}
                        </div>
                        <div class="info">
                            <span class="label">Message:</span><br>
                            ${formData.message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    }),

    passwordReset: (resetLink, userName) => ({
        subject: 'Password Reset Request',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); 
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                              color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; color: #888; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request 🔐</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${userName || 'there'}!</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <center>
                            <a href="${resetLink}" class="button">Reset Password</a>
                        </center>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #8b5cf6;">${resetLink}</p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong><br>
                            This link will expire in 1 hour.<br>
                            If you didn't request a password reset, please ignore this email.
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 Your Store. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

function getStatusMessage(status) {
    const messages = {
        pending: 'Your order has been received and is awaiting processing.',
        processing: 'We are currently processing your order and preparing it for shipment.',
        shipped: 'Great news! Your order has been shipped and is on its way to you.',
        delivered: 'Your order has been delivered. We hope you enjoy your purchase!',
        cancelled: 'Your order has been cancelled. If you have any questions, please contact us.'
    };
    return messages[status] || 'Your order status has been updated.';
}

// Send email function
async function sendEmail(to, template) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️ Email not configured. Email would be sent to:', to);
        console.log('Subject:', template.subject);
        return { success: false, message: 'Email not configured' };
    }

    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Your Store" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: template.subject,
            html: template.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✓ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('✗ Email error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendEmail,
    emailTemplates
};
