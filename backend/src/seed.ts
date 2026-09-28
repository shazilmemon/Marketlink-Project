import { runSeed } from './database/seed/phase3Seed';

runSeed()
  .then(() => {
    console.log('🌱 Seed completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });
