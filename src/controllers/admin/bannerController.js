const { Banner } = require('../../models');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/banners/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

const bannerController = {
    // List all banners
    index: async (req, res) => {
        try {
            const banners = await Banner.findAll({
                order: [['createdAt', 'DESC']]
            });

            res.render('admin/banners/index', {
                title: 'Banners - Savers Grocery Admin',
                banners
            });

        } catch (error) {
            console.error('Banners index error:', error);
            req.flash('error_msg', 'Error loading banners');
            res.redirect('/admin/dashboard');
        }
    },

    // Show create banner form
    create: (req, res) => {
        res.render('admin/banners/create', {
            title: 'Add Banner - Savers Grocery Admin'
        });
    },

    // Store new banner
    store: async (req, res) => {
        try {
            const uploadMiddleware = upload.single('image');
            
            uploadMiddleware(req, res, async (err) => {
                if (err) {
                    req.flash('error_msg', err.message);
                    return res.redirect('/admin/banners/create');
                }

                const { title, status } = req.body;

                if (!req.file) {
                    req.flash('error_msg', 'Please select an image');
                    return res.redirect('/admin/banners/create');
                }

                const imagePath = '/uploads/banners/' + req.file.filename;

                const banner = await Banner.create({
                    title,
                    image: imagePath,
                    status: status || 'active'
                });

                req.flash('success_msg', 'Banner created successfully');
                res.redirect('/admin/banners');
            });

        } catch (error) {
            console.error('Banner store error:', error);
            req.flash('error_msg', 'Error creating banner');
            res.redirect('/admin/banners/create');
        }
    },

    // Show single banner
    show: async (req, res) => {
        try {
            const banner = await Banner.findByPk(req.params.id);

            if (!banner) {
                req.flash('error_msg', 'Banner not found');
                return res.redirect('/admin/banners');
            }

            res.render('admin/banners/show', {
                title: `${banner.title} - Savers Grocery Admin`,
                banner
            });

        } catch (error) {
            console.error('Banner show error:', error);
            req.flash('error_msg', 'Error loading banner');
            res.redirect('/admin/banners');
        }
    },

    // Show edit banner form
    edit: async (req, res) => {
        try {
            const banner = await Banner.findByPk(req.params.id);

            if (!banner) {
                req.flash('error_msg', 'Banner not found');
                return res.redirect('/admin/banners');
            }

            res.render('admin/banners/edit', {
                title: `Edit ${banner.title} - Savers Grocery Admin`,
                banner
            });

        } catch (error) {
            console.error('Banner edit form error:', error);
            req.flash('error_msg', 'Error loading edit form');
            res.redirect('/admin/banners');
        }
    },

    // Update banner
    update: async (req, res) => {
        try {
            const uploadMiddleware = upload.single('image');
            
            uploadMiddleware(req, res, async (err) => {
                if (err) {
                    req.flash('error_msg', err.message);
                    return res.redirect(`/admin/banners/${req.params.id}/edit`);
                }

                const banner = await Banner.findByPk(req.params.id);
                if (!banner) {
                    req.flash('error_msg', 'Banner not found');
                    return res.redirect('/admin/banners');
                }

                const { title, status } = req.body;
                let imagePath = banner.image;

                // If new image uploaded, delete old image and use new one
                if (req.file) {
                    // Delete old image if exists
                    if (banner.image) {
                        const oldImagePath = path.join('public', banner.image);
                        try {
                            await fs.unlink(oldImagePath);
                        } catch (unlinkError) {
                            console.error('Error deleting old image:', unlinkError);
                        }
                    }
                    imagePath = '/uploads/banners/' + req.file.filename;
                }

                await banner.update({
                    title,
                    image: imagePath,
                    status: status || 'active'
                });

                req.flash('success_msg', 'Banner updated successfully');
                res.redirect('/admin/banners');
            });

        } catch (error) {
            console.error('Banner update error:', error);
            req.flash('error_msg', 'Error updating banner');
            res.redirect(`/admin/banners/${req.params.id}/edit`);
        }
    },

    // Delete banner
    destroy: async (req, res) => {
        try {
            const banner = await Banner.findByPk(req.params.id);
            if (!banner) {
                req.flash('error_msg', 'Banner not found');
                return res.redirect('/admin/banners');
            }

            // Delete image file if exists
            if (banner.image) {
                const imagePath = path.join('public', banner.image);
                try {
                    await fs.unlink(imagePath);
                } catch (unlinkError) {
                    console.error('Error deleting image:', unlinkError);
                }
            }

            await banner.destroy();

            req.flash('success_msg', 'Banner deleted successfully');
            res.redirect('/admin/banners');

        } catch (error) {
            console.error('Banner delete error:', error);
            req.flash('error_msg', 'Error deleting banner');
            res.redirect('/admin/banners');
        }
    }
};

module.exports = bannerController;
