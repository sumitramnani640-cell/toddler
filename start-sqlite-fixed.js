// Using MySQL database

const { runSeeders } = require('./src/seeders');

// Run seeders first, then start the app with MySQL
const startApp = async () => {
    console.log('🚀 Starting Savers Grocery Admin Panel (MySQL)...');
    
    try {
        // Run database seeders
        await runSeeders();
        
        // Start the main application
        require('./src/app');
        
        console.log('✅ Application started successfully!');
        console.log('📱 Admin Panel: http://localhost:3000/admin');
        console.log('👤 Default Admin: admin@saversgrocery.com / admin123');
        console.log('💾 Using MySQL database');
        
    } catch (error) {
        console.error('❌ Error starting application:', error);
        process.exit(1);
    }
};

startApp();
