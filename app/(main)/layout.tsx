import { requireSetup } from "@/lib/utils";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireSetup();
    return children;
}
