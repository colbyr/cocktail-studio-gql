import { queryType } from "nexus"
import { z } from "zod"

export const QueryType = queryType({
  definition(t) {
    t.string("hello", {
      resolve: () => "world"
    })

    t.int("recipeCount", {
      resolve: async (_, _args, {pool}) => {
        const result = await pool.query(
          `
          SELECT COUNT(*)
          FROM recipe
          `
        )
        const [{count}] = z.array(z.object({count: z.coerce.number()})).parse(result.rows)
        return count;
      }

    })
  },
})
