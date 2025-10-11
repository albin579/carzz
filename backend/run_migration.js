const db = require('./db');

async function runMigration() {
  try {
    await db.query('ALTER TABLE salespersons ADD COLUMN phone VARCHAR(50);');
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
