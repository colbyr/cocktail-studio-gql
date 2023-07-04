import { queryField } from "nexus";
import { z } from "zod";

export const MeQueryField = queryField("me", {
  type: "User",
  resolve: async (_, _args, {pool, userId}) => {
    const result = await pool.query(`
      SELECT *
      FROM "user"
      WHERE id = $1
      `,
      [userId]
    );
    return z.object({
      id: z.string(),
      email: z.string()
    }).parse(result.rows[0])
  }
})