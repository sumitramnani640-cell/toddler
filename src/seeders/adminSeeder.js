const { Admin } = require('../models');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        // Wait a moment for database to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            where: { email: 'admin@saversgrocery.com' }
        });

        if (!existingAdmin) {
            // Create default admin
            const admin = await Admin.create({
                name: 'Admin User',
                email: 'admin@saversgrocery.com',
                password: 'admin123',
                role: 'super_admin',
                status: 'active'
            });

            console.log('✅ Default admin created successfully:');
            console.log('📧 Email: admin@saversgrocery.com');
            console.log('🔑 Password: admin123');
        } else {
            console.log('ℹ️  Admin already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        // Don't throw error, just log it
    }
};

module.exports = { seedAdmin };
