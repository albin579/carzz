const db = require('./db');

async function checkDatabase() {
  try {
    console.log('Checking database tables...');
    const result = await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log('Tables in database:');
    result.rows.forEach(row => console.log('- ' + row.table_name));

    console.log('\nChecking users table...');
    const users = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('Number of users:', users.rows[0].count);

    console.log('\nChecking if JWT_SECRET is set...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabase();
