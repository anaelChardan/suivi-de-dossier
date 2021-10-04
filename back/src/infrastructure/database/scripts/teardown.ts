import { teardownDB } from './bootstrapDB';

export default async function teardown(): Promise<void> {
  await teardownDB();
}

teardownDB()
  .then(() => console.log('DB: migration rollback OK'))
  .catch((err) => console.log('DB: migration rollback Error:', err));
