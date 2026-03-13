# Project Rejection Feedback & Draft Status

## Summary

Add a draft status for MEMBER-submitted projects and a feedback mechanism for admin rejections, enabling a collaborative review loop where mentors can revise and resubmit projects based on admin feedback.

## Motivation

Currently, when an admin rejects a MEMBER's project, the mentor sees "was not approved" with no explanation and no path to fix it. This feature adds:

1. A `DRAFT` status so mentors can save work-in-progress before submitting for review
2. Required admin feedback on rejection, so mentors know what to change
3. A resubmission flow so mentors can edit and resubmit rejected projects

## Design

### Schema Changes

**`VerificationStatus` enum** — add `DRAFT` as the new default:

```prisma
enum VerificationStatus {
  DRAFT      // Saved but not submitted for review
  PENDING    // Submitted, awaiting admin review
  VERIFIED   // Approved (auto or by admin)
  REJECTED   // Admin requested changes
}
```

**`ProjectEventType` enum** — add `SUBMITTED_FOR_REVIEW`:

```prisma
enum ProjectEventType {
  CREATED
  SUBMITTED_FOR_REVIEW  // New
  VERIFIED
  REJECTED
  STUDENT_ASSIGNED
  STUDENT_WITHDRAWN
  MENTOR_MARKED_AVAILABLE
  MENTOR_MARKED_UNAVAILABLE
  COMPLETED
}
```

**`ProjectEvent` model** — add nullable `comment` field:

```prisma
model ProjectEvent {
  // ... existing fields ...
  comment  String?   // Feedback text, used on REJECTED events
}
```

No changes to the `Project` model itself. TRUSTED/ADMIN auto-verification continues unchanged.

Remove the `@default(PENDING)` annotation from `Project.verification` — the status must always be set explicitly in code. This prevents accidental implicit status on any new creation path.

### Status Transitions

```
MEMBER creates project:
  "Save as Draft"      → DRAFT
  "Submit for Review"  → PENDING (SUBMITTED_FOR_REVIEW event)

TRUSTED/ADMIN creates project:
  → VERIFIED (unchanged, auto-verified)

Admin reviews PENDING project:
  Approve  → VERIFIED
  Reject   → REJECTED (with required feedback comment)

Mentor resubmits DRAFT or REJECTED project:
  "Submit for Review"  → PENDING (SUBMITTED_FOR_REVIEW event)
```

### Submission Form Changes

**File:** `components/SubmitForm.tsx`

For MEMBER users, the form gets two submit buttons:

- **"Save as Draft"** — creates project with `DRAFT` status, redirects to project detail page
- **"Submit for Review"** — creates project with `PENDING` status, creates both `CREATED` and `SUBMITTED_FOR_REVIEW` events, redirects with pending banner

TRUSTED/ADMIN users see no changes (single submit button, auto-verified).

### Project Detail Page Changes

**File:** `app/(main)/projects/[id]/page.tsx`

**Draft banner (DRAFT status, creator viewing):**
- Blue/gray banner: "This project is a draft and has not been submitted for review"
- "Submit for Review" button prominently displayed

**Rejection banner (REJECTED status, creator viewing):**
- Banner with softer language: "Changes requested — please review the feedback below and resubmit when ready"
- Latest rejection comment displayed prominently
- Full feedback history shown in reverse chronological order (date + comment for each round)
- "Submit for Review" button to resubmit

**"Submit for Review" button:**
- Visible when project is `DRAFT` or `REJECTED` and viewer is the creator
- Calls a new server action that transitions status to `PENDING` and creates a `SUBMITTED_FOR_REVIEW` event

**Existing banners:**
- PENDING + creator: amber "pending admin verification" (unchanged)
- VERIFIED: no banner (unchanged)

### Admin Dashboard Changes

**File:** `components/AdminProjectTable.tsx`

**Rejection UI:**
- Clicking "Reject" on a PENDING project reveals an inline text area below the row
- Text area for feedback with "Confirm Rejection" and "Cancel" buttons
- Feedback is required — empty rejection is not allowed

**Filter tabs:**
- "Needs verification" tab shows only `PENDING` projects (not REJECTED or DRAFT — those are in the mentor's court)
- "All" tab continues to show everything

### Edit Flow

No changes needed to the edit logic itself. MEMBER users can already edit `PENDING` and `REJECTED` projects. The same logic applies to `DRAFT` projects (same code path — the restriction is only on editing `VERIFIED` projects as a MEMBER).

**Important:** Editing a `REJECTED` project does not auto-resubmit it. The mentor must explicitly click "Submit for Review" after editing. This is intentional — the mentor should review their changes before resubmitting.

### Visibility Rules

- `DRAFT` projects: visible only to the creator and admins (same treatment as PENDING/REJECTED)
- The project detail page's `!== "VERIFIED"` check already covers `DRAFT`
- **User profile page:** `getUserProfile()` currently returns all non-deleted projects for a mentor without filtering by verification status. Add a filter so that `DRAFT`, `PENDING`, and `REJECTED` projects are only visible on the profile to the profile owner and admins. This prevents half-written drafts from appearing on public profiles.

### UI Component Updates

**`AdminProjectTable.tsx`:**
- Add `DRAFT` to the `badgeColors` mapping (use a neutral color like gray/slate)
- Action buttons (Approve/Reject) only appear on `PENDING` projects regardless of which tab is active

**`MentoringProjectCard.tsx`:**
- Add a status badge for `DRAFT` projects (gray/blue, matching the draft banner style)
- Existing badges for PENDING and REJECTED continue to work

### Database Layer

**Modified functions in `lib/db.ts`:**

- `submitProject()` — accept a `status` parameter (`DRAFT` or `PENDING`) instead of computing it solely from role
- `setProjectVerification()` — accept optional `comment` parameter, store it on the `ProjectEvent`

**New functions in `lib/db.ts`:**

- `submitProjectForReview(projectId)` — transitions `DRAFT`/`REJECTED` → `PENDING`, creates `SUBMITTED_FOR_REVIEW` event
- `getProjectFeedback(projectId)` — fetches all REJECTED events with comments for a project, ordered reverse chronologically

**New server actions:**

- `submitForReviewAction(projectId)` in `app/(main)/projects/[id]/actions.ts` — authorization: only the project creator (mentor) can call this, and the project must be in `DRAFT` or `REJECTED` status
- Modified `rejectProjectAction(projectId, comment)` in `app/(main)/admin/actions.ts` — now accepts a `comment` string parameter alongside `projectId`. `AdminProjectTable` (client component) calls this directly with both arguments.

### Event History Example

A project that goes through two rejection rounds:

```
CREATED                    (Mar 13)
SUBMITTED_FOR_REVIEW       (Mar 13)
REJECTED  "Please rephrase the description..."  (Mar 14)
SUBMITTED_FOR_REVIEW       (Mar 15)
REJECTED  "Getting closer, but..."              (Mar 16)
SUBMITTED_FOR_REVIEW       (Mar 17)
VERIFIED                   (Mar 17)
```
