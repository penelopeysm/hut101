import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Sign In" };
import PageHeading from "@/components/PageHeading";
import SignInButton from "@/components/SignInButton";

export default async function Page() {
    const session = await auth();
    if (session) {
        redirect("/");
    }

    return (
        <>
            <PageHeading>Sign in</PageHeading>
            <p className="text-muted mb-6 max-w-md leading-relaxed">
                Sign in with your GitHub account to submit projects, sign up as a student, and manage your profile.
            </p>
            <SignInButton />
        </>
    );
}
