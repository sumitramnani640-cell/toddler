const db = require('../models');
const Newsletter = db.Newsletter;

// Subscribe to newsletter (frontend)
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send('Email is required');

    const exists = await Newsletter.findOne({ where: { email } });
    if (exists) return res.status(400).send('Already subscribed');

    await Newsletter.create({ email });
    res.status(200).send('Subscribed successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get all subscribers (admin)
exports.getAll = async (req, res) => {
  try {
    const subscribers = await Newsletter.findAll({
      order: [['subscribedAt', 'DESC']],
    });
    res.render('admin/newsletters', { subscribers });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete subscriber (admin)
exports.deleteSubscriber = async (req, res) => {
  try {
    await Newsletter.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/newsletters');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
