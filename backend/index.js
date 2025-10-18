const express = require('express');
const cors = require('cors');
require('dotenv').config();
const setupDatabase = require('./setup-db');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware, apiRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

// Fallback route for 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await setupDatabase();
});
