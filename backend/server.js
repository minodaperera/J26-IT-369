const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Initialize Database Connection and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[SafeMaga Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[SafeMaga Backend] Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[SafeMaga Backend] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
