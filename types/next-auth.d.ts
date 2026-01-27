import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            githubId: bigint
        } & DefaultSession["user"]
    }

    interface User {
        githubId: bigint
    }

    interface Profile {
        // github unique id
        id: number,
        // github username
        login: string,
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        githubId: number
    }
}
