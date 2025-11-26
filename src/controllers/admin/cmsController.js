// src/controllers/admin/cmsController.js
const { CmsPage } = require('../../models');

const cmsController = {
  // List all CMS pages
  index: async (req, res) => {
    try {
      const pages = await CmsPage.findAll({
        order: [['id', 'DESC']]
      });

      res.render('admin/cms/index', {
        layout: 'admin/layouts/admin',
        title: 'CMS Pages',
        pages
      });
    } catch (err) {
      console.error('CmsPage.index error:', err);
      req.flash('error_msg', 'Error fetching CMS pages');
      res.redirect('/admin/dashboard');
    }
  },

  // Render create form
  create: (req, res) => {
    res.render('admin/cms/form', {
      layout: 'admin/layouts/admin',
      title: 'Add CMS Page',
      page: {},
      action: 'create'
    });
  },

  // Save new CMS page
  store: async (req, res) => {
    try {
      const { title, slug, content, position, status } = req.body;

      await CmsPage.create({
        title,
        slug,
        content,
        position: Number(position) || 0,
        status: status === '1' || status === 'true' // from select
      });

      req.flash('success_msg', 'CMS page added successfully!');
      res.redirect('/admin/cms');
    } catch (err) {
      console.error('CmsPage.store error:', err);
      req.flash('error_msg', 'Error creating CMS page');
      res.redirect('/admin/cms');
    }
  },

  // Show details of one CMS page
  show: async (req, res) => {
    try {
      const page = await CmsPage.findByPk(req.params.id);

      if (!page) {
        req.flash('error_msg', 'CMS page not found');
        return res.redirect('/admin/cms');
      }

      res.render('admin/cms/show', {
        layout: 'admin/layouts/admin',
        title: `CMS Page - ${page.title}`,
        page
      });
    } catch (err) {
      console.error('CmsPage.show error:', err);
      req.flash('error_msg', 'Error fetching CMS page');
      res.redirect('/admin/cms');
    }
  },

  // Render edit form
  edit: async (req, res) => {
    try {
      const page = await CmsPage.findByPk(req.params.id);

      if (!page) {
        req.flash('error_msg', 'CMS page not found');
        return res.redirect('/admin/cms');
      }

      res.render('admin/cms/form', {
        layout: 'admin/layouts/admin',
        title: 'Edit CMS Page',
        page,
        action: 'edit'
      });
    } catch (err) {
      console.error('CmsPage.edit error:', err);
      req.flash('error_msg', 'Error loading edit form');
      res.redirect('/admin/cms');
    }
  },

  // Update existing CMS page
  update: async (req, res) => {
    try {
      const { title, slug, content, position, status } = req.body;
      const page = await CmsPage.findByPk(req.params.id);

      if (!page) {
        req.flash('error_msg', 'CMS page not found');
        return res.redirect('/admin/cms');
      }

      page.title = title;
      page.slug = slug;
      page.content = content;
      page.position = Number(position) || 0;
      page.status = status === '1' || status === 'true';

      await page.save();

      req.flash('success_msg', 'CMS page updated successfully!');
      res.redirect('/admin/cms');
    } catch (err) {
      console.error('CmsPage.update error:', err);
      req.flash('error_msg', 'Error updating CMS page');
      res.redirect('/admin/cms');
    }
  },

  // Delete CMS page
  destroy: async (req, res) => {
    try {
      const page = await CmsPage.findByPk(req.params.id);

      if (!page) {
        req.flash('error_msg', 'CMS page not found');
        return res.redirect('/admin/cms');
      }

      await page.destroy();

      req.flash('success_msg', 'CMS page deleted successfully!');
      res.redirect('/admin/cms');
    } catch (err) {
      console.error('CmsPage.destroy error:', err);
      req.flash('error_msg', 'Error deleting CMS page');
      res.redirect('/admin/cms');
    }
  }
};

module.exports = cmsController;
