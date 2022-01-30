import { z } from "zod";
import { subjectSchema } from "./subject";

const administrativeFileIdSchema = z.string().uuid();

type AdministrativeFileId = z.infer<typeof administrativeFileIdSchema>

const administrativeFileSchema = z.object({
  id: z.string().uuid(),
  fileNumber: z.string(),
  subject: subjectSchema
})

type AdministrativeFile = z.infer<typeof administrativeFileSchema>

export {
  AdministrativeFileId
  administrativeFileSchema,
  AdministrativeFile
}
