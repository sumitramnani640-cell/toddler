// services/orderService.js
const { sequelize, Order } = require('../models');

const MIN_ORDER = 150.00;
const VAT_RATE = 0.05;
const DEFAULT_SCREENSHOT = '/mnt/data/fbe2401d-05a7-4220-a8c8-21fb58f14ed2.png';

async function createOrder({ userId = null, items = [], delivery = 0, screenshotUrl = null }) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }

  // Recalculate totals server-side
  const subtotal = items.reduce((s, it) => s + (Number(it.price) * Number(it.qty)), 0);
  if (subtotal < MIN_ORDER) {
    const err = new Error(`Minimum order of AED ${MIN_ORDER.toFixed(2)} required.`);
    err.status = 400;
    throw err;
  }

  const vat = +((subtotal * VAT_RATE).toFixed(2));
  const total = +(subtotal + vat + Number(delivery)).toFixed(2);

  const t = await sequelize.transaction();
  try {
    const itemsToStore = items;

    const order = await Order.create({
      userId,
      totalAmount: total,
      status: 'pending',
      screenshotUrl: screenshotUrl || DEFAULT_SCREENSHOT
    }, { transaction: t });

    await t.commit();

    return { order, subtotal, vat, total };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = { createOrder, MIN_ORDER, VAT_RATE };
