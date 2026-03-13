import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: bigint,
            githubUsername: string,
            githubPicture: string,
            contactEmail: string | null,
            role: string,
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
        // profile picture
        avatar_url: string,
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number,
        githubUsername: string,
        contactEmail: string | null,
        role: string,
        accessToken?: string,
    }
}
