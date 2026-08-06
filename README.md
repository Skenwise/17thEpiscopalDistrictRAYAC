# RAYAC - 17th Episcopal District Youth & Children Ministry

## Project Overview

Two interconnected projects serving the AME Church youth ministry in Zambia:

| Project | Tech Stack | Purpose |
|---------|------------|---------|
| **Website** | React + Vite + Astro + TailwindCSS | Admin portal + Member portal |
| **Mobile App** | React Native + Expo | AME Church Hymn Book (678 hymns, English & Bemba) |

**Live Website:** https://17thdistrictrayac.org  
**Mobile App Package:** `app.rork.ame_church_hymn_book`

---

## Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Website Hosting | Firebase Hosting | Static site delivery |
| Database | Firebase Firestore | User data, events, payments history |
| Auth | Firebase Auth | Email/password authentication |
| File Storage | Firebase Storage | Gallery images, training materials |
| Payment API | DigitalOcean Droplet | Geepay mobile money processing |
| Payment Database | PostgreSQL (Droplet) | New payment records |
| SSL | Let's Encrypt | Free HTTPS for API |

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/           # Admin panel components
│   │   ├── portal/          # Member portal components
│   │   ├── pages/           # Page components
│   │   └── ui/              # Shared UI components
│   ├── lib/
│   │   └── firebase.ts      # Firebase configuration
│   ├── hooks/
│   │   ├── useMember.ts     # Member auth hook
│   │   └── useAdmin.ts      # Admin auth hook
│   └── pages/               # Astro pages
├── backend/
│   └── functions/           # Firebase Functions
├── public/
│   └── app/                 # PWA Hymn Book web version
├── firestore.rules          # Database security rules
├── storage.rules            # File storage security rules
└── firestore.indexes.json   # Database indexes
```

---

## Features

### Admin Portal
- Dashboard with real-time stats
- Members management (CRUD)
- Events management (CRUD + RSVPs)
- Training programs (in-person + e-learning)
- Training enrollments with status tracking
- Media gallery (multiple image upload)
- Store management
- Resources & downloads
- Prayer requests
- Volunteer applications
- Community forum
- Financial reports & analytics
- Contact form submissions
- Payment history (filtered by project)

### Member Portal
- Personal dashboard
- Event registration & RSVP
- Training enrollment
- My Learnings (e-learning courses)
- Giving history & offerings
- Media gallery (Firestore-connected)
- Resources download
- Community forum
- Profile management
- Premium upgrade banner

### Mobile App - AME Church Hymn Book
- 678 hymns in English & Bemba
- Free preview (first 10 hymns)
- Premium unlock (one-time payment via Geepay)
- Search & categories
- Dark/light mode
- Font size adjustment
- Call to Worship, Decalogue, Apostles' Creed
- Hymn of the Day (changes daily)
- Offline capable (PWA version)
- Sign in via website (deep link)
- Cross-platform: Android APK + PWA

---

## Payment Integration (Geepay)

### Flow
```
User → Website/App → Droplet API → Geepay → Mobile Money (MTN/Airtel)
                                          ↓
                                   Webhook → Droplet → PostgreSQL
```

### Payment Types
- Hymn Book (one-time unlock)
- Offerings (variable amount)
- Event registrations

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /rayac/payments/checkout` | Create payment session |
| `POST /rayac/payments/webhook` | Geepay callback |

---

## Authentication Flow (App ↔ Website)

1. App opens website sign-in page
2. User signs in with email/password (Firebase Auth)
3. Website redirects via deep link back to app
4. App handles auth callback
5. Premium status checked from Firestore

---

## Deployment

### Website
```bash
npm run build
firebase deploy --only hosting
```

### Firestore Rules
```bash
firebase deploy --only firestore
```

### Storage Rules
```bash
firebase deploy --only storage
```

### Mobile App (APK Build)
```bash
eas build --platform android --profile production
```

---

## Tech Stack

```
Frontend:    React 18 + Vite + Astro + TailwindCSS + Framer Motion
Backend:     Node.js + Express.js (droplet) + Firebase Functions
Database:    Firebase Firestore + PostgreSQL (droplet)
Auth:        Firebase Auth
Payments:    Geepay API (Zambia mobile money)
Storage:     Firebase Storage
Hosting:     Firebase Hosting + DigitalOcean Droplet
Mobile:      React Native + Expo (Android + PWA)
DevOps:      Docker + Docker Compose + Nginx + Let's Encrypt
```

---

## Fixes & Improvements

| Issue | Solution |
|-------|----------|
| Media upload stuck | Simplified upload method + storage rules |
| Enrollment status not updating | Fixed Firestore write permissions |
| Gallery not showing on portal | Connected to Firestore (removed hardcoded images) |
| PWA white screen on iPhone | Fixed asset paths |
| PWA sign-in redirect | Created dedicated PWA auth page |
| CORS errors on API | Added CORS headers to Nginx |
| Geepay payment failures | Fixed header placement per API docs |
| Cross-project payment leakage | Added project type filtering |
| Hymn of the Day static | Implemented daily rotation algorithm |
| Google Cloud costs | Migrated payments to DigitalOcean |

---

## License

This project is proprietary software developed for the 17th Episcopal District AME Church Youth Ministry.

---

**Built with ❤️ for the AME Church community in Zambia**
```
