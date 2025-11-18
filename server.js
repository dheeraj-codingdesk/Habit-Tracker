// Simple Express server for Stripe integration and email functionality
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

const app = express();
const stripe = Stripe('sk_test_your_stripe_secret_key'); // Replace with your Stripe secret key

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create Stripe checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { theme, price } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`,
                            description: `Premium ${theme} theme for Tiny Habit Tracker`,
                        },
                        unit_amount: parseInt(price),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}?success=true&theme=${theme}`,
            cancel_url: `${req.headers.origin}?canceled=true`,
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Send weekly report email
app.post('/send-weekly-report', async (req, res) => {
    try {
        const { email, reportData } = req.body;
        
        // Create transporter (configure with your email service)
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com', // Replace with your email
                pass: 'your-app-password' // Replace with your app password
            }
        });

        const mailOptions = {
            from: 'Tiny Habit Tracker <your-email@gmail.com>',
            to: email,
            subject: 'Your Weekly Habit Report',
            html: `
                <h2>Weekly Habit Report</h2>
                <p>Here's your progress for the week:</p>
                ${reportData}
                <p>Keep up the great work!</p>
                <p>Best regards,<br>Tiny Habit Tracker</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the app`);
});