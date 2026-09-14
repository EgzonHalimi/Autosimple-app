const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, '..', 'Frontend');

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(frontendPath));

// ====== ROUTES ======
app.use('/api/users', require('./routes/users'));
app.use('/api/cars', require('./routes/cars'));

// ====== TEST ROUTE ======
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working! 🚗',
        time: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ====== ERROR HANDLER ======
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ error: err.message });
});

// ====== START SERVER ======
app.listen(PORT, () => {
    console.log('==============================');
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📡 Test: http://localhost:${PORT}/api/test`);
    console.log(`👤 Register: POST /api/users/signup`);
    console.log(`🔑 Login: POST /api/users/login`);
    console.log(`🚗 Cars: GET /api/cars`);
    console.log('==============================');
});