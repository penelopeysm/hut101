import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

export async function query(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any[],
) {
    const res = await pool.query(text, params);
    return res.rows;
}
