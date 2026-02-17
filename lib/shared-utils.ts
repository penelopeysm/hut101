export type ProjectStatus = "open" | "in_progress" | "completed";

export function projectStatus(project: { studentId: unknown; completedAt: unknown; mentorAvailable: boolean }): ProjectStatus {
    if (project.completedAt) return "completed";
    if (project.studentId) return "in_progress";
    if (project.mentorAvailable) return "open";
    // Has no student, not completed, but mentor is unavailable
    return "in_progress";
}

export function formatDateAsDaysInPast(date: Date) {
    const now = new Date();
    const lastSeenDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (lastSeenDay > nowDay) {
        return "in the future (timey wimey stuff going on here...)";
    } else if (lastSeenDay.getTime() === nowDay.getTime()) {
        return "today";
    } else {
        const daysAgo = Math.round((nowDay.getTime() - lastSeenDay.getTime()) / (1000 * 60 * 60 * 24));
        return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    }
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
