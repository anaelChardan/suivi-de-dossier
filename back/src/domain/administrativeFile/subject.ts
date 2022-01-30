import { z } from "zod";

const subjectSchema = z.object({
  mail: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

type Subject = z.infer<typeof subjectSchema>;

export {
  Subject,
  subjectSchema,
}
