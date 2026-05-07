# Project Context: PAPA ROMA FOOD ENGINEERING

## Project Overview
This is a premium restaurant website for **PAPA ROMA FOOD ENGINEERING** (formerly Papa Roma Smoke House), located at Dhanmondi Lake, Dhaka. The site features a high-end, dark-themed aesthetic with complex animations and multiple specialized menus.

## Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** CSS Modules (Vanilla CSS)
- **Animations:** Framer Motion (Scroll-triggered parallax, stagger effects)
- **Icons:** Lucide React
- **Smooth Scroll:** Lenis
- **Configuration:** Centralized `data/siteConfig.json` and `data/menus.json`

## Branding & UI Requirements
1. **Business Name:** Must be exactly "PAPA ROMA FOOD ENGINEERING".
2. **Hero Section Branding:**
   - Split into three lines:
     - **Line 1:** PAPA ROMA (Large font)
     - **Line 2:** Food (Accent font, slightly smaller)
     - **Line 3:** ENGINEERING (Large font, balanced width with Line 1)
   - Dynamic scroll parallax: The lines drift apart slightly as the user scrolls.
3. **Logo:** Reverted to a text-based logo with a flame icon (flame above "PAPA ROMA", subtext "FOOD ENGINEERING").

## Key Technical Implementations
### 1. Rebranding Logic
- Global brand names are pulled from `data/siteConfig.json`.
- Metadata, SEO, Navbar, and Footer are all synced to use the new branding.

### 2. Next.js 15/16 Compatibility Fixes
- **Dynamic Routing:** In the dynamic menu route `app/menu/[slug]/page.jsx`, the `params` object is a **Promise**. It must be awaited before accessing `slug`. 
- **Metadata:** `generateMetadata` must also be `async` and await `params`.

### 3. Hero Section Typography
- Uses `clamp()` functions in `page.module.css` for responsive sizing.
- Custom class `.brandLine3` created for "ENGINEERING" to prevent screen overflow while maintaining visual weight.

## Current Status & Known Issues
- **Menu Routes:** Fixed. `/menu/smoke-house`, `/menu/bangla-kuthir`, etc., are fully functional.
- **Contact Form:** **CRITICAL.** The contact form currently attempts to write to `data/inquiries.json`. This works in local development but **fails on Vercel** because the filesystem is read-only. This needs to be replaced with a service like Web3Forms, Supabase, or an API route with a database.
- **Hosting:** Currently prepared for Vercel deployment.

## Recent Work Summary
- Successfully rebranded the entire site.
- Refactored the Hero section to a 3-line layout with custom responsive scaling.
- Resolved "Menu Not Found" errors by fixing Next.js 15 Promise-based routing issues.
- Restored original flame logo per user request.
