// In Server/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // <-- MAKE SURE THIS LINE EXISTS
const connectDB = require('./db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes); // <-- AND MAKE SURE THIS LINE EXISTS

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));