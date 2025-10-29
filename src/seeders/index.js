const { seedAdmin } = require('./adminSeeder');

const runSeeders = async () => {
    console.log('Running seeders...');
    
    try {
        await seedAdmin();
        console.log('All seeders completed successfully!');
    } catch (error) {
        console.error('Error running seeders:', error);
    }
};

// Run seeders if this file is executed directly
if (require.main === module) {
    runSeeders();
}

module.exports = { runSeeders };
