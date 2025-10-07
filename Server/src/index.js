// In Server/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // <-- MAKE SURE THIS LINE EXISTS
const profileRoutes = require('./routes/profile');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const connectDB = require('./db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes); // <-- AND MAKE SURE THIS LINE EXISTS
app.use(profileRoutes);
app.use(jobsRoutes);
app.use(applicationsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));