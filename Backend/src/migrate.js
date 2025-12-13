import pkg from 'pg';

const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const pool = new Pool({ connectionString: DATABASE_URL });

const migrate = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS nonces (
      address TEXT PRIMARY KEY,
      nonce TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.end();
  console.log('Migrations completed');
};

migrate().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
