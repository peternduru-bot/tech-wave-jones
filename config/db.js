const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`\n✅ MongoDB Connected Successfully`.green.bold);
        console.log(`   Host: ${conn.connection.host}`.cyan);
        console.log(`   Database: ${conn.connection.name}`.cyan);
        console.log(`   Port: ${conn.connection.port}\n`.cyan);
        
    } catch (error) {
        console.error(`\n❌ MongoDB Connection Failed: ${error.message}`.red.bold);
        process.exit(1);
    }
};

module.exports = connectDB;