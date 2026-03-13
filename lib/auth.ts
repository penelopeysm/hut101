// Mostly copied from
// https://next-auth.js.org/configuration/nextjs#getserversessiono

import type {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
} from "next"
import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth"
import type { JWT } from "next-auth/jwt";

import prisma from "@/lib/prisma";

export const nextAuthConfig = {
    providers: [GithubProvider({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
    })],
    callbacks: {
        async jwt({ token, user, profile, account }) {
            // If it's a new login (i.e., someone clicked sign in with GitHub --
            // not necessarily the first time, but any time they sign in), then
            // we will have `user` and `profile`. We use that to update their
            // details in our database.
            if (user && profile) {
                // Update the database
                const prismaUser = await prisma.user.upsert({
                    where: { githubId: BigInt(profile.id) },
                    update: {
                        name: user.name!,
                        githubUsername: profile.login,
                        githubPicture: profile.avatar_url,
                        lastLoginAt: new Date(),
                    },
                    create: {
                        githubId: BigInt(profile.id),
                        name: user.name!,
                        githubUsername: profile.login,
                        githubPicture: profile.avatar_url,
                    },
                });
                const newToken: JWT = {
                    ...token,
                    id: Number(prismaUser.id),
                    githubUsername: prismaUser.githubUsername,
                    contactEmail: prismaUser.contactEmail,
                    role: prismaUser.role,
                    accessToken: account?.access_token ?? token.accessToken,
                };
                return newToken;
            } else {
                // Returning user who's just opening the app while already being
                // logged in. Just need to update their last seen date.
                const prismaUser = await prisma.user.update({
                    where: { id: BigInt(token.id) },
                    data: {
                        lastLoginAt: new Date(),
                    },
                });
                return {
                    ...token,
                    contactEmail: prismaUser.contactEmail,
                    role: prismaUser.role,
                };
            }
        },
        async session({ session, token }) {
            // Now we need to pass info from the token into the session.
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.githubUsername = token.githubUsername;
            session.user.githubPicture = token.picture;
            session.user.contactEmail = token.contactEmail;
            session.user.role = token.role;
            return session
        }
    },
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(
    ...args:
        | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
        | [NextApiRequest, NextApiResponse]
        | []
) {
    return getServerSession(...args, nextAuthConfig)
}
