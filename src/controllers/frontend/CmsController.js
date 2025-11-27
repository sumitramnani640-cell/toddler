// src/controllers/frontend/CmsController.js

const { CmsPage } = require('../../models'); // adjust if your model path differs

// GET /page/:slug
// Example: /page/about-us
exports.showPage = async (req, res) => {
  try {
    const slug = req.params.slug;

    const page = await CmsPage.findOne({
      where: { slug, status: 1 }
    });

    if (!page) {
      // You can change the view name if your 404 is different
      return res.status(404).render('frontend/404', {
        title: 'Page Not Found'
      });
    }

    return res.render('frontend/cms-page', {
      title: page.title,
      page
    });
  } catch (err) {
    console.error('CMS showPage error:', err);
    return res.status(500).send('Server Error');
  }
};
