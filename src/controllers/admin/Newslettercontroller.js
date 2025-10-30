const { Newsletter } = require('../../models');

const newsletterController = {
    // List all subscribers
    index: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows: subscribers } = await Newsletter.findAndCountAll({
                order: [['subscribedAt', 'DESC']],
                limit: limit,
                offset: offset
            });

            const totalPages = Math.ceil(count / limit);

            res.render('admin/newsletter/index', {
                title: 'Newsletter Subscribers - Admin Panel',
                subscribers,
                currentPage: page,
                totalPages,
                totalSubscribers: count
            });
        } catch (error) {
            console.error('Newsletter index error:', error);
            req.flash('error_msg', 'Error loading subscribers');
            res.redirect('/admin/dashboard');
        }
    },

    // Add subscriber (frontend)
    subscribe: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).send('Email is required');
            }

            const exists = await Newsletter.findOne({ where: { email } });
            if (exists) {
                return res.status(400).send('Already subscribed');
            }

            await Newsletter.create({ email });
            res.status(200).send('Subscribed successfully');
        } catch (error) {
            console.error('Newsletter subscribe error:', error);
            res.status(500).send('Server error');
        }
    },

    // Delete subscriber
    destroy: async (req, res) => {
        try {
            const subscriber = await Newsletter.findByPk(req.params.id);

            if (!subscriber) {
                req.flash('error_msg', 'Subscriber not found');
                return res.redirect('/admin/newsletter');
            }

            await subscriber.destroy();
            req.flash('success_msg', 'Subscriber deleted successfully');
            res.redirect('/admin/newsletter');
        } catch (error) {
            console.error('Newsletter delete error:', error);
            req.flash('error_msg', 'Error deleting subscriber');
            res.redirect('/admin/newsletter');
        }
    }
};

module.exports = newsletterController;
