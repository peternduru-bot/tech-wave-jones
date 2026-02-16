const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const colors = require('colors');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const contactRoutes = require('./routes/contact');
const projectRoutes = require('./routes/projects');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());

// CORS configuration - Allow all localhost ports
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        
        // Allow all localhost origins with any port
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        
        // Also allow the specific FRONTEND_URL from .env
        if (origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        
        // Allow any origin in development mode (optional - comment out for production)
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        callback(new Error('CORS not allowed'));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api', limiter);

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 TECH-WAVE JONES API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:'.red, err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n========================================='.rainbow);
    console.log(`  🚀 TECH-WAVE JONES BACKEND`.green.bold);
    console.log(`  📡 Server: http://localhost:${PORT}`.cyan);
    console.log(`  🔧 Mode: ${process.env.NODE_ENV || 'development'}`.yellow);
    console.log(`  📊 API: http://localhost:${PORT}/api`.magenta);
    console.log('=========================================\n'.rainbow);
});