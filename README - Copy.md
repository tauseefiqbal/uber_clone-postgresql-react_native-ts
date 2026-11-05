# 🚖 Full-Stack React Native Uber Clone (iOS, Android & Web)

A modern, cross-platform ride-hailing application built with **Expo SDK 51**, **React Native**, **TypeScript**, **Expo Router**, **Clerk Authentication**, **Google Places API (New v1) & Routes API (v2)**, **Stripe Payments**, **Zustand**, **Neon Serverless PostgreSQL**, and **Tailwind CSS (NativeWind)**.

---

## 📑 Table of Contents

- [🚖 Full-Stack React Native Uber Clone (iOS, Android & Web)](#-full-stack-react-native-uber-clone-ios-android--web)
  - [📑 Table of Contents](#-table-of-contents)
  - [1. FEATURES](#1-features)
    - [1.1 Authentication & Onboarding](#11-authentication--onboarding)
    - [1.2 Maps, Places & Route Navigation](#12-maps-places--route-navigation)
    - [1.3 Ride Discovery & Driver Selection](#13-ride-discovery--driver-selection)
    - [1.4 Checkout & Stripe Payment Processing](#14-checkout--stripe-payment-processing)
    - [1.5 User Dashboard, Ride History & Cross-Platform Support](#15-user-dashboard-ride-history--cross-platform-support)
  - [2. TECH STACK](#2-tech-stack)
    - [2.1 Core Mobile & Web Framework](#21-core-mobile--web-framework)
    - [2.2 Styling, UI & State Management](#22-styling-ui--state-management)
    - [2.3 Maps, Geolocation & Routing APIs](#23-maps-geolocation--routing-apis)
    - [2.4 Authentication, Database & Payments](#24-authentication-database--payments)
    - [2.5 Build & Deployment Infrastructure](#25-build--deployment-infrastructure)
  - [3. DEPLOYMENT](#3-deployment)
    - [3.1 Live Web Application (APP URL)](#31-live-web-application-app-url)
    - [3.2 Deploying Web & API Routes to EAS Hosting](#32-deploying-web--api-routes-to-eas-hosting)
    - [3.3 Building Standalone Android APK & iOS Builds](#33-building-standalone-android-apk--ios-builds)
  - [4. TEST AND ADMIN USERS CREDENTIALS](#4-test-and-admin-users-credentials)
    - [4.1 Regular Test User Credentials](#41-regular-test-user-credentials)
    - [4.2 Admin User Credentials](#42-admin-user-credentials)
    - [4.3 Stripe Test Card Credentials](#43-stripe-test-card-credentials)
  - [5. HOW TO USE APP FOR REGULAR USER](#5-how-to-use-app-for-regular-user)
    - [5.1 Step 1: Onboarding & Sign Up / Sign In](#51-step-1-onboarding--sign-up--sign-in)
    - [5.2 Step 2: Set Pickup & Destination Location](#52-step-2-set-pickup--destination-location)
    - [5.3 Step 3: Select a Rider / Driver](#53-step-3-select-a-rider--driver)
    - [5.4 Step 4: Confirm Ride & Complete Payment](#54-step-4-confirm-ride--complete-payment)
    - [5.5 Step 5: View Recent Rides & Profile](#55-step-5-view-recent-rides--profile)
  - [6. HOW TO USE APP FOR ADMIN USER](#6-how-to-use-app-for-admin-user)
    - [6.1 Managing Users & Sessions (Clerk Admin)](#61-managing-users--sessions-clerk-admin)
    - [6.2 Managing Drivers & Rides (Neon PostgreSQL Admin)](#62-managing-drivers--rides-neon-postgresql-admin)
    - [6.3 Monitoring Payments & Refunds (Stripe Admin)](#63-monitoring-payments--refunds-stripe-admin)
    - [6.4 Managing Builds & Hosting (Expo / EAS Admin)](#64-managing-builds--hosting-expo--eas-admin)
  - [7. PROJECT ARCHITECTURE & FOLDER STRUCTURE](#7-project-architecture--folder-structure)
    - [7.1 Directory Layout](#71-directory-layout)
    - [7.2 Platform-Specific Modules](#72-platform-specific-modules)
  - [8. API ROUTES REFERENCE](#8-api-routes-reference)
    - [8.1 User & Driver Endpoints](#81-user--driver-endpoints)
    - [8.2 Ride Booking Endpoints](#82-ride-booking-endpoints)
    - [8.3 Stripe Payment Endpoints](#83-stripe-payment-endpoints)
  - [9. ENVIRONMENT VARIABLES](#9-environment-variables)
    - [9.1 Required `.env` Configuration](#91-required-env-configuration)
  - [10. LOCAL INSTALLATION & SETUP](#10-local-installation--setup)
    - [10.1 Prerequisites](#101-prerequisites)
    - [10.2 Installation & Running Locally](#102-installation--running-locally)

---

## 1. FEATURES

### 1.1 Authentication & Onboarding
- ✅ **Interactive Multi-Slide Onboarding Swiper** introducing ride discovery, booking, and tracking workflows.
- ✅ **Email & Password Registration and Sign-In** powered by Clerk (`@clerk/clerk-expo`) with automatic session persistence via `expo-secure-store`.
- ✅ **Google OAuth Single Sign-On (SSO)** for one-tap login across Android, iOS, and Web.
- ✅ **Smart Session Detection & Auto-Redirect** that automatically routes signed-in users straight to the Home dashboard and prevents duplicate sign-in errors.

### 1.2 Maps, Places & Route Navigation
- ✅ **Live GPS Geolocation Detection** using `expo-location` with reverse geocoding and automatic fallback coordinates when location permission is denied.
- ✅ **Google Places API (New v1) Autocomplete Search** (`places.googleapis.com/v1/places:autocomplete`) with real-time debounced place suggestions and coordinate resolution.
- ✅ **Google Routes API (v2) Directions & Polyline Rendering** (`routes.googleapis.com/directions/v2:computeRoutes`) for accurate driving paths, distance, and duration calculation.
- ✅ **Multi-Environment Map Rendering**:
  - ✅ Native Google Maps (`react-native-maps` with `PROVIDER_GOOGLE`) on standalone Android APK and iOS builds.
  - ✅ High-resolution Geoapify static map with Web Mercator route & marker projection fallback inside Android Expo Go.
  - ✅ Interactive embedded Google Map (`components/Map.web.tsx`) on Web without requiring restricted Embed API keys.

### 1.3 Ride Discovery & Driver Selection
- ✅ **Dynamic Driver Marker Generation** around the rider's pickup coordinates with real-time ETA and fare calculation based on route duration.
- ✅ **Multiple Ways to Select a Ride**:
  - ✅ Dedicated **"Select a Ride"** button on the Home screen.
  - ✅ **"Select Ride"** button on every past ride card in **Recent Rides** / **All Rides** to re-book a route in one click.
  - ✅ **"Select"** button, single-click highlight, and double-click quick-confirm on every driver card in the **Choose a Rider** screen.
- ✅ **Resilient Driver Fallback Data** (`defaultDrivers`) ensuring drivers, ratings, seat counts, and fares are always available even if the database is cold-starting.

### 1.4 Checkout & Stripe Payment Processing
- ✅ **Comprehensive Ride Summary Screen** displaying driver profile, rating, car image, fare price, pickup/dropoff times, seat capacity, and route addresses.
- ✅ **Native Stripe Payment Sheet** (`@stripe/stripe-react-native`) on iOS and Android for native card checkout.
- ✅ **Interactive Web Payment Information Modal** (`components/Payment.web.tsx`) asking for Cardholder Name, Email, Card Number, Expiration Date (`MM/YY`), CVC, and ZIP code, plus a one-click Stripe test card autofill option.
- ✅ **End-to-End Stripe PaymentIntent Creation & Confirmation** via serverless Expo API routes (`/(api)/(stripe)/create` and `/(api)/(stripe)/pay`).

### 1.5 User Dashboard, Ride History & Cross-Platform Support
- ✅ **Recent Rides & All Rides History** displaying static route thumbnails (via Geoapify), origin/destination addresses, date/time, driver info, car seats, and payment status badges (`paid`).
- ✅ **User Profile Management Screen** displaying Clerk user profile photo, first name, last name, email verification status, and phone number.
- ✅ **Full Cross-Platform Compatibility** running from a single codebase on **Android**, **iOS**, and **Web** (deployed on EAS Hosting).

---

## 2. TECH STACK

### 2.1 Core Mobile & Web Framework
- **Expo SDK 51** (`~51.0.22`)
- **React Native** (`0.74.5`) & **React Native Web** (`~0.19.10`)
- **Expo Router v3** (`~3.5.18`) for file-based client navigation and serverless API routes (`+api.ts`)
- **TypeScript** (`~5.3.3`)

### 2.2 Styling, UI & State Management
- **NativeWind** (`^2.0.11`) & **Tailwind CSS** (`3.3.2`) for utility-first styling across native and web
- **Zustand** (`^4.5.4`) for global reactive stores (`useLocationStore`, `useDriverStore`)
- **Gorhom Bottom Sheet** (`@gorhom/bottom-sheet`) for native gesture sheets & responsive Web scroll sheets
- **React Native Modal** (`react-native-modal`) & **React Native Swiper** (`react-native-swiper`)

### 2.3 Maps, Geolocation & Routing APIs
- **React Native Maps** (`1.14.0`) for native MapView, Marker, and Polyline rendering
- **Google Places API (New v1)** for location autocomplete and place coordinate lookup
- **Google Routes API (v2)** for route polylines and multi-waypoint travel duration computation
- **Geoapify Static Maps API** for ride history map thumbnails and Expo Go static map fallback
- **Expo Location** (`~17.0.1`) for device GPS permissions, coordinates, and reverse geocoding

### 2.4 Authentication, Database & Payments
- **Clerk** (`@clerk/clerk-expo`) for user authentication, session management, and Google OAuth
- **Neon Serverless PostgreSQL** (`@neondatabase/serverless`) for cloud relational storage of `users`, `drivers`, and `rides`
- **Stripe** (`stripe` Node SDK & `@stripe/stripe-react-native`) for payment intents, customer management, and card checkout

### 2.5 Build & Deployment Infrastructure
- **EAS Hosting** (`eas deploy`) for serverless web and API route hosting on Cloudflare Workers
- **EAS Build** (`eas build`) for cloud compilation of Android APK/AAB and iOS IPA binaries

---

## 3. DEPLOYMENT

### 3.1 Live Web Application (APP URL)
- 🌐 **APP URL (Production / Preview Web Deployment):**
  👉 **[https://tauseefiqbal-uber--5yhz8viyxi.expo.app/](https://tauseefiqbal-uber--5yhz8viyxi.expo.app/)** *(or your latest `eas deploy` alias URL)*

### 3.2 Deploying Web & API Routes to EAS Hosting
1. Export the static web bundle and serverless API functions to the `dist/` directory:
   ```powershell
   npx expo export --platform web
   ```
2. Deploy to EAS Hosting:
   ```powershell
   eas deploy
   ```
3. For a production deployment alias:
   ```powershell
   eas deploy --prod
   ```

### 3.3 Building Standalone Android APK & iOS Builds
1. Ensure EAS CLI is installed and authenticated:
   ```powershell
   npm install -g eas-cli
   eas login
   ```
2. Build an installable **Android APK** (`preview` profile in `eas.json`):
   ```powershell
   eas build -p android --profile preview
   ```
3. Build for **Production** (Android AAB / iOS IPA):
   ```powershell
   eas build --platform all --profile production
   ```

---

## 4. TEST AND ADMIN USERS CREDENTIALS

### 4.1 Regular Test User Credentials
You can sign in immediately using the pre-configured test account or register a new account on the **Sign Up** screen (email verification at sign-up is disabled for instant access):

| Field | Value |
| :--- | :--- |
| **Test User Email** | `testuser@uberclone.com` *(or sign up with any valid email address)* |
| **Test User Password** | `TestUser@12345` *(or any 8+ character password when creating a new account)* |
| **Alternative Login** | Click **"Log In with Google"** for instant Google OAuth sign-in |

### 4.2 Admin User Credentials
Administrative management is handled through the integrated cloud consoles for Authentication (Clerk), Database (Neon PostgreSQL), Payments (Stripe), and Hosting (Expo EAS):

| Admin Service | Portal / Access URL | Admin Identifier / Notes |
| :--- | :--- | :--- |
| **App Admin Account** | [App Login](https://tauseefiqbal-uber--5yhz8viyxi.expo.app/) | Email: `admin@uberclone.com` / Password: `AdminUser@12345` |
| **Clerk Auth Dashboard** | [https://dashboard.clerk.com](https://dashboard.clerk.com) | Instance: `choice-marmot-21.clerk.accounts.dev` |
| **Neon PostgreSQL Console** | [https://console.neon.tech](https://console.neon.tech) | Database: `uber_clone_db` (Region: `eastus2.azure.neon.tech`) |
| **Stripe Merchant Dashboard** | [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments) | Mode: **Test Mode** (`pk_test_51TnY3j...`) |
| **Expo / EAS Dashboard** | [https://expo.dev](https://expo.dev) | Account: `tauseefiqbal` / Project: `uber` (`f27da51e-34b4-4100-bf7c-dfcebfbe526c`) |

### 4.3 Stripe Test Card Credentials
When booking a ride and prompted for **Payment Information**, click the **"⚡ Click to autofill Stripe test card"** button or enter these test details manually:

| Field | Test Value |
| :--- | :--- |
| **Cardholder Name** | `Test Rider` |
| **Card Number** | `4242 4242 4242 4242` |
| **Expiry Date (MM/YY)** | `12/28` *(any future MM/YY)* |
| **CVC** | `424` *(any 3 digits)* |
| **ZIP / Postal Code** | `94103` |

---

## 5. HOW TO USE APP FOR REGULAR USER

### 5.1 Step 1: Onboarding & Sign Up / Sign In
1. Open the app via the [Live Web URL](https://tauseefiqbal-uber--5yhz8viyxi.expo.app/) or mobile app.
2. Swipe through the 3 onboarding screens or click **Skip** / **Get Started**.
3. On the **Create Your Account** or **Welcome** screen:
   - Enter your **Name**, **Email**, and **Password**, or click **Log In with Google**.
   - Upon authentication, you are redirected to the **Home** screen.

### 5.2 Step 2: Set Pickup & Destination Location
1. Allow location access when prompted (or let the app default to San Francisco, CA).
2. You can start a ride in **three ways**:
   - **Option A (Search Bar):** Type a destination in **"Where do you want to go?"** and click a suggested place from the dropdown (or press `Enter`).
   - **Option B (Direct Button):** Click the blue **"Select a Ride"** button below the search bar to open the **Ride** (`From` / `To`) screen.
   - **Option C (Recent Rides):** Scroll to **Recent Rides** and click the **"Select Ride"** button on any previous trip card to pre-fill its pickup and destination addresses.
3. On the **Ride** screen, verify your **From** and **To** addresses and click **"Find Now"**.

### 5.3 Step 3: Select a Rider / Driver
1. On the **Choose a Rider** screen, browse the available drivers along with their star ratings, estimated fare (`$`), travel time (`min`), and seat capacity (`seats`).
2. Select your preferred driver using any of these actions:
   - Click the **"Select"** button on the right side of a driver card to select that driver and proceed immediately to checkout.
   - Single-click a driver card to highlight it, then click the **"Select Ride"** button at the bottom.
   - Double-click any driver card to jump directly to the **Book Ride** screen.

### 5.4 Step 4: Confirm Ride & Complete Payment
1. Review your driver and trip summary on the **Book Ride** screen.
2. Click **"Confirm Ride"**:
   - **On Web:** The **Payment Information** modal opens. Click **"⚡ Click to autofill Stripe test card"** (or enter your card details manually) and click **"Pay $..."**.
   - **On Android / iOS:** The native Stripe Payment Sheet slides up. Enter the test card (`4242 4242 4242 4242`) and confirm payment.
3. Once payment succeeds, the **"Booking placed successfully"** confirmation modal appears. Click **"Back Home"**.

### 5.5 Step 5: View Recent Rides & Profile
1. Navigate using the bottom tab bar:
   - **Home Tab:** View your live map and top 5 most recent rides.
   - **Rides Tab:** View your complete ride history with payment status badges (`paid`) and route snapshots.
   - **Chat Tab:** View the in-app driver messaging placeholder screen.
   - **Profile Tab:** View your registered account details and email verification badge.
2. Click the **Sign Out** icon in the top-right corner of the Home screen to log out.

---

## 6. HOW TO USE APP FOR ADMIN USER

### 6.1 Managing Users & Sessions (Clerk Admin)
1. Log in to the [Clerk Dashboard](https://dashboard.clerk.com).
2. Navigate to **Users** to view, search, ban, or delete registered riders, reset passwords, or inspect active sessions.
3. Navigate to **User & Authentication → Email, Phone, Username** to toggle email verification requirements (`Verify at sign-up`) or configure **Social Connections (Google OAuth)**.

### 6.2 Managing Drivers & Rides (Neon PostgreSQL Admin)
1. Log in to the [Neon Console](https://console.neon.tech) and open the **SQL Editor** for `uber_clone_db`.
2. **Add or Update Drivers** in the `drivers` table:
   ```sql
   INSERT INTO drivers (first_name, last_name, profile_image_url, car_image_url, car_seats, rating)
   VALUES (
     'Alex',
     'Morgan',
     'https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/',
     'https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/',
     4,
     4.95
   );
   ```
3. **Audit All Ride Bookings** in the `rides` table:
   ```sql
   SELECT ride_id, origin_address, destination_address, fare_price, payment_status, created_at
   FROM rides
   ORDER BY created_at DESC;
   ```

### 6.3 Monitoring Payments & Refunds (Stripe Admin)
1. Open the [Stripe Test Payments Dashboard](https://dashboard.stripe.com/test/payments).
2. View real-time `PaymentIntent` transactions created via `/(api)/(stripe)/create` and confirmed via `/(api)/(stripe)/pay`.
3. Issue full or partial refunds, inspect customer records under **Customers**, or rotate API keys under **Developers → API keys**.

### 6.4 Managing Builds & Hosting (Expo / EAS Admin)
1. Open the [Expo Dashboard](https://expo.dev) and select the `uber` project.
2. Under **Hosting**, monitor web traffic, API function logs (`/(api)/user`, `/(api)/driver`, `/(api)/ride/create`, `/(api)/(stripe)/create`), and deployment aliases.
3. Under **Builds**, download compiled Android `.apk` / `.aab` artifacts and inspect Gradle build logs.

---

## 7. PROJECT ARCHITECTURE & FOLDER STRUCTURE

### 7.1 Directory Layout
```text
react-native-uber-clone/
├── app/
│   ├── (api)/                        # Serverless Expo Router API endpoints
│   │   ├── (stripe)/
│   │   │   ├── create+api.ts         # POST /(api)/(stripe)/create - Creates Customer & PaymentIntent
│   │   │   └── pay+api.ts            # POST /(api)/(stripe)/pay - Attaches PM & confirms PaymentIntent
│   │   ├── ride/
│   │   │   ├── [id]+api.ts           # GET /(api)/ride/:id - Fetches user's recent rides
│   │   │   └── create+api.ts         # POST /(api)/ride/create - Inserts a newly booked ride
│   │   ├── driver+api.ts             # GET /(api)/driver - Fetches available drivers
│   │   └── user+api.ts               # POST /(api)/user - Registers user in PostgreSQL
│   ├── (auth)/                       # Authentication screens (welcome, sign-in, sign-up)
│   ├── (root)/                       # Protected application screens
│   │   ├── (tabs)/                   # Bottom tab navigation (home, rides, chat, profile)
│   │   ├── find-ride.tsx             # Pickup & destination confirmation screen
│   │   ├── confirm-ride.tsx          # Driver selection screen
│   │   └── book-ride.tsx             # Ride summary & payment trigger screen
│   ├── _layout.tsx                   # Root layout with ClerkProvider & custom Jakarta Sans fonts
│   └── index.tsx                     # Entry auth gate redirecting to welcome or home
├── components/                       # Reusable UI & platform-specific components
├── constants/                        # Static assets, onboarding data & fallback drivers
├── lib/                              # Utilities (auth, db, fetch, map routes/polylines, utils)
├── store/                            # Zustand state stores (useLocationStore, useDriverStore)
└── types/                            # Global TypeScript definitions (type.d.ts, image.d.ts)
```

### 7.2 Platform-Specific Modules
To ensure seamless compatibility across Native (iOS/Android) and Web, the project uses platform file extensions automatically resolved by Metro:
- `components/Map.tsx` (Native iOS/Android map + Expo Go static map fallback) vs. `components/Map.web.tsx` (Web embedded interactive Google Map)
- `components/Payment.tsx` (Native Stripe PaymentSheet) vs. `components/Payment.web.tsx` (Web Payment Information modal)
- `components/StripeWrapper.tsx` (Native `<StripeProvider>`) vs. `components/StripeWrapper.web.tsx` (Web passthrough wrapper)

---

## 8. API ROUTES REFERENCE

### 8.1 User & Driver Endpoints
- **`POST /(api)/user`**: Inserts a new user (`name`, `email`, `clerkId`) into the `users` PostgreSQL table.
- **`GET /(api)/driver`**: Returns all available drivers from the `drivers` table (automatically falls back to `defaultDrivers` if the database is unreachable).

### 8.2 Ride Booking Endpoints
- **`GET /(api)/ride/[id]`**: Fetches all rides for a given Clerk `user_id` joined with driver metadata, ordered by `created_at DESC`.
- **`POST /(api)/ride/create`**: Creates a new ride record with `origin_address`, `destination_address`, coordinates, `ride_time`, `fare_price`, `payment_status`, `driver_id`, and `user_id`.

### 8.3 Stripe Payment Endpoints
- **`POST /(api)/(stripe)/create`**: Looks up or creates a Stripe Customer, creates an Ephemeral Key, and creates a `PaymentIntent` for the ride amount in USD cents.
- **`POST /(api)/(stripe)/pay`**: Attaches the payment method (or uses a test card token such as `pm_card_visa`) and confirms the `PaymentIntent`.

---

## 9. ENVIRONMENT VARIABLES

### 9.1 Required `.env` Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Google Maps, Places API (New v1) & Routes API (v2)
EXPO_PUBLIC_PLACES_API_KEY=AIzaSy...
EXPO_PUBLIC_DIRECTIONS_API_KEY=AIzaSy...

# Neon Serverless PostgreSQL
DATABASE_URL=postgresql://<user>:<password>@<host>/uber_clone_db?sslmode=require

# Expo Router API Origin
EXPO_PUBLIC_SERVER_URL=https://uber.com/

# Geoapify Static Maps
EXPO_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key

# Stripe Payments
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## 10. LOCAL INSTALLATION & SETUP

### 10.1 Prerequisites
- **Node.js** `v18+` or `v20+`
- **npm** or **yarn**
- **Expo Go** app on iOS/Android (SDK 51 compatible) or an Android Emulator / iOS Simulator

### 10.2 Installation & Running Locally
1. **Clone the repository and install dependencies:**
   ```powershell
   git clone <repository-url>
   cd react-native-uber-clone
   npm install
   ```
2. **Start the Expo development server:**
   ```powershell
   npx expo start -c
   ```
3. **Run on your target platform:**
   - Press `w` to open in the **Web browser** (`npm run web`).
   - Press `a` to open on **Android Emulator / Device** (`npm run android`).
   - Press `i` to open on **iOS Simulator** (`npm run ios`).

