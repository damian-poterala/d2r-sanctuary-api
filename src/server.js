// import dotenv from 'dotenv';

// dotenv.config();

import './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running port ${PORT}`);
});