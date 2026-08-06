# RAYAC - 17th Episcopal District Youth & Children Ministry

## Project Overview

Two interconnected projects sharing the same Firebase backend, serving the AME Church youth ministry in Zambia:

| Project | Tech Stack | Purpose |
|---------|------------|---------|
| **Website** | React + Vite + Astro + TailwindCSS | Admin portal + Member portal |
| **Mobile App** | React Native + Expo | AME Church Hymn Book (678 hymns) |

**Live Website:** https://17thdistrictrayac.org  
**Mobile App Package:** `app.rork.ame_church_hymn_book`

---

## Architecture & Design Decisions

### Why Firebase + DigitalOcean Hybrid?

The project uses a hybrid infrastructure by design:

| Component | Host | Reason |
|-----------|------|--------|
| Website | Firebase Hosting | Free tier, global CDN, auto-SSL, zero maintenance |
| Auth | Firebase Auth | Free, secure, handles password reset/email verification out of the box |
| Firestore | Firebase | Real-time updates, offline support, free tier sufficient for current scale |
| Payments | DigitalOcean Droplet | Full control over payment processing, no cold starts, fixed cost |
| Payment DB | PostgreSQL | ACID compliance for financial transactions, relational integrity |

### Why Google Play Closed Testing Bypass?

The mobile app uses a **deep-link authentication flow** instead of an in-app login screen. This was intentional:
- Google Play requires paid apps to use Google Play Billing (30% fee)
- By having no login screen in the app, the app qualifies as "free"
- Users authenticate via the website, which processes payments via local mobile money (MTN/Airtel)
- After payment, a webhook unlocks premium content in the app
- This keeps the app free on Google Play while supporting local payment methods

### Why Astro + React Hybrid?

The website uses Astro for static pages (home, checkout) and React for interactive portals:
- **Astro pages:** Zero JavaScript shipped to the client for marketing pages (SEO-friendly)
- **React SPA:** Admin and member portals are fully interactive SPAs
- **Shared components:** UI components work in both Astro and React contexts

### Why PWA + Native APK?

The hymn book exists as both a native Android app and a PWA:
- **Native APK:** Full device integration, deep links, push notifications, Google Play distribution
- **PWA:** Instant access without app store, cross-platform (iOS Safari install), offline support
- Both share the same Firebase backend and auth system

---

## Authentication Flow

### The Deep Link Pattern

The app never handles passwords directly. Instead:

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile  │────▶│   Website    │────▶│   Firebase   │
│   App    │     │  /sign-in    │     │    Auth      │
└──────────┘     └──────────────┘     └──────────────┘
     ▲                   │
     │    deep link      │
     └───────────────────┘
    rayac-hymn://auth-callback
```

**Design rationale:**
- Passwords never touch the app (security)
- Google Play sees no login screen (free app classification)
- Single auth system for web + app (Firebase)
- Supports both native deep links and PWA redirects

### Premium Flow

```
Free User (10 hymns) → Sign In → Payment (one-time) → Webhook → premiumUnlocked = true → Full Access (678 hymns)
```

---

## Payment Architecture

### The Migration Story

Originally, payments ran on Google Cloud:
```
Client → Cloud Function → VPC Connector → Static IP → Geepay
```
Cost: ~$73/month (VPC connectors run 24/7)

Migrated to DigitalOcean:
```
Client → Nginx → Gateway → integrations-service → Geepay
                    ↓
              PostgreSQL (payment records)
```
Cost: Included in existing droplet

### Why the Migration Matters

- **Cold starts eliminated:** Cloud Functions had 2-5s cold starts; Docker services are always warm
- **Fixed cost:** Droplet is fixed price; Cloud Functions were per-invocation
- **Database ownership:** PostgreSQL on our own server vs Firestore limitations
- **Debugging:** Full access to logs, no black-box serverless functions

### Payment Flow Detail

```
1. Client POST /rayac/payments/checkout
   ├── Headers: x-project-id: rayac (required by gateway)
   ├── Auth: Bearer <Firebase JWT> (validated by gateway)
   └── Body: { email, phone, amount, productName, paymentMethod, productType }

2. integrations-service
   ├── Creates payment record in PostgreSQL (status: pending)
   ├── Obtains Geepay OAuth token
   └── Creates checkout session with:
       ├── X-Callback-URL header (webhook)
       ├── X-Transaction-Ref header (idempotency)
       └── Returns checkout_url to client

3. Client redirected to Geepay hosted checkout

4. User completes payment (MTN/Airtel mobile money)

5. Geepay webhook → Nginx → Gateway → integrations-service
   └── Updates PostgreSQL: status = success, completed_at = now()
```

---

## Database Design

### Firestore (NoSQL) - Existing Data
```
collections: users, events, trainings, enrollments, gallery_images,
             resources, store_items, prayer_requests, rsvps,
             volunteer_applications, forum_posts, forum_comments,
             donations, notifications, contact_submissions, payments
```

### PostgreSQL (SQL) - Payment Records
```sql
payments (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    phone TEXT,
    name TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ZMW',
    product_name TEXT,
    product_type TEXT,        -- 'hymn', 'offering', 'event', 'marriage'
    application_id TEXT,
    payment_method TEXT,      -- 'mobile', 'card'
    status TEXT DEFAULT 'pending',  -- 'pending', 'success', 'failed'
    checkout_url TEXT,
    transaction_ref TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_payments_email ON payments(email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_product_type ON payments(product_type);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

### Cross-Project Filtering
The `product_type` field enables multi-tenant payment processing:
- `'hymn'` → Hymn book purchases (Rayac)
- `'offering'` → Church offerings (Rayac)
- `'event'` → Event registrations (Rayac)
- `'marriage'` → UnionHub marriage applications (filtered out from Rayac views)

This allows the same payment infrastructure to serve multiple projects while keeping data separated at the application layer.

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/              # 14 admin components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── EventsAdmin.tsx
│   │   │   ├── MediaGalleryAdmin.tsx    # Multi-upload with progress
│   │   │   ├── TrainingsAdmin.tsx       # E-learning support
│   │   │   ├── EnrollmentsAdmin.tsx     # Status management
│   │   │   ├── ReportsAdmin.tsx         # Financial analytics
│   │   │   └── ...
│   │   ├── portal/             # 16 member components
│   │   │   ├── DashboardContent.tsx     # Real-time stats
│   │   │   ├── TrainingContent.tsx      # Video + materials
│   │   │   ├── MyLearnings.tsx          # E-learning progress
│   │   │   ├── GivingContent.tsx        # Payment history
│   │   │   ├── OfferingForm.tsx         # Mobile money donations
│   │   │   └── ...
│   │   ├── pages/              # Route pages
│   │   │   ├── SignInPage.tsx           # PWA-aware auth
│   │   │   ├── CheckoutPage.tsx         # Geepay integration
│   │   │   └── PwaAuthPage.tsx          # Dedicated PWA auth
│   │   └── ui/                 # Shared components
│   ├── lib/firebase.ts         # Firebase config
│   └── hooks/
│       ├── useMember.ts        # Auth state management
│       └── useAdmin.ts         # Admin role check
├── backend/functions/          # Firebase Functions
├── public/app/                 # PWA bundle
├── firestore.rules
├── storage.rules
└── firestore.indexes.json
```

---

## Mobile App Architecture

### Stack
- **Framework:** React Native (Expo)
- **Navigation:** Expo Router (file-based)
- **State:** React Context (app-context, auth-context)
- **Content:** 678 hymns stored in TypeScript modules
- **Languages:** English + Bemba (toggleable)

### Key Screens
```
app/
├── (tabs)/
│   ├── (home)/index.tsx        # Hymn list + search + categories
│   ├── call-to-worship.tsx     # Liturgical content
│   ├── decalogue.tsx           # Ten Commandments (EN/BEMBA)
│   ├── apostles-creed.tsx      # Apostles' Creed (EN/BEMBA)
│   └── settings/index.tsx      # Profile, theme, sign out
├── hymn/[id].tsx               # Single hymn view with lyrics
├── auth-callback.tsx           # Deep link handler
└── unlock.tsx                  # Premium purchase
```

### Premium System
- First 10 hymns: Always free (preview mode)
- Hymns 11-678: Require one-time payment
- Payment handled via website (Google Play policy compliance)
- Premium status: `users/{uid}.premiumUnlocked` in Firestore
- Free preview enforcement: Client-side with redacted content overlay

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

## DevOps

### Docker Services (Droplet)
| Service | Port | Purpose |
|---------|------|---------|
| Nginx | 80/443 | Reverse proxy + SSL termination |
| web-app-gateway | 3000 | Request validation + routing |
| app-api-gateway | - | Internal API routing |
| integrations-service | 3010 | Geepay integration + PostgreSQL |
| PostgreSQL | 5432 | Payment records |

### SSL & Domain
- **Domain:** Namecheap (17thdistrictrayac.org)
- **API Subdomain:** api.17thdistrictrayac.org → Droplet
- **SSL:** Let's Encrypt via Certbot (auto-renewing)
- **Website SSL:** Firebase-provided (auto-renewing)

---

## Key Technical Decisions

| Decision | Why |
|----------|-----|
| Hybrid hosting (Firebase + DO) | Free tier for web, fixed cost for payments |
| PWA + Native dual approach | Cross-platform reach + app store presence |
| Astro + React hybrid | SEO for marketing, SPA for portals |
| Deep link auth (no in-app login) | Google Play policy compliance, local payments |
| PostgreSQL for payments | ACID compliance, relational integrity |
| Docker Compose on single droplet | Simple deployment, easy to replicate |
| `product_type` filtering | Multi-tenant on single payment infrastructure |
| Client-side premium gating | Immediate UI response, no server round-trip |

---

## Deployment Commands

```bash
# Website
npm run build && firebase deploy --only hosting

# Firestore rules
firebase deploy --only firestore

# Storage rules
firebase deploy --only storage

# Mobile APK
eas build --platform android --profile production

# Droplet - rebuild payment service
docker build -t kabert-hub-integrations-service \
  -f ./api/integrations-service/Dockerfile \
  ./api/integrations-service
docker stop integrations-service && docker rm integrations-service
docker run -d --name integrations-service \
  --network kabert-hub_default -p 3010:3010 \
  --env-file /opt/kabert-hub/api/integrations-service/.env \
  kabert-hub-integrations-service
```

---

## Migration Progress

| Component | From | To | Status |
|-----------|------|----|--------|
| Payment Processing | Cloud Functions | DigitalOcean Droplet | ✅ Complete |
| Payment Database | Firestore | PostgreSQL | ✅ Complete |
| VPC Connectors | Google Cloud | N/A (removed) | ✅ Deleted |
| Static IPs | Google Cloud | N/A (removed) | ✅ Deleted |
| Cloud Routers | Google Cloud | N/A (removed) | ✅ Deleted |
| Auth | Firebase | Firebase | ⬜ Keeping |
| Web Hosting | Firebase | Firebase | ⬜ Keeping |
| Content DB | Firestore | Firestore | ⬜ Keeping |

**Cost savings:** ~$73/month eliminated from Google Cloud bill

---

## Known Fixes Applied

| Issue | Solution |
|-------|----------|
| Media upload stuck at 0% | Simplified to `uploadBytes`, fixed storage rules |
| Enrollment status not updating | Fixed Firestore write permissions |
| Gallery not showing on member portal | Connected to Firestore (removed hardcoded images) |
| PWA white screen on iPhone | Fixed asset paths to `/app/` prefix |
| PWA sign-in redirect loop | Created dedicated PWA auth page |
| CORS errors on API | Added CORS headers to Nginx |
| Geepay 402 errors | Fixed `X-Callback-URL` header placement |
| UnionHub payments in Rayac | Added `productType !== 'marriage'` filter |
| Hymn of the Day static | Changed to daily rotation by day of year |
| Sign out not working on app | Added confirmation dialog + Firebase signOut |

---

## Tech Stack Summary

```
Frontend:     React 18 + Vite + Astro + TailwindCSS + Framer Motion
Backend:      Node.js + Express.js (Droplet) + Firebase Functions
Database:     Firestore (NoSQL) + PostgreSQL (SQL)
Auth:         Firebase Auth (OAuth 2.0 JWT)
Payments:     Geepay API (Zambia MTN/Airtel Mobile Money)
Storage:      Firebase Storage
Hosting:      Firebase Hosting + DigitalOcean Droplet (Ubuntu 22.04)
Mobile:       React Native + Expo (Android + PWA)
DevOps:       Docker + Docker Compose + Nginx + Certbot
CI/CD:        Manual deployment + EAS Build
Monitoring:   Docker logs + Firebase Console
```

---

**Built for the 17th Episcopal District AME Church Youth Ministry**
