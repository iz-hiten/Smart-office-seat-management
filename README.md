# 🏢 HybridSeat - Smart Office Seat Management System

A modern, real-time office seat booking system designed for hybrid work environments. Built with React, TypeScript, Firebase, and Tailwind CSS.

## 📋 Overview

HybridSeat is a comprehensive seat management solution that helps organizations manage office space efficiently in a hybrid work model. The system supports batch-based rotation schedules, squad assignments, and both fixed and floater seating arrangements.

## ✨ Key Features

### 👥 User Management
- **Role-Based Access Control**: Admin and Employee roles with different permissions
- **Squad Assignment**: Organize employees into 8 squads (Alpha through Theta)
- **Batch System**: Two-batch rotation for designated office days
- **User Profiles**: Complete onboarding with squad and batch selection

### 🪑 Seat Management
- **50 Total Seats**: 40 fixed squad seats + 10 floater seats
- **Squad-Based Seating**: 5 dedicated seats per squad
- **Floater Seats**: Available for non-designated days
- **Visual Seat Grid**: Interactive floor plan with real-time availability
- **Color-Coded Status**: Easy identification of available, booked, and user seats

### 📅 Booking System
- **7-Day Advance Booking**: Book seats up to a week ahead
- **Designated Day Priority**: Priority access to squad seats on designated days
- **3 PM Rule**: Next-day bookings open after 3 PM
- **Real-Time Updates**: Instant booking status using Firebase Firestore
- **One-Click Booking/Cancellation**: Simple seat management

### 🛡️ Admin Panel
- **Overview Dashboard**: Real-time stats and today's bookings
- **User Management**: View and manage user roles
- **Seat Configuration**: Initialize and manage seat layouts
- **System Settings**: Configure rotation schedules and holidays
- **Booking Management**: Clear bookings and manage system data

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful frosted glass effects
- **Dark Theme**: Eye-friendly dark mode interface
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Toast Notifications**: Real-time feedback for user actions

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase account and project

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-office-seat-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**

Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key (optional)
```

4. **Set up Firestore Security Rules**

Deploy the rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

5. **Run the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (shadcn)
│   ├── AdminPanel.tsx   # Admin dashboard
│   ├── BookingDashboard.tsx  # User booking interface
│   └── SeatGrid.tsx     # Interactive seat layout
├── lib/
│   ├── date-utils.ts    # Date calculation utilities
│   └── utils.ts         # Helper functions
├── App.tsx              # Main app component
├── AuthContext.tsx      # Authentication context
├── Login.tsx            # Login page
├── Onboarding.tsx       # User onboarding
├── firebase.ts          # Firebase configuration
├── constants.ts         # App constants
└── types.ts             # TypeScript types
```

## 🎯 How It Works

### Batch Rotation System
- **Batch 1**: Office days on Mon-Wed (Week 1), Thu-Fri (Week 2)
- **Batch 2**: Office days on Thu-Fri (Week 1), Mon-Wed (Week 2)
- Rotation starts from a configured date (default: April 1, 2024)

### Booking Rules
1. **Designated Days**: Users can book their squad's fixed seats
2. **Non-Designated Days**: Users can only book floater seats
3. **Advance Booking**: Book up to 7 days in advance
4. **Next-Day Booking**: Opens after 3 PM for tomorrow
5. **One Seat Per Day**: Users can book one seat per day

### Admin Capabilities
- Initialize seat layout (40 fixed + 10 floater)
- Manage user roles (promote/demote admins)
- View all bookings and user data
- Clear booking history
- Configure system settings

## 🔐 Security

- Firebase Authentication for secure login
- Firestore security rules for data protection
- Role-based access control
- Client-side validation
- Server-side data validation via Firestore rules

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
The project includes a `vercel.json` configuration file for easy deployment:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Environment Variables
Make sure to set all environment variables in your deployment platform:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 🧪 Testing

Run type checking:
```bash
npm run lint
```

## 🎨 Design Highlights

- **Glassmorphism**: Modern frosted glass aesthetic
- **Gradient Accents**: Indigo to cyan color scheme
- **Micro-interactions**: Hover effects and smooth transitions
- **Visual Feedback**: Toast notifications and loading states
- **Accessibility**: Semantic HTML and ARIA labels

## 📈 Future Enhancements

- [ ] Email notifications for bookings
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Analytics dashboard for space utilization
- [ ] Mobile app (React Native)
- [ ] QR code check-in system
- [ ] Recurring booking patterns
- [ ] Team booking (book seats for entire squad)
- [ ] Desk amenities filter (standing desk, dual monitor, etc.)

## 🤝 Contributing

This is a portfolio project. Feedback and suggestions are welcome!

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 👨‍💻 Author

Built with ❤️ for modern hybrid workplaces

---

**Note**: This project demonstrates proficiency in React, TypeScript, Firebase, modern CSS, and building production-ready applications with clean architecture and user-centric design.
