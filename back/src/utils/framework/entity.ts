import { z } from "zod";

const baseEntitySchema = z.object({
  id: z.string().uuid()
})

type BaseEntity = z.infer<typeof baseEntitySchema>

export {
  baseEntitySchema,
  BaseEntity
}
