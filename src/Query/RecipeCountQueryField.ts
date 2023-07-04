import { queryField } from "nexus";
import { z } from "zod";

export const RecipeCountQueryField = queryField('recipeCount', {
  type: "Int",

  resolve: async (_, _args, {pool}) => {
    const result = await pool.query(`
      SELECT COUNT(*)
      FROM recipe
      `,
    )
    const [{count}] = z.array(z.object({count: z.coerce.number()})).parse(result.rows)
    return count;
  }
})