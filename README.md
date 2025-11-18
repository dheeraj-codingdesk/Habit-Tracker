# Tiny SaaS Habit Tracker

A minimal, one-feature habit tracker that focuses on simplicity and clean execution.

## Features

✅ **Create Habits** - Add habits with names and descriptions  
✅ **Track Streaks** - Automatic streak counting when you mark habits complete  
✅ **Weekly Reports** - Generate and view weekly progress reports  
✅ **Premium Themes** - Dark mode and colorful themes via Stripe payments  
✅ **Clean Design** - Modern, responsive UI with smooth animations  

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd tiny-habit-tracker
   npm install
   ```

2. **Configure Stripe** (Optional)
   - Add your Stripe publishable key to `app.js`
   - Add your Stripe secret key to `server.js`
   - Replace with test keys for development

3. **Run the App**
   ```bash
   npm start
   ```
   Visit `http://localhost:3000`

## How It Works

### Habit Creation
- Simple form to add habits with name and description
- Habits are stored in localStorage (no database needed)
- Clean, card-based display

### Streak Tracking
- Click "Mark Complete" to log habit completion
- Streaks automatically calculated based on consecutive days
- Resets if you miss a day

### Weekly Reports
- Generates summary of all habits and their weekly progress
- Shows current streaks and completion counts
- Simulates email generation (backend integration ready)

### Premium Themes
- Dark mode and colorful themes available for $5 each
- Stripe integration for secure payments
- Themes persist across sessions

## File Structure

```
tiny-habit-tracker/
├── index.html      # Main HTML structure
├── styles.css      # All styling and themes
├── app.js         # Frontend JavaScript logic
├── server.js      # Backend API (Stripe + email)
├── package.json   # Node.js dependencies
└── README.md      # This file
```

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **Payments**: Stripe
- **Storage**: localStorage (frontend), configurable backend
- **Email**: Nodemailer (configure with your email service)

## Configuration

### Stripe Setup
1. Get your Stripe keys from [stripe.com](https://stripe.com)
2. Add publishable key to `app.js` line 4
3. Add secret key to `server.js` line 6

### Email Setup
1. Configure nodemailer in `server.js` with your email service
2. Add your email credentials to the transporter config
3. Test the `/send-weekly-report` endpoint

## Demo Mode

The app works in demo mode without Stripe/email configuration:
- Themes activate locally for testing
- Reports generate in-browser
- All core functionality works offline

## Production Deployment

1. Set up proper environment variables
2. Configure email service
3. Set up Stripe webhook endpoints
4. Deploy to your preferred hosting service

## License

MIT License - Feel free to use and modify as needed.