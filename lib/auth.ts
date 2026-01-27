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
        async jwt({ token, user, profile }) {
            console.log("JWT callback called");
            console.log(token, user, profile);
            if (user && profile) {
                const newToken: JWT = {
                    ...token,
                    githubId: profile.id,
                    email: user.email,
                    name: user.name,
                    githubUsername: profile.login,
                };
                // Add to database here if new user
                await prisma.user.upsert({
                    where: { githubId: BigInt(profile.id) },
                    update: {
                        email: user.email!,
                        name: user.name!,
                        githubUsername: profile.login,
                    },
                    create: {
                        githubId: BigInt(profile.id),
                        email: user.email!,
                        name: user.name!,
                        githubUsername: profile.login,
                    },
                }).catch((err) => {
                    console.error("Error upserting user in JWT callback:", err);
                });
                return newToken;
            } else {
                return token;
            }
        },
        async session({ session, token }) {
            session.user.githubId = BigInt(token.githubId);
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
