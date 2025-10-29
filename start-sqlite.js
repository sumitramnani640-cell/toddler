const { runSeeders } = require('./src/seeders');

// Run seeders first, then start the app with SQLite
const startApp = async () => {
    console.log('🚀 Starting Savers Grocery Admin Panel (SQLite)...');
    
    try {
        // Use SQLite instead of MySQL
        process.env.DB_TYPE = 'sqlite';
        
        // Run database seeders
        await runSeeders();
        
        // Start the main application
        require('./src/app');
        
        console.log('✅ Application started successfully!');
        console.log('📱 Admin Panel: http://localhost:3000/admin');
        console.log('🌐 Website: http://localhost:3000');
        console.log('👤 Default Admin: admin@saversgrocery.com / admin123');
        console.log('💾 Using SQLite database (database.sqlite)');
        
    } catch (error) {
        console.error('❌ Error starting application:', error);
        process.exit(1);
    }
};

startApp();
