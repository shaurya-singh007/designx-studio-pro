════════════════════════════════════════════════════════════════
        TECHNICAL REQUIREMENTS DOCUMENT (TRD)
              DesignX Studio Pro
        Full-Stack AI Design Platform
              Version 1.0 | May 2026
════════════════════════════════════════════════════════════════


────────────────────────────────────────────────────────────────
1. SYSTEM ARCHITECTURE OVERVIEW
────────────────────────────────────────────────────────────────

1.1 Three-Tier Architecture
  - Frontend  : React SPA (Vite + Tailwind + Framer Motion + Three.js)
  - App Layer : Node.js/Express API + PHP Auth Service
  - Data Layer: MySQL 8 + Redis (sessions/cache)

1.2 Tech Stack Summary
  Layer       | Technologies
  ------------|------------------------------------------------------
  Frontend    | React 18, Vite, Tailwind CSS, Framer Motion, Three.js
  Canvas      | Fabric.js, html2canvas, jsPDF
  State       | Zustand
  Backend     | Node.js / Express, PHP 8
  Database    | MySQL 8.0, Redis
  Realtime    | Socket.io
  HTTP Client | Axios, React Query

1.3 External Services
  - OpenAI API      → Image generation (DALL-E 3) + Text (GPT-4)
  - Stripe          → Subscription management & payments
  - AWS S3          → Asset & file storage
  - CloudFront CDN  → Fast file delivery
  - SendGrid        → Transactional emails


────────────────────────────────────────────────────────────────
2. FRONTEND ARCHITECTURE
────────────────────────────────────────────────────────────────

2.1 Core Framework
  - React 18+ (component-based UI)
  - Vite (fast dev server + optimized builds)
  - React Router v6 (client-side routing)
  - Zustand (lightweight state management)

2.2 Styling & Animation
  - Tailwind CSS (utility-first)
  - Framer Motion (animations & transitions)
  - Three.js (3D effects & parallax)
  - CSS Variables (theming)

2.3 Canvas / Design Engine
  - Fabric.js      → canvas manipulation & drawing
  - Konva.js       → interactive layers (alternative)
  - html2canvas    → export canvas to image
  - jsPDF          → PDF generation

2.4 Folder Structure
  src/
  ├── components/     → Reusable UI (Button, Modal, Navbar, Card)
  ├── pages/          → Landing, Login, Editor, Dashboard
  ├── hooks/          → useEditor, useUser, useNotification
  ├── store/          → Zustand state stores
  ├── utils/          → API helpers, validators, formatters
  └── styles/         → Global CSS, Tailwind config, theme vars


────────────────────────────────────────────────────────────────
3. BACKEND ARCHITECTURE
────────────────────────────────────────────────────────────────

3.1 Node.js / Express API
  - RESTful API endpoints
  - Middleware: CORS, rate limiting, JWT auth
  - Logging: Winston + Morgan
  - WebSocket: Socket.io for real-time notifications

3.2 API Endpoints
  Method | Endpoint                  | Purpose              | Auth
  -------|---------------------------|----------------------|-----
  POST   | /auth/register            | Register user        | —
  POST   | /auth/login               | Login + get JWT      | —
  GET    | /api/designs              | List user designs    | JWT
  POST   | /api/designs              | Create new design    | JWT
  PUT    | /api/designs/:id          | Update design        | JWT
  DELETE | /api/designs/:id          | Delete design        | JWT
  POST   | /api/export               | Export to file       | JWT
  GET    | /api/templates            | Get templates        | JWT
  POST   | /api/ai/generate-image    | AI image generation  | JWT
  POST   | /api/ai/generate-text     | AI text generation   | JWT
  POST   | /api/subscription/upgrade | Upgrade plan         | JWT
  POST   | /api/webhooks/stripe      | Stripe webhook       | —

3.3 PHP Auth Service
  - User registration & login
  - bcrypt password hashing (rounds: 12)
  - JWT token generation (expires: 24h)
  - Session management via Redis
  - SQL injection protection (prepared statements)

3.4 Backend Folder Structure
  backend/
  ├── routes/         → Express route handlers
  ├── controllers/    → Business logic
  ├── middleware/     → Auth, validation, error handling
  ├── services/       → OpenAI, Stripe, AWS S3 clients
  ├── models/         → DB queries & schemas
  └── config/         → DB, env, API keys


────────────────────────────────────────────────────────────────
4. DATABASE SCHEMA (MySQL)
────────────────────────────────────────────────────────────────

4.1 users
  Column            | Type         | Constraints     | Default
  ------------------|--------------|-----------------|----------
  id                | INT          | PK, AUTO_INC    | —
  name              | VARCHAR(100) | NOT NULL        | —
  email             | VARCHAR(255) | UNIQUE NOT NULL | —
  password_hash     | VARCHAR(255) | NOT NULL        | —
  subscription_type | ENUM         | FREE/PRO/VIP    | FREE
  created_at        | TIMESTAMP    | —               | NOW()

4.2 designs
  Column      | Type         | Constraints  | Notes
  ------------|--------------|--------------|-------------------
  id          | UUID         | PK           | —
  user_id     | INT          | FK → users   | —
  name        | VARCHAR(255) | —            | Display name
  canvas_data | LONGTEXT     | JSON format  | Fabric.js JSON
  thumbnail   | VARCHAR(500) | —            | S3 URL
  category    | VARCHAR(50)  | —            | poster, logo etc.
  width       | INT          | —            | px
  height      | INT          | —            | px
  created_at  | TIMESTAMP    | —            | NOW()
  updated_at  | TIMESTAMP    | —            | ON UPDATE NOW()

4.3 templates
  Column       | Type         | Constraints  | Notes
  -------------|--------------|--------------|-------------------
  id           | INT          | PK           | —
  name         | VARCHAR(255) | —            | —
  category     | VARCHAR(50)  | INDEX        | —
  thumbnail    | VARCHAR(500) | —            | S3 URL
  canvas_data  | LONGTEXT     | JSON         | Fabric.js JSON
  available_for| ENUM         | FREE/PRO/VIP | —

4.4 subscriptions
  Column      | Type         | Constraints  | Notes
  ------------|--------------|--------------|-------------------
  id          | INT          | PK           | —
  user_id     | INT          | FK → users   | —
  stripe_id   | VARCHAR(100) | UNIQUE       | Stripe sub ID
  plan        | VARCHAR(20)  | —            | FREE/PRO/VIP
  status      | VARCHAR(20)  | —            | active/cancelled
  started_at  | TIMESTAMP    | —            | —
  expires_at  | TIMESTAMP    | —            | —

4.5 ai_credits
  Column       | Type      | Constraints | Notes
  -------------|-----------|-------------|-------------------
  id           | INT       | PK          | —
  user_id      | INT       | FK → users  | —
  balance      | INT       | DEFAULT 0   | Current credits
  refreshed_at | TIMESTAMP | —           | Last reset date


────────────────────────────────────────────────────────────────
5. AUTHENTICATION & AUTHORIZATION
────────────────────────────────────────────────────────────────

5.1 Auth Flow
  1. User registers with email & password
  2. Password hashed with bcrypt (rounds: 12)
  3. Record saved to MySQL
  4. On login, credentials verified
  5. JWT token generated (expires: 24h)
  6. Token stored in httpOnly cookie (secure mode)

5.2 Permission Levels
  Tier | Templates    | Exports              | AI Credits
  -----|--------------|----------------------|---------------
  FREE | Basic only   | Watermarked PNG/JPG  | 5 / month
  PRO  | All          | HD PNG/JPG/PDF/SVG   | 50 / month
  VIP  | All+Exclusive| 4K, all formats      | Unlimited (500 buffer)

5.3 Security
  - CORS: whitelisted origins only
  - Prepared statements (SQL injection prevention)
  - HTTPS enforced across all services
  - Rate limiting on /auth/* endpoints
  - JWT secret stored in env vars (never hardcoded)


────────────────────────────────────────────────────────────────
6. AI INTEGRATION
────────────────────────────────────────────────────────────────

6.1 OpenAI APIs Used
  - DALL-E 3  → Image generation from prompt
  - GPT-4     → Caption, headline, tagline generation
  - Remove.bg → Background removal (3rd-party API)

6.2 AI Credit Costs
  Action                 | Credits
  -----------------------|--------
  Generate image         | 10
  Generate text          | 1
  Remove background      | 5
  Auto-suggest layout    | 2

6.3 Credit Refresh Schedule
  - FREE : 5 credits reset on 1st of each month
  - PRO  : 50 credits reset on billing date
  - VIP  : Unlimited (500 soft cap, auto-refills)

6.4 Stripe Integration
  - Subscription plans via Stripe Checkout
  - Webhooks: payment_intent.succeeded, customer.subscription.deleted
  - One-time credit bundle purchases ($0.50 per 10 credits)
  - Automatic renewal handling

6.5 AWS S3 Storage
  - Bucket: designx-assets
  - Folders: /uploads (user assets), /exports (generated files)
  - CloudFront CDN for delivery
  - Presigned URLs for secure downloads (expire: 1 hour)


────────────────────────────────────────────────────────────────
7. FILE EXPORT SYSTEM
────────────────────────────────────────────────────────────────

7.1 Supported Formats
  Format | Library          | Free | Pro/VIP
  -------|------------------|------|--------
  PNG    | html2canvas      | ✓ (watermark) | ✓ 4K
  JPG    | html2canvas      | ✓ (watermark) | ✓ 4K
  PDF    | jsPDF            | ✗    | ✓
  SVG    | Fabric.js toSVG()| ✗    | ✓

7.2 Export Workflow
  1. User clicks Export
  2. Selects format + quality (HD / 4K)
  3. Canvas rendered via html2canvas
  4. Watermark applied if FREE user
  5. Converted to selected format
  6. Uploaded to AWS S3
  7. Presigned download URL returned

7.3 Export API Contract
  POST /api/export
  Request : { design_id, format: "png|jpg|pdf|svg", quality: "hd|4k" }
  Response: { download_url, expires_in: 3600 }


────────────────────────────────────────────────────────────────
8. UI/UX IMPLEMENTATION
────────────────────────────────────────────────────────────────

8.1 Custom Cursor Effect
  - Hide default cursor (cursor: none)
  - Render small dot + large ring via JS
  - Ring uses: mix-blend-mode: difference + white background
    → Everything inside ring inverts color automatically
  - Magnetic pull on hover over buttons/text
  - Ring expands on hoverable elements

8.2 Glassmorphism Components
  - backdrop-filter: blur(20px) saturate(180%)
  - background: rgba(255,255,255,0.06)
  - border: 1px solid rgba(255,255,255,0.12)
  - box-shadow: 0 8px 32px rgba(0,0,0,0.3)

8.3 3D Motion Effects
  - Mouse tilt: perspective() + rotateX/Y based on cursor pos
  - Cards: translate3d on hover (Framer Motion)
  - Floating elements: vertical oscillation + rotation
  - Hero 3D scene: Three.js particle field

8.4 Parallax System
  - useScroll() from Framer Motion
  - Layer speeds: BG 0.5x → Mid 0.75x → FG 1x
  - Applied to: landing page hero + dashboard header

8.5 Entrance Animations
  - Trigger: Intersection Observer (threshold: 0.15)
  - Effect: fadeIn + translateY(40px) → translateY(0)
  - Stagger delay: 0.1s per child element
  - Duration: 0.7s cubic-bezier(0.16, 1, 0.3, 1)

8.6 Infinite Carousel (Templates/Assets)
  - CSS animation: translateX loop
  - Pause on hover
  - Drag-to-scroll via pointer events
  - Clone first N items and append to end for seamless loop


────────────────────────────────────────────────────────────────
9. PROJECT STRUCTURE
────────────────────────────────────────────────────────────────

designx-studio-pro/                  ← Monorepo root
├── packages/
│   ├── frontend/                    ← React SPA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Editor/          ← Canvas, Toolbar, Layers
│   │   │   │   ├── UI/              ← Button, Modal, Card
│   │   │   │   └── Layout/          ← Navbar, Sidebar, Footer
│   │   │   ├── pages/
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Editor.jsx
│   │   │   ├── hooks/
│   │   │   ├── store/               ← Zustand stores
│   │   │   └── utils/
│   │   ├── vite.config.js
│   │   └── tailwind.config.js
│   │
│   ├── backend/                     ← Node.js API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── server.js
│   │
│   └── auth-service/                ← PHP Auth
│       ├── register.php
│       ├── login.php
│       ├── logout.php
│       └── config/db.php
│
├── database/
│   ├── schema.sql                   ← Full DB schema
│   ├── migrations/
│   └── seeds/                      ← Sample templates & data
│
├── docker-compose.yml               ← MySQL + Redis + PHP
├── .env.example
└── package.json                     ← Yarn workspaces root


────────────────────────────────────────────────────────────────
10. IMPLEMENTATION ROADMAP
────────────────────────────────────────────────────────────────

PHASE 1 — Foundation (Weeks 1–4)
  [ ] Monorepo setup (Yarn workspaces)
  [ ] Vite + React + Tailwind bootstrap
  [ ] MySQL schema + migrations
  [ ] PHP auth service (register/login/logout)
  [ ] JWT token flow + httpOnly cookie
  [ ] Landing page (hero + nav + basic sections)
  [ ] Login / Signup pages with animations

PHASE 2 — Core Editor (Weeks 5–10)
  [ ] Fabric.js canvas setup
  [ ] Left toolbar (Text, Shapes, Images, Icons, Upload)
  [ ] Right panel (Layers, Properties, Color picker)
  [ ] Top bar (Export, Save, Undo/Redo, Zoom)
  [ ] Template system (load canvas_data into Fabric)
  [ ] Node.js API (designs CRUD)
  [ ] Auto-save with debounce (2s delay → PUT /designs/:id)
  [ ] Dashboard (grid of user designs)

PHASE 3 — AI & Subscriptions (Weeks 11–14)
  [ ] Export system (PNG / JPG / PDF / SVG)
  [ ] Watermark logic for FREE users
  [ ] OpenAI DALL-E 3 image generation
  [ ] GPT-4 text/caption generation
  [ ] AI credit deduction system
  [ ] Stripe subscriptions + Checkout
  [ ] Stripe webhook handler
  [ ] Subscription gate on features

PHASE 4 — Polish & Deploy (Weeks 15–16)
  [ ] Three.js 3D hero scene
  [ ] Glassmorphism UI polish
  [ ] Custom cursor (mix-blend-mode)
  [ ] Parallax + scroll animations
  [ ] Infinite template carousel
  [ ] Performance audit (60fps target)
  [ ] Docker Compose for all services
  [ ] Vercel (frontend) + Railway/AWS (backend)
  [ ] CI/CD pipeline (GitHub Actions)
  [ ] Beta launch


────────────────────────────────────────────────────────────────
11. DEVELOPMENT SETUP
────────────────────────────────────────────────────────────────

11.1 Prerequisites
  - Node.js 18+ LTS
  - MySQL 8.0+
  - PHP 8.0+
  - Yarn or npm 8+
  - Redis (optional, for sessions)
  - Docker (recommended)

11.2 Environment Variables
  Variable               | Example Value          | Purpose
  -----------------------|------------------------|-------------------
  VITE_API_URL           | http://localhost:3001   | Backend API
  VITE_AUTH_URL          | http://localhost:8000   | PHP auth service
  VITE_STRIPE_PUB_KEY    | pk_test_...             | Stripe public key
  DB_HOST                | localhost               | MySQL host
  DB_NAME                | designx_db             | MySQL database
  DB_USER                | root                   | MySQL user
  DB_PASS                | yourpassword           | MySQL password
  JWT_SECRET             | your_jwt_secret_key    | JWT signing key
  OPENAI_API_KEY         | sk-...                 | OpenAI API
  STRIPE_SECRET_KEY      | sk_test_...            | Stripe secret
  STRIPE_WEBHOOK_SECRET  | whsec_...              | Stripe webhook
  AWS_ACCESS_KEY_ID      | AKIA...                | AWS access key
  AWS_SECRET_ACCESS_KEY  | ...                    | AWS secret
  AWS_BUCKET_NAME        | designx-assets         | S3 bucket
  REDIS_URL              | redis://localhost:6379  | Redis connection

11.3 Setup Commands
  git clone <repo-url>
  cd designx-studio-pro
  yarn install
  cp .env.example .env          ← fill in your values
  docker-compose up -d          ← starts MySQL + Redis + PHP
  yarn workspace backend migrate ← runs DB migrations
  yarn workspace backend seed    ← seeds templates
  yarn dev                       ← starts all services

11.4 Dev Server URLs
  Frontend     → http://localhost:5173
  Backend API  → http://localhost:3001
  Auth Service → http://localhost:8000
  Database     → localhost:3306
  Redis        → localhost:6379

════════════════════════════════════════════════════════════════
                 END OF TECHNICAL REQUIREMENTS DOCUMENT
════════════════════════════════════════════════════════════════
