import { bootstrapDB, truncateTable } from './bootstrapDB';

export default async function setup(): Promise<void> {
  await bootstrapDB();
  await truncateTable();
}

setup()
  .then(() => console.log('DB: migration OK'))
  .catch((err) => console.log('DB: migration Error:', err));
