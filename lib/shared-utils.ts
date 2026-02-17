/** A project is "open" when it has no student, isn't completed, and the mentor is available. */
export function isProjectOpen(project: { studentId: unknown; completedAt: unknown; mentorAvailable: boolean }): boolean {
    return !project.studentId && !project.completedAt && project.mentorAvailable;
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
