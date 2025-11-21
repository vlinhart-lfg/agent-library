# Epic: Make.com Scenario Submission - Phase 3 (Polish & Admin)

**Version**: 3.0 (Current State Assessment)
**Status**: Phase 1 & 2 Complete | Ready for Phase 3
**Timeline**: 2 days remaining (Phase 3)
**Last Updated**: 2025-11-21

---

## Executive Summary

The **Make.com Scenario Submission** system is partially live.
- ✅ **Phase 1 (Core MVP)** is complete: Users can submit scenarios manually, AI validates and enhances content, and scenarios are auto-published to GitHub.
- ✅ **Phase 2 (Scraping)** is complete: Users can paste a URL to auto-extract details using Apify.
- 🚧 **Phase 3 (Polish & Admin)** is **NOT STARTED**: We lack community moderation (reporting), an admin dashboard, and operational monitoring.

This epic defines the remaining work to bring the feature to "Complete" status.

---

## Current Architecture State

### ✅ Implemented Features
1.  **Submission Form** (`/submit`):
    - Manual entry support.
    - **Auto-Extraction**: Integrated with Apify to scrape Make.com pages.
    - Form validation with Zod.
2.  **AI Pipeline**:
    - **Moderation**: OpenAI Moderation API checks for policy violations.
    - **Enhancement**: GPT-4 improves titles, descriptions, and categorizes submissions.
3.  **Publishing Flow**:
    - Direct commit to GitHub repository (`data/templates.json`).
    - Auto-deployment via Vercel.
    - Rate limiting (In-memory).

### ❌ Missing Features (Phase 3)
1.  **Community Reporting**: No way for users to flag bad submissions.
2.  **Admin Dashboard**: No interface to view/delete submissions or handle reports.
3.  **Health & Monitoring**: No health check endpoint or visibility into system status.
4.  **UX Polish**: Error messages could be friendlier; success states more engaging.

---

## Remaining Work: Phase 3 (Polish & Admin)

### 1. Community Reporting System
**Goal**: Allow the community to self-police the library by reporting spam or broken scenarios.

-   **Backend**: `POST /app/api/report`
    -   Accepts `scenarioId`, `reason`, `description`.
    -   Creates a GitHub Issue labeled `community-report`.
    -   Updates `data/templates.json` to increment a `reportCount` (optional, or just relies on Issues).
-   **Frontend**: Update `components/template-card.tsx`
    -   Add a "Report" button (flag icon) to each card.
    -   Simple modal to select reason (Spam, Broken, Inappropriate).

### 2. Admin Dashboard
**Goal**: A simple, secured page for the repository owner to manage submissions.

-   **Page**: `/app/admin/page.tsx`
    -   Protected by basic auth (Environment variable `ADMIN_PASSWORD`).
-   **Features**:
    -   List recent submissions (from `data/templates.json`).
    -   Show "Reported" scenarios.
    -   **Action**: "Delete" button (creates a commit to remove from JSON).
    -   **Action**: "Dismiss Report" (closes GitHub issue).

### 3. System Health & Monitoring
**Goal**: Ensure the system is running and external dependencies (OpenAI, Apify, GitHub) are responsive.

-   **Endpoint**: `/app/api/health/route.ts`
    -   Checks OpenAI API connectivity.
    -   Checks GitHub API connectivity.
    -   Checks Apify account status/credits.
    -   Returns JSON status `{ status: "ok", checks: { ... } }`.

### 4. UX Polish
-   **Better Error Messages**: Map technical errors to user-friendly text in `app/submit/page.tsx`.
-   **Loading States**: Improve "Extracting..." and "Validating..." UI feedback.

---

## Technical Plan for Phase 3

### Step 1: Report API & UI
1.  Create `app/api/report/route.ts`.
2.  Modify `components/template-card.tsx` to include the Report button.
3.  Implement the Report Modal component.

### Step 2: Admin Dashboard
1.  Create `app/admin/layout.tsx` (or just check in page) for auth protection.
2.  Create `app/admin/page.tsx` with a table of scenarios.
3.  Implement `deleteScenario` server action or API route.

### Step 3: Health Check
1.  Create `app/api/health/route.ts`.

---

## Revised Timeline

-   **Day 1 (Today)**:
    -   Implement `api/report` and Report UI.
    -   Implement `api/health`.
-   **Day 2**:
    -   Build Admin Dashboard.
    -   Final end-to-end testing.

## Dependencies & Risks
-   **GitHub API Rate Limits**: Admin dashboard might hit limits if not cached or careful.
-   **Auth**: Basic `ADMIN_PASSWORD` is weak but acceptable for MVP. Ensure it's set in Vercel.

---

## Success Metrics for Phase 3
-   Users can report a scenario, and a GitHub issue is created.
-   Admin can log in and delete a scenario via the UI.
-   Health check returns 200 OK.
