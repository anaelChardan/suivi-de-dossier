import { AdministrativeFile, AdministrativeFileId } from "./administrativeFile";

export type AdministrativeFileRepository = {
  save(administrativeFile: AdministrativeFile): Promise<void>
  find(id: AdministrativeFileId): Promise<
}
