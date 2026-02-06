export function formatDateAsDaysInPast(date: Date) {
    const now = new Date();
    // just measure by days
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
