# hut101 website

## Development instructions

Firstly, if you aren't Penny, ask her for the `.env` file so that you can get a connection string for the PostgreSQL database. Put that in the root of the project.

```bash
pnpm install                # Install dependencies
pnpm exec prisma generate   # Generate Prisma client
```

(The Prisma client is a bunch of TypeScript code that mimics the structure of the database defined inside `.env`, and lets you write SQL queries in a type-safe way, i.e., you can get back typed objects from the database.)

If you are using the shared development database, you can skip this step.
Otherwise, if you are using your own database, you need to create the database with the right schema and with some data:

> [!WARNING]
> This will erase all existing data in the database, so is only suitable for development purposes!

```bash
pnpm exec prisma db push    # Push the database schema to the database
pnpm exec prisma db seed    # Seed the database with some initial data
```

(The database schema is defined in `prisma/schema.prisma` and the seed data is in `prisma/seed.ts`.)

Then you can run the development server:

```bash
pnpm dev
```

And open [`http://localhost:3000`](http://localhost:3000) in your browser.

## Production deployment

I haven't yet figured out how to do all of this with Prisma yet.
