# RAYAC - 17th Episcopal District Youth & Children Ministry

## Project Overview

Two interconnected projects serving the AME Church youth ministry in Zambia:

| Project | Tech Stack | Purpose |
|---------|------------|---------|
| **Website** | React + Vite + Astro + TailwindCSS | Admin portal + Member portal |
| **Mobile App** | React Native + Expo | AME Church Hymn Book (678 hymns, English & Bemba) |

**Live Website:** https://17thdistrictrayac.org  
**Firebase Project:** `districtrayac`  
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

### Droplet Details
- **IP:** 164.90.227.4
- **API Domain:** `api.17thdistrictrayac.org`
- **Payment Endpoint:** `https://api.17thdistrictrayac.org/rayac/payments/checkout`
- **Webhook:** `https://api.17thdistrictrayac.org/rayac/payments/webhook`

---

## Project Structure

```
17thEpiscopalDistrictRAYAC/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin panel (14 files)
│   │   ├── portal/          # Member portal (16 files)
│   │   ├── pages/           # Page components
│   │   └── ui/              # Shared UI components
│   ├── lib/
│   │   └── firebase.ts      # Firebase configuration
│   ├── hooks/
│   │   ├── useMember.ts     # Member auth hook
│   │   └── useAdmin.ts      # Admin auth hook
│   └── pages/
│       ├── index.astro      # Home page
│       └── website-checkout.astro
├── backend/
│   └── functions/           # Firebase Functions (deprecated for payments)
├── public/
│   └── app/                 # PWA Hymn Book web version
├── firestore.rules          # Database security rules
├── storage.rules            # File storage security rules
└── firestore.indexes.json   # Database indexes
```

---

## Features

### Website - Admin Portal
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

### Website - Member Portal
- Personal dashboard
- Event registration & RSVP
- Training enrollment
- My Learnings (e-learning courses)
- Giving history & offerings
- Media gallery (from Firestore)
- Resources download
- Community forum
- Profile management
- Premium upgrade banner (for app users)

### Mobile App - AME Church Hymn Book
- 678 hymns in English & Bemba
- Free preview (first 10 hymns)
- Premium unlock (K50 one-time via Geepay)
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

### Configuration
- **Gateway:** https://gateway.mygeepay.com
- **Client ID:** `a17ca625-ca37-4d94-8d75-e4c22e04c414`
- **Product:** Hymn Book (K50), Offerings (variable)
- **Payment Method:** Mobile Money (MTN/Airtel), Card

### Droplet Services
| Service | Port | Purpose |
|---------|------|---------|
| Nginx | 80/443 | Reverse proxy + SSL |
| web-app-gateway | 3000 | Request validation |
| app-api-gateway | - | API routing |
| integrations-service | 3010 | Geepay integration |
| PostgreSQL | 5432 | Payment records |

---

## Database Schema (PostgreSQL - Payments)

```sql
payments
├── id (TEXT PRIMARY KEY)
├── email (TEXT NOT NULL)
├── phone (TEXT)
├── name (TEXT)
├── amount (DECIMAL)
├── currency (TEXT DEFAULT 'ZMW')
├── product_name (TEXT)
├── product_type (TEXT) -- 'hymn', 'offering', 'event', 'marriage'
├── payment_method (TEXT)
├── status (TEXT DEFAULT 'pending')
├── checkout_url (TEXT)
├── transaction_ref (TEXT)
├── created_at (TIMESTAMP)
└── completed_at (TIMESTAMP)
```

---

## Authentication Flow (App ↔ Website)

1. App opens `https://17thdistrictrayac.org/sign-in?source=app`
2. User signs in with email/password
3. Website redirects via deep link: `rayac-hymn://auth-callback`
4. App auth-callback handles the redirect
5. Premium check: `users/{uid}.premiumUnlocked`

---

## Deployment Commands

### Website
```bash
cd /home/skenwise/dbs/Desktop/Project/17thEpiscopalDistrictRAYAC
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
cd /home/skenwise/dbs/Desktop/Project/Mobile-Hymn-Book/gilbert_version/rork-ame-church-hymn-book
eas build --platform android --profile production
```

### Droplet Services
```bash
# Rebuild integrations-service
cd /opt/kabert-hub
docker build -t kabert-hub-integrations-service -f ./api/integrations-service/Dockerfile ./api/integrations-service
docker stop integrations-service && docker rm integrations-service
docker run -d --name integrations-service --network kabert-hub_default -p 3010:3010 --env-file /opt/kabert-hub/api/integrations-service/.env -e PORT=3010 kabert-hub-integrations-service

# View logs
docker logs -f integrations-service
```

---

## Key Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| Firebase Config | `src/lib/firebase.ts` | API keys, project ID |
| Storage Rules | `storage.rules` | File access permissions |
| Firestore Rules | `firestore.rules` | Database permissions |
| Droplet .env | `/opt/kabert-hub/api/integrations-service/.env` | Geepay credentials, DB URL |
| App Config | `app.json` | Expo configuration |
| Keystore | `keystore/release.keystore` | Android signing (pass: `Black99raiser%*`) |

---

## Known Issues & Fixes Applied

| Issue | Fix |
|-------|-----|
| Media upload stuck at 0% | Simplified to `uploadBytes`, added storage rules |
| Enrollment status not updating | Fixed Firestore write permissions |
| Gallery not showing on portal | Changed from hardcoded to Firestore fetch |
| PWA white screen on iPhone | Fixed asset paths to `/app/` prefix |
| PWA sign-in redirect loop | Created dedicated `/pwa-auth` page |
| CORS errors on API | Added CORS headers to Nginx |
| Geepay 402 errors | Fixed `X-Callback-URL` header placement |
| UnionHub payments in Rayac | Added `productType !== 'marriage'` filter |
| Hymn of the Day static | Changed to daily rotation by day of year |
| Sign out not working | Added confirmation dialog + Firebase signOut |

---

## Migration Progress (Google Cloud → DigitalOcean)

| Component | Status |
|-----------|--------|
| Payment Processing | ✅ Migrated to droplet |
| Payment Database | ✅ PostgreSQL on droplet |
| Geepay API Integration | ✅ Droplet integrations-service |
| Cloud Functions (Geepay) | ✅ Deleted |
| VPC Connectors | ✅ Deleted |
| Static IPs | ✅ Deleted |
| Firebase Auth | ⬜ Still on Firebase |
| Firestore | ⬜ Still on Firebase |
| Firebase Hosting | ⬜ Still on Firebase |
| Firebase Storage | ⬜ Still on Firebase |

---

## Support & Contact

- **Developer:** Sage Kona (`skndream2023@gmail.com`)
- **Project Owner:** Gilbert Mwanza (`pgilbertmwanza@gmail.com`)
- **Organization:** Kabert Records Hub Limited
- **Church:** 17th Episcopal District, AME Church
- **Phone:** +260 967 939 395
- **Domain:** 17thdistrictrayac.org (Namecheap)

---

## Tech Stack Summary

```
Frontend:    React 18 + Vite + Astro + TailwindCSS + Framer Motion
Backend:     Node.js + Express.js (droplet) + Firebase Functions (legacy)
Database:    Firebase Firestore + PostgreSQL (droplet)
Auth:        Firebase Auth (JWT)
Payments:    Geepay API (Zambia mobile money)
Storage:     Firebase Storage
Hosting:     Firebase Hosting + DigitalOcean Droplet
Mobile:      React Native + Expo (Android + PWA)
DevOps:      Docker + Docker Compose + Nginx + Let's Encrypt
```

---

**Last Updated:** July 25, 2026  
**Project Status:** Active - Production
