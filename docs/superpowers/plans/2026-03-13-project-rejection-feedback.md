# Project Rejection Feedback & Draft Status — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a DRAFT status for MEMBER projects and admin rejection feedback with a resubmission loop.

**Architecture:** New `DRAFT` enum value + `SUBMITTED_FOR_REVIEW` event type + `comment` field on `ProjectEvent`. The submit form gets two buttons for MEMBER users. Project detail page shows banners and a "Submit for Review" button. Admin rejection UI gets an inline feedback textarea.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7, PostgreSQL, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-13-project-rejection-feedback-design.md`

**Note:** No test framework is set up in this project. Steps use `pnpm build` and `pnpm lint` for verification, plus manual checks via `pnpm dev`.

---

## Chunk 1: Schema & Database Layer (including submit action to avoid broken build)

### Task 1: Schema Changes

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add DRAFT to VerificationStatus enum**

In `prisma/schema.prisma:22-26`, add `DRAFT` before `PENDING`:

```prisma
enum VerificationStatus {
  DRAFT
  PENDING
  VERIFIED
  REJECTED
}
```

- [ ] **Step 2: Remove @default(PENDING) from Project.verification**

In `prisma/schema.prisma:61`, change:

```prisma
  verification VerificationStatus @default(PENDING)
```

to:

```prisma
  verification VerificationStatus
```

- [ ] **Step 3: Add SUBMITTED_FOR_REVIEW to ProjectEventType enum**

In `prisma/schema.prisma:97-106`, add `SUBMITTED_FOR_REVIEW` after `CREATED`:

```prisma
enum ProjectEventType {
  CREATED
  SUBMITTED_FOR_REVIEW
  STUDENT_ASSIGNED
  STUDENT_WITHDRAWN
  MENTOR_MARKED_AVAILABLE
  MENTOR_MARKED_UNAVAILABLE
  COMPLETED
  VERIFIED
  REJECTED
}
```

- [ ] **Step 4: Add comment field to ProjectEvent model**

In `prisma/schema.prisma:108-118`, add after `time`:

```prisma
model ProjectEvent {
  id        BigInt   @id @default(autoincrement())
  type      ProjectEventType
  time      DateTime @default(now())
  comment   String?

  project   Project  @relation(fields: [projectId], references: [id])
  projectId BigInt

  actor     User   @relation(fields: [actorId], references: [id])
  actorId   BigInt
}
```

- [ ] **Step 5: Push schema to database and regenerate client**

Run: `pnpm exec prisma db push`
Run: `pnpm exec prisma generate`

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/generated/
git commit -m "Add DRAFT status, SUBMITTED_FOR_REVIEW event, and comment field to schema"
```

---

### Task 2: Database Layer — Modify Existing Functions

**Files:**
- Modify: `lib/db.ts:251-322` (`submitProject`)
- Modify: `lib/db.ts:334-354` (`setProjectVerification`)

- [ ] **Step 1: Add status parameter to submitProject()**

In `lib/db.ts`, modify `submitProject` (line 251) to accept a `submitForReview` boolean parameter. When the user is a MEMBER:
- If `submitForReview` is true → status = `"PENDING"`, create both `CREATED` and `SUBMITTED_FOR_REVIEW` events
- If `submitForReview` is false → status = `"DRAFT"`, create only `CREATED` event

For TRUSTED/ADMIN users, `submitForReview` is ignored — they always get `"VERIFIED"`.

Replace `lib/db.ts:251-322` with:

```typescript
export async function submitProject(
    title: string,
    description: string,
    repoOwner: string,
    repoName: string,
    issueNumber: number,
    difficulty: Difficulty,
    technologyNames: string[],
    mentorJobRole: string | null,
    mentorTimeCommitment: string | null,
    submitForReview: boolean,
) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const userId = BigInt(session.user.id);
    const role = session.user.role as UserRole;
    const autoVerify = role === "TRUSTED" || role === "ADMIN";

    const verification = autoVerify
        ? "VERIFIED"
        : submitForReview
            ? "PENDING"
            : "DRAFT";

    const project = await prisma.project.create({
        data: {
            title,
            description,
            repoOwner,
            repoName,
            issueNumber,
            difficulty,
            mentorJobRole,
            mentorTimeCommitment,
            verification,
            mentor: {
                connect: { id: userId },
            },
        },
    });

    if (technologyNames.length > 0) {
        const technologies = await prisma.technology.findMany({
            where: { name: { in: technologyNames } },
        });
        await prisma.projectTechnology.createMany({
            data: technologies.map((t) => ({
                projectId: project.id,
                technologyId: t.id,
            })),
        });
    }

    const events = [
        prisma.projectEvent.create({
            data: {
                type: "CREATED",
                projectId: project.id,
                actorId: userId,
            },
        }),
    ];
    if (autoVerify) {
        events.push(
            prisma.projectEvent.create({
                data: {
                    type: "VERIFIED",
                    projectId: project.id,
                    actorId: userId,
                },
            }),
        );
    } else if (submitForReview) {
        events.push(
            prisma.projectEvent.create({
                data: {
                    type: "SUBMITTED_FOR_REVIEW",
                    projectId: project.id,
                    actorId: userId,
                },
            }),
        );
    }
    await prisma.$transaction(events);

    return { project, autoVerified: autoVerify, isDraft: verification === "DRAFT" };
}
```

- [ ] **Step 2: Add comment parameter to setProjectVerification()**

In `lib/db.ts`, modify `setProjectVerification` (line 334) to accept an optional `comment` parameter:

```typescript
export async function setProjectVerification(
    projectId: bigint,
    status: "VERIFIED" | "REJECTED",
    comment?: string,
) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Not authorized");
    }
    const adminId = BigInt(session.user.id);

    await prisma.$transaction([
        prisma.project.update({
            where: { id: projectId },
            data: { verification: status },
        }),
        prisma.projectEvent.create({
            data: {
                type: status,
                projectId,
                actorId: adminId,
                comment: status === "REJECTED" ? comment : undefined,
            },
        }),
    ]);
}
```

- [ ] **Step 3: Add submitProjectForReview()**

Add at the end of `lib/db.ts`:

```typescript
export async function submitProjectForReview(projectId: bigint) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const userId = BigInt(session.user.id);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error("Project not found");
    }
    if (project.mentorId !== userId) {
        throw new Error("You can only submit your own projects for review");
    }
    if (project.verification !== "DRAFT" && project.verification !== "REJECTED") {
        throw new Error("Only draft or rejected projects can be submitted for review");
    }

    await prisma.$transaction([
        prisma.project.update({
            where: { id: projectId },
            data: { verification: "PENDING" },
        }),
        prisma.projectEvent.create({
            data: {
                type: "SUBMITTED_FOR_REVIEW",
                projectId,
                actorId: userId,
            },
        }),
    ]);
}
```

- [ ] **Step 4: Add getProjectFeedback()**

Add at the end of `lib/db.ts`:

```typescript
export async function getProjectFeedback(projectId: bigint) {
    return await prisma.projectEvent.findMany({
        where: {
            projectId,
            type: "REJECTED",
            comment: { not: null },
        },
        include: {
            actor: { select: { id: true, githubUsername: true } },
        },
        orderBy: { time: "desc" },
    });
}
```

- [ ] **Step 5: Update submit server action to pass intent through to DB**

Update `app/(main)/submit/actions.ts` to read a hidden `intent` field from the form data and pass it to `submitProjectDb`. This must be done in the same commit as the `submitProject()` signature change to avoid a broken build.

```typescript
"use server";

import { submitProject as submitProjectDb } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Difficulty } from "@/lib/generated/client";
import { parseGitHubIssueLink } from "@/lib/github";

export type SubmitResult = {
    success: boolean;
    error?: string;
    fields?: {
        title: string;
        description: string;
        githubIssue: string;
        difficulty: string;
        technologies: string[];
        mentorJobRole: string;
        mentorTimeCommitment: string;
    };
};

export async function submitProject(_prev: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubIssueLink = formData.get("githubIssue") as string;
    const difficulty = formData.get("difficulty") as string;
    const technologies = formData.getAll("technologies").map(String);
    const mentorJobRole = (formData.get("mentorJobRole") as string) ?? "";
    const mentorTimeCommitment = (formData.get("mentorTimeCommitment") as string) ?? "";
    const intent = formData.get("intent") as string;

    const fields = { title, description, githubIssue: githubIssueLink, difficulty, technologies, mentorJobRole, mentorTimeCommitment };

    const parsed = parseGitHubIssueLink(githubIssueLink);
    if (!parsed) {
        return { success: false, error: "That doesn't look like a GitHub issue link. It should look like https://github.com/owner/repo/issues/123", fields };
    }
    const { repoOwner, repoName, issueNumber } = parsed;

    let result;
    try {
        result = await submitProjectDb(
            title,
            description,
            repoOwner,
            repoName,
            issueNumber,
            difficulty as Difficulty,
            technologies,
            mentorJobRole || null,
            mentorTimeCommitment || null,
            intent === "submit",
        );
    } catch (err) {
        console.error("Error submitting project:", err);
        return { success: false, error: "Something went wrong while submitting. Please try again.", fields };
    }

    if (result.autoVerified) {
        redirect(`/projects/${result.project.id}?new=1`);
    } else if (result.isDraft) {
        redirect(`/projects/${result.project.id}?draft=1`);
    } else {
        redirect(`/projects/${result.project.id}?pending=1`);
    }
}
```

- [ ] **Step 6: Verify build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add lib/db.ts app/\(main\)/submit/actions.ts
git commit -m "Add draft/review support to DB layer and submit action"
```

---

## Chunk 2: Submit Form

### Task 3: Submit Form — Two Buttons for MEMBER Users

**Files:**
- Modify: `components/SubmitForm.tsx`

- [ ] **Step 1: Add intent hidden field and two buttons for MEMBER users**

Replace the submit button section in `components/SubmitForm.tsx` (lines 145-152). The approach: use a hidden input for `intent` and set its value via button click before form submission.

Replace the entire `SubmitForm` component with:

```tsx
"use client";

import { useActionState, useRef } from "react";
import { submitProject, type SubmitResult } from "@/app/(main)/submit/actions";
import ErrorMessage from "@/components/ErrorMessage";
import TechnologyPicker from "@/components/TechnologyPicker";
import { inputClass, buttonClass } from "@/lib/styles";

type Technology = { id: bigint; name: string };

export default function SubmitForm({ technologies, isMember }: { technologies: Technology[]; isMember: boolean }) {
    const [state, formAction, isPending] = useActionState<SubmitResult | null, FormData>(submitProject, null);
    const intentRef = useRef<HTMLInputElement>(null);

    // key forces React to re-mount the form when state changes,
    // ensuring all defaultValues (especially <select>) are applied
    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-lg space-y-5">
            {state?.error && <ErrorMessage message={state.error} />}
            <input type="hidden" name="intent" ref={intentRef} defaultValue="submit" />

            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                </label>
                <p className="text-xs text-muted mb-1.5">
                    A short, descriptive name for the task. This is what students will see when browsing projects.
                </p>
                <input
                    id="title"
                    name="title"
                    required
                    defaultValue={state?.fields?.title ?? ""}
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                </label>
                <p className="text-xs text-muted mb-1.5">
                    Explain what the task involves and what a student would need to do.
                    Remember that students may have less context about the project, its tooling, and its codebase than you do.
                </p>
                <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    defaultValue={state?.fields?.description ?? ""}
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="githubIssue" className="block text-sm font-medium mb-1">
                    GitHub issue link
                </label>
                <p className="text-xs text-muted mb-1.5">
                    Link to the issue on the project&rsquo;s repository.
                </p>
                <input
                    id="githubIssue"
                    name="githubIssue"
                    required
                    defaultValue={state?.fields?.githubIssue ?? ""}
                    placeholder="https://github.com/owner/repo/issues/123"
                    className={`${inputClass} placeholder:text-muted/50`}
                />
            </div>

            <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                    Difficulty
                </label>
                <p className="text-xs text-muted mb-1.5">
                    How long would this take you to do yourself?
                </p>
                <select
                    id="difficulty"
                    name="difficulty"
                    required
                    defaultValue={state?.fields?.difficulty ?? ""}
                    className={inputClass}
                >
                    <option value="">Select difficulty</option>
                    <option value="EASY">Easy — ~10 minutes for me</option>
                    <option value="MEDIUM">Medium — under an hour for me</option>
                    <option value="HARD">Hard — a couple of hours for me</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Technologies
                </label>
                <p className="text-xs text-muted mb-1.5">
                    Select the main languages or tools a student would need to use.
                </p>
                <TechnologyPicker
                    technologies={technologies}
                    defaultSelected={state?.fields?.technologies}
                />
            </div>

            {isMember && (
                <>
                    <div>
                        <label htmlFor="mentorJobRole" className="block text-sm font-medium mb-1">
                            What is your current job role?
                        </label>
                        <p className="text-xs text-muted mb-1.5">
                            This helps us verify that you have the background to mentor on this project.
                        </p>
                        <textarea
                            id="mentorJobRole"
                            name="mentorJobRole"
                            required
                            rows={3}
                            defaultValue={state?.fields?.mentorJobRole ?? ""}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="mentorTimeCommitment" className="block text-sm font-medium mb-1">
                            How much time can you commit to mentoring?
                        </label>
                        <p className="text-xs text-muted mb-1.5">
                            We recommend 2&ndash;3 contact hours total: an initial meeting, a check-in before the PR, and a wrap-up discussion.
                        </p>
                        <textarea
                            id="mentorTimeCommitment"
                            name="mentorTimeCommitment"
                            required
                            rows={3}
                            defaultValue={state?.fields?.mentorTimeCommitment ?? ""}
                            className={inputClass}
                        />
                    </div>
                </>
            )}

            {isMember ? (
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={() => { if (intentRef.current) intentRef.current.value = "draft"; }}
                        className="cursor-pointer border border-border text-foreground bg-transparent px-4 py-2 rounded-md text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Saving..." : "Save as draft"}
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={() => { if (intentRef.current) intentRef.current.value = "submit"; }}
                        className={buttonClass}
                    >
                        {isPending ? "Submitting..." : "Submit for review"}
                    </button>
                </div>
            ) : (
                <button
                    type="submit"
                    disabled={isPending}
                    aria-busy={isPending}
                    className={buttonClass}
                >
                    {isPending ? "Submitting..." : "Submit project"}
                </button>
            )}
        </form>
    );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/SubmitForm.tsx
git commit -m "Add Save as draft / Submit for review buttons for MEMBER users"
```

---

### Task 4: Submit for Review Server Action

**Files:**
- Create: `app/(main)/projects/[id]/actions.ts`

- [ ] **Step 1: Create new server action file**

Create `app/(main)/projects/[id]/actions.ts`:

```typescript
"use server";

import { submitProjectForReview } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitForReviewAction(projectId: bigint) {
    await submitProjectForReview(projectId);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/admin");
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(main\)/projects/\[id\]/actions.ts
git commit -m "Add submitForReview server action"
```

---

## Chunk 3: Project Detail Page

### Task 5: Project Detail Page — Banners & Submit for Review Button

**Files:**
- Modify: `app/(main)/projects/[id]/page.tsx:23-169`
- Create: `components/SubmitForReviewButton.tsx`

- [ ] **Step 1: Create SubmitForReviewButton client component**

Create `components/SubmitForReviewButton.tsx`:

```tsx
"use client";

import { useTransition } from "react";
import { submitForReviewAction } from "@/app/(main)/projects/[id]/actions";
import { buttonClass } from "@/lib/styles";

export default function SubmitForReviewButton({ projectId }: { projectId: string }) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit() {
        startTransition(async () => {
            await submitForReviewAction(BigInt(projectId));
        });
    }

    return (
        <button
            onClick={handleSubmit}
            disabled={isPending}
            aria-busy={isPending}
            className={buttonClass}
        >
            {isPending ? "Submitting..." : "Submit for review"}
        </button>
    );
}
```

- [ ] **Step 2: Update project detail page banners and add feedback display**

In `app/(main)/projects/[id]/page.tsx`, import the new components and `getProjectFeedback`:

Add to the imports at the top:
```typescript
import { getProjectFeedback } from "@/lib/db";
import SubmitForReviewButton from "@/components/SubmitForReviewButton";
```

In `ProjectDetail` function, after `const issueUrl = ...` (line 42), fetch feedback:
```typescript
    const feedback = (project.verification === "REJECTED" || project.verification === "DRAFT")
        ? await getProjectFeedback(projectId)
        : [];
```

Replace the existing PENDING and REJECTED banners (lines 48-57) with:

```tsx
            {project.verification === "DRAFT" && isCreator && (
                <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-sm rounded-md px-4 py-3 mb-6">
                    <p className="font-medium mb-2">This project is a draft and has not been submitted for review.</p>
                    <SubmitForReviewButton projectId={project.id.toString()} />
                </div>
            )}
            {project.verification === "PENDING" && isCreator && !isPending && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm rounded-md px-4 py-3 mb-6">
                    This project is pending admin verification and is not yet visible to others.
                </div>
            )}
            {project.verification === "REJECTED" && isCreator && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm rounded-md px-4 py-3 mb-6">
                    <p className="font-medium mb-1">Changes requested</p>
                    <p className="mb-3">Please review the feedback below and resubmit when ready.</p>
                    {feedback.length > 0 && (
                        <div className="space-y-2 mb-3">
                            {feedback.map((f) => (
                                <div key={f.id.toString()} className="bg-white/50 dark:bg-black/20 rounded px-3 py-2 text-sm">
                                    <p>{f.comment}</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                        — @{f.actor.githubUsername}, {f.time.toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <SubmitForReviewButton projectId={project.id.toString()} />
                </div>
            )}
```

Also update the `searchParams` handling. In the `Page` component (line 172), update both the type annotation and destructuring to include `draft`:

```typescript
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string; pending?: string; draft?: string }> }) {
```

And destructure `draft`:

```typescript
    const { new: isNew, pending, draft } = await searchParams;
```

Update the `ProjectDetail` call (line 189) to pass `isDraft`:

```tsx
    <ProjectDetail projectId={projectId} isNew={!!isNew} isPending={!!pending} isDraft={!!draft} />
```

Update the `ProjectDetail` function signature (line 23):

```typescript
async function ProjectDetail({ projectId, isNew, isPending, isDraft }: { projectId: bigint; isNew: boolean; isPending: boolean; isDraft: boolean }) {
```

Add a draft success banner right after the `isNew` and `isPending` banners:

```tsx
            {isDraft && <SuccessBanner message="Project saved as draft. You can submit it for review when you're ready." />}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/SubmitForReviewButton.tsx app/\(main\)/projects/\[id\]/page.tsx
git commit -m "Add draft/rejection banners and submit-for-review button to project detail page"
```

---

## Chunk 4: Admin Dashboard

### Task 6: Admin Rejection with Feedback

**Files:**
- Modify: `components/AdminProjectTable.tsx`
- Modify: `app/(main)/admin/actions.ts`

- [ ] **Step 1: Update admin server action to accept comment**

Replace `app/(main)/admin/actions.ts` with:

```typescript
"use server";

import { setProjectVerification } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function verifyProjectAction(projectId: bigint) {
    await setProjectVerification(projectId, "VERIFIED");
    revalidatePath("/admin");
    revalidatePath("/projects");
}

export async function rejectProjectAction(projectId: bigint, comment: string) {
    if (!comment.trim()) {
        throw new Error("Rejection feedback is required");
    }
    await setProjectVerification(projectId, "REJECTED", comment.trim());
    revalidatePath("/admin");
    revalidatePath("/projects");
}
```

- [ ] **Step 2: Update AdminProjectTable with inline rejection UI**

Replace the entire `components/AdminProjectTable.tsx` with the following. Key changes:
- Add `DRAFT` badge color
- "Needs verification" filter shows only `PENDING` (not `REJECTED`)
- Reject button opens inline textarea; Confirm sends comment
- Action buttons only show on `PENDING` projects

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { verifyProjectAction, rejectProjectAction } from "@/app/(main)/admin/actions";

export interface AdminProject {
    id: string;
    title: string;
    verification: string;
    createdAt: string;
    deletedAt: string | null;
    mentor: { id: string; githubUsername: string };
    student: { id: string; githubUsername: string } | null;
}

type Filter = "all" | "needs_verification" | "deleted";

const filterLabels: Record<Filter, string> = {
    all: "All",
    needs_verification: "Needs verification",
    deleted: "Deleted",
};

function needsVerification(p: AdminProject) {
    return p.verification === "PENDING" && !p.deletedAt;
}

function filterProjects(projects: AdminProject[], filter: Filter): AdminProject[] {
    switch (filter) {
        case "needs_verification":
            return projects.filter(needsVerification);
        case "deleted":
            return projects.filter((p) => p.deletedAt !== null);
        default:
            return projects;
    }
}

const badgeBase = "text-xs font-medium px-1.5 py-0.5 rounded";
const badgeColors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400",
    DELETED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    VERIFIED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function VerificationBadge({ status, deletedAt }: { status: string; deletedAt: string | null }) {
    const key = deletedAt ? "DELETED" : status;
    const label = deletedAt ? "Deleted" : status.charAt(0) + status.slice(1).toLowerCase();
    const colors = badgeColors[key];
    if (!colors) return <span className="text-xs text-muted">{status}</span>;
    return <span className={`${badgeBase} ${colors}`}>{label}</span>;
}

export default function AdminProjectTable({ projects }: { projects: AdminProject[] }) {
    const [filter, setFilter] = useState<Filter>("all");
    const [isPending, startTransition] = useTransition();
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectComment, setRejectComment] = useState("");

    const filtered = filterProjects(projects, filter);

    function handleVerify(projectId: string) {
        startTransition(async () => {
            await verifyProjectAction(BigInt(projectId));
        });
    }

    function handleRejectStart(projectId: string) {
        setRejectingId(projectId);
        setRejectComment("");
    }

    function handleRejectCancel() {
        setRejectingId(null);
        setRejectComment("");
    }

    function handleRejectConfirm(projectId: string) {
        if (!rejectComment.trim()) return;
        startTransition(async () => {
            await rejectProjectAction(BigInt(projectId), rejectComment);
            setRejectingId(null);
            setRejectComment("");
        });
    }

    const counts: Record<Filter, number> = {
        all: projects.length,
        needs_verification: projects.filter(needsVerification).length,
        deleted: projects.filter((p) => p.deletedAt !== null).length,
    };

    return (
        <div>
            <div className="flex gap-1 mb-4">
                {(Object.keys(filterLabels) as Filter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`cursor-pointer text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                            filter === f
                                ? "bg-accent text-white"
                                : "bg-surface text-muted hover:text-foreground"
                        }`}
                    >
                        {filterLabels[f]}
                        <span className="ml-1.5 opacity-70">{counts[f]}</span>
                    </button>
                ))}
            </div>

            <div className="border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface text-muted text-left">
                            <th className="px-3 py-2 font-medium">Title</th>
                            <th className="px-3 py-2 font-medium">Mentor</th>
                            <th className="px-3 py-2 font-medium">Student</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                            <th className="px-3 py-2 font-medium">Created</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-muted">
                                    No projects match this filter.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => (
                                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-surface/50">
                                    <td className="px-3 py-2">
                                        <Link href={`/projects/${p.id}`} className="text-accent hover:underline">
                                            {p.title}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2 text-muted">
                                        <Link href={`/users/${p.mentor.id}`} className="hover:text-accent hover:underline">
                                            @{p.mentor.githubUsername}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2 text-muted">
                                        {p.student ? (
                                            <Link href={`/users/${p.student.id}`} className="hover:text-accent hover:underline">
                                                @{p.student.githubUsername}
                                            </Link>
                                        ) : (
                                            <span className="opacity-40">&mdash;</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <VerificationBadge status={p.verification} deletedAt={p.deletedAt} />
                                    </td>
                                    <td className="px-3 py-2 text-muted whitespace-nowrap">
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2">
                                        {p.verification === "PENDING" && !p.deletedAt && (
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleVerify(p.id)}
                                                    disabled={isPending}
                                                    className="cursor-pointer text-xs font-medium px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                {rejectingId !== p.id && (
                                                    <button
                                                        onClick={() => handleRejectStart(p.id)}
                                                        disabled={isPending}
                                                        className="cursor-pointer text-xs font-medium px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {rejectingId && (
                <div className="mt-3 border border-border rounded-lg p-4 bg-card">
                    <p className="text-sm font-medium mb-2">
                        Rejection feedback for &ldquo;{projects.find((p) => p.id === rejectingId)?.title}&rdquo;
                    </p>
                    <textarea
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        placeholder="Explain what changes are needed..."
                        rows={3}
                        className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent mb-2"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleRejectConfirm(rejectingId)}
                            disabled={isPending || !rejectComment.trim()}
                            className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Rejecting..." : "Confirm rejection"}
                        </button>
                        <button
                            onClick={handleRejectCancel}
                            disabled={isPending}
                            className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded border border-border text-muted hover:text-foreground transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/AdminProjectTable.tsx app/\(main\)/admin/actions.ts
git commit -m "Add inline rejection feedback UI and DRAFT badge to admin dashboard"
```

---

## Chunk 5: Remaining UI Updates

### Task 7: MentoringProjectCard — Add DRAFT Badge

**Files:**
- Modify: `components/MentoringProjectCard.tsx:24-29`

- [ ] **Step 1: Add DRAFT badge**

In `components/MentoringProjectCard.tsx`, add a DRAFT badge before the existing PENDING badge (after line 23):

```tsx
            {showEditControls && project.verification === "DRAFT" && (
                <span className="bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 text-xs font-medium px-2 py-0.5 rounded inline-block mb-2">Draft</span>
            )}
```

Also update the REJECTED badge label from "Rejected" to "Changes requested" to match the softer language:

Change line 28 from:
```tsx
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-medium px-2 py-0.5 rounded inline-block mb-2">Rejected</span>
```
to:
```tsx
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium px-2 py-0.5 rounded inline-block mb-2">Changes requested</span>
```

- [ ] **Step 2: Commit**

```bash
git add components/MentoringProjectCard.tsx
git commit -m "Add DRAFT badge and soften REJECTED label in MentoringProjectCard"
```

---

### Task 8: User Profile — Admin Visibility for Unverified Projects

**Files:**
- Modify: `app/(main)/users/[id]/page.tsx:39-41`

- [ ] **Step 1: Allow admins to see DRAFT/PENDING/REJECTED projects on other users' profiles**

In `app/(main)/users/[id]/page.tsx`, line 41, change:

```typescript
    const mentoring = isOwnProfile ? allMentoring : allMentoring.filter((p) => p.verification === "VERIFIED");
```

to:

```typescript
    const isAdmin = session?.user.role === "ADMIN";
    const mentoring = (isOwnProfile || isAdmin) ? allMentoring : allMentoring.filter((p) => p.verification === "VERIFIED");
```

- [ ] **Step 2: Commit**

```bash
git add app/\(main\)/users/\[id\]/page.tsx
git commit -m "Allow admins to see unverified projects on other users' profiles"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 2: Run build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Manual smoke test**

Run: `pnpm dev`

Test the following flows:
1. As a MEMBER user, submit a project using "Save as draft" — verify DRAFT banner appears
2. On the draft project, click "Submit for review" — verify it transitions to PENDING
3. As an admin, go to /admin, click Reject on a PENDING project — verify textarea appears, enter feedback, confirm
4. Back as the MEMBER, view the rejected project — verify "Changes requested" banner with feedback
5. Edit the project, then click "Submit for review" — verify it goes back to PENDING
6. As an admin, approve it — verify it becomes VERIFIED and public
7. Check user profile page — verify DRAFT/REJECTED projects don't show on other users' profiles

- [ ] **Step 4: Final commit (if any lint/build fixes needed)**

```bash
git add -A
git commit -m "Fix lint/build issues"
```
