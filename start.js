const { runSeeders } = require('./src/seeders');

// const methodOverride = require('method-override');
// app.use(methodOverride('_method'));

// Run seeders first, then start the app
const startApp = async () => {
    console.log('🚀 Starting Savers Grocery Admin Panel...');
    
    try {
        // Run database seeders
        await runSeeders();
        
        // Start the main application
        require('./src/app');
        
        console.log('✅ Application started successfully!');
        console.log('📱 Admin Panel: http://localhost:3000/admin');
        console.log('🌐 Website: http://localhost:3000');
        console.log('👤 Default Admin: admin@saversgrocery.com / admin123');
        
    } catch (error) {
        console.error('❌ Error starting application:', error);
        process.exit(1);
    }
};

startApp();
