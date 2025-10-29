const { User } = require('../../models');

const customerController = {
    // List all customers
    index: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows: customers } = await User.findAndCountAll({
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset,
                attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt']
            });

            const totalPages = Math.ceil(count / limit);

            res.render('admin/customers/index', {
                title: 'Customers - Savers Grocery Admin',
                customers,
                currentPage: page,
                totalPages,
                totalCustomers: count
            });

        } catch (error) {
            console.error('Customers index error:', error);
            req.flash('error_msg', 'Error loading customers');
            res.redirect('/admin/dashboard');
        }
    },

    // Show single customer
    show: async (req, res) => {
        try {
            const customer = await User.findByPk(req.params.id, {
                attributes: ['id', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt']
            });

            if (!customer) {
                req.flash('error_msg', 'Customer not found');
                return res.redirect('/admin/customers');
            }

            res.render('admin/customers/show', {
                title: `${customer.name} - Savers Grocery Admin`,
                customer
            });

        } catch (error) {
            console.error('Customer show error:', error);
            req.flash('error_msg', 'Error loading customer');
            res.redirect('/admin/customers');
        }
    },

    // Show edit customer form
    edit: async (req, res) => {
        try {
            const customer = await User.findByPk(req.params.id, {
                attributes: ['id', 'name', 'email', 'phone', 'status']
            });

            if (!customer) {
                req.flash('error_msg', 'Customer not found');
                return res.redirect('/admin/customers');
            }

            res.render('admin/customers/edit', {
                title: `Edit ${customer.name} - Savers Grocery Admin`,
                customer
            });

        } catch (error) {
            console.error('Customer edit form error:', error);
            req.flash('error_msg', 'Error loading edit form');
            res.redirect('/admin/customers');
        }
    },

    // Update customer
    update: async (req, res) => {
        try {
            const customer = await User.findByPk(req.params.id);
            if (!customer) {
                req.flash('error_msg', 'Customer not found');
                return res.redirect('/admin/customers');
            }

            const { name, email, phone, status } = req.body;

            // Check if email already exists (excluding current customer)
            const existingCustomer = await User.findOne({
                where: { 
                    email: email.toLowerCase(),
                    id: { [require('sequelize').Op.ne]: customer.id }
                }
            });

            if (existingCustomer) {
                req.flash('error_msg', 'A customer with this email already exists');
                return res.redirect(`/admin/customers/${req.params.id}/edit`);
            }

            await customer.update({
                name,
                email: email.toLowerCase(),
                phone,
                status: status || 'active'
            });

            req.flash('success_msg', 'Customer updated successfully');
            res.redirect('/admin/customers');

        } catch (error) {
            console.error('Customer update error:', error);
            req.flash('error_msg', 'Error updating customer');
            res.redirect(`/admin/customers/${req.params.id}/edit`);
        }
    },

    // Delete customer (soft delete by setting status to inactive)
    destroy: async (req, res) => {
        try {
            const customer = await User.findByPk(req.params.id);
            if (!customer) {
                req.flash('error_msg', 'Customer not found');
                return res.redirect('/admin/customers');
            }

            // Instead of hard delete, set status to inactive
            await customer.update({
                status: 'inactive'
            });

            req.flash('success_msg', 'Customer deactivated successfully');
            res.redirect('/admin/customers');

        } catch (error) {
            console.error('Customer delete error:', error);
            req.flash('error_msg', 'Error deactivating customer');
            res.redirect('/admin/customers');
        }
    }
};

module.exports = customerController;
