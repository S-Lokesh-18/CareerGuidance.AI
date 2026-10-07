import app from './src/app.js';
import pool from './src/config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify DB connectivity
    const client = await pool.connect();
    console.log('✓ Successfully connected to PostgreSQL database.');
    client.release();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Career Portal Backend running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async () => {
      console.log('\nGracefully shutting down server...');
      server.close(async () => {
        await pool.end();
        console.log('Database pool closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server due to database connection error:', err.message);
    process.exit(1);
  }
}

startServer();
