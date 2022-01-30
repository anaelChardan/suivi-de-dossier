import { EncodeIntoResult } from "util";
import { BaseEntity } from "./entity";

interface Repository<Entity extends BaseEntity, R, Id> {
  save(entity: Entity): Promise<void>
  find
}
