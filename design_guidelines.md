# GreenCoin Africa - Design Guidelines

## Design Philosophy

A hybrid model combining environmental impact, job creation, and digital rewards, drawing inspiration from:

- **Uber/Bolt** → Location-based task matching
- **Binance/Trust Wallet** → Token rewards and wallet system
- **LinkedIn/Upwork** → Verified profiles and skill-building
- **Paystack/Flutterwave** → Secure transactions and local identity

## Core Design Tenets

### 1. Impact First

- Verified recycling centers and drop-off points
- Trash-to-token conversion system
- Leaderboards for top contributors

### 2. Visual & Functional Clarity

- Map view of trash hotspots and factories
- Task cards with weight, location, and reward
- QR code scanning for delivery verification

### 3. Speed & Simplicity

- One-tap job acceptance
- GPS tracking and route optimization
- Instant token payout on delivery

### 4. Local Identity

- Hausa, Yoruba, Igbo language support
- Kano State Government and NITDA sponsorship badges
- Green-themed UI with Nigerian patterns

## Typography System

| Type | Font | Weight | Usage |
|------|------|--------|-------|
| Hero Headlines | Outfit | 800 | Homepage, banners |
| Section Headers | Inter | 700 | Dashboard, map, wallet |
| Card Titles | Inter | 600 | Task cards, stats, filters |
| Body Text | DM Sans | 400–500 | Descriptions, messages |
| Labels/Meta | Inter | 500 sm | Buttons, tags, filter chips |

## Layout & Spacing

**Tailwind Units**: 4, 6, 8, 12, 16, 20, 24, 32

**Component Padding**: p-6 to p-8

**Section Padding**:

- Desktop: py-16 to py-24
- Mobile: py-12

**Grid Systems**:

- Tasks: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Dashboards: `grid-cols-2 lg:grid-cols-4 gap-4`
- Wallet & History: `grid-cols-1 lg:grid-cols-2 gap-8`

## Component Library

### Navigation

- Sticky header with blur effect
- Logo left, nav center, wallet indicator right
- Mobile: Hamburger menu with slide-in drawer
- Region selector dropdown

### Buttons

| Type | Style | Interaction |
|------|-------|-------------|
| Primary | Green gradient, rounded-xl | Hover: shadow-xl, scale-up |
| Secondary | Outlined, rounded-lg | Hover: fill transition |
| Floating | Fixed bottom-right, pulse | Chat, Support, SOS |
| Blur Background | For buttons on images | No hover/active interactions |

### Task Cards

- Trash type indicator: plastic, metal, organic
- Weight estimate and GreenCoin reward display
- Location pin with route preview
- Action buttons: Accept, Navigate, Report
- Verified badge with hover lift effect

### Dashboards

**Collector Dashboard**:

- Stats grid: Tasks completed, Coins earned, Impact score
- Recent deliveries and earnings list
- Quick actions: Accept Job, View Map, Redeem Coins

**Factory Dashboard**:

- Trash intake logs
- Collector verification system
- Coin payout ledger
- Analytics: volume, types, conversion rate

### Chat Interface

- Message bubbles: rounded, aligned by role
- Trash context card pinned at top
- SOS button for unsafe zones

### Admin Panel

- User verification (ID, location)
- Factory approval system
- Coin economy management
- Impact analytics: trash removed, jobs created

## Landing Page Structure

### Hero Section

- Full-width background image of youth collecting trash
- Headline: "Clean Your Community. Earn GreenCoin."
- Subheadline: "Powered by Kano State Government & NITDA"
- Dual CTAs: "Start Collecting" / "Register Factory" (with blur background)
- Quick search bar: Region + Trash Type

### How It Works

- 3-column layout: Collect → Deliver → Earn
- Icons with step descriptions

### Trust Indicators

- Stats bar: "10,000+ KG Collected", "500+ Jobs Created", "20+ Verified Factories"

### Testimonials

- 3-column grid of user stories
- Profile image, quote, name, location

## Images

**Hero Section**:

- Large hero image featuring Nigerian youth actively collecting trash in urban environment
- Bright, hopeful, action-oriented composition
- Shows community engagement and environmental impact

**Task Cards**:

- Photos of different trash types (plastic bottles, metal, organic waste)
- Delivery verification photos

**About/Impact**:

- Team photos with government partners
- Community impact stories
- Factory operations and recycling process

**Testimonials**:

- Profile photos of collectors and factory owners

## Accessibility & UX States

| State | Behavior |
|-------|----------|
| Focus | 2px outline with offset |
| Loading | Skeleton screens, shimmer effect |
| Empty | Friendly illustrations with prompts |
| Error | Inline messages, shake animation |
| Success | Toast notification, checkmark |

## Animations

- Page transitions: Fade-in (duration-300)
- Button hover: Scale 1.02-1.05, shadow expansion
- Card hover: translateY(-4px), shadow transition, scale-105
- Modal: Fade + slide from bottom
- Map: Pin drop animation
- Hero elements: Staggered slide-up animation
- Stats counters: Animated count-up on scroll intersection
- CTA buttons: Pulse effect with scale and arrow translate

## Virtual Assistant (EcoBot)

**Purpose**: Provide instant support and information about recycling, earning opportunities, and platform features

**Features**:
- Floating chat button (bottom-right, pulse animation)
- Conversational AI with recycling knowledge base
- Topics covered:
  - Recycling information (plastic, metal, organic, paper, glass)
  - How GreenCoin Africa works
  - Earning opportunities and income potential
  - Support and contact information
  - Community features

**Design**:
- Chat window: 380px × 500px card
- Message bubbles: Rounded, color-coded by role
- Typing indicator: Animated dots
- Auto-scroll to latest message
- Persistent across page navigation

## Enhanced User Experience Features

### Animated Elements
- **Hero Section**: Tagline badge with sparkle icon, staggered entrance animations
- **Trust Indicators**: Animated number counters, partner logo display, gradient background
- **How It Works**: Expandable step cards with detailed information, hover effects
- **CTA Sections**: Gradient backgrounds with decorative blur elements

### Interactive Components
- **Progressive Disclosure**: Expandable cards for detailed information
- **Hover States**: Scale transforms, shadow transitions, color shifts
- **Click Feedback**: Button animations, state changes
- **Scroll Animations**: Elements animate into view on scroll

### Mobile Optimizations
- Responsive grid layouts (1/2/3/4 columns)
- Touch-friendly button sizes (min 44px height)
- Sticky bottom CTAs on mobile
- Optimized font sizes and spacing
