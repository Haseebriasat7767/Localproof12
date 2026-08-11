const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const User = {
  async create({ name, email, password, businessName }) {
    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, business_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), hashed, businessName?.trim() || '']
    );
    return User._format(rows[0]);
  },

  async findOne({ email }) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    return rows[0] ? User._format(rows[0], true) : null;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? User._format(rows[0]) : null;
  },

  async findByIdAndUpdate(id, updates) {
    const fields = [];
    const values = [];
    let i = 1;
    const colMap = {
      businessName: 'business_name',
      tone: 'tone',
      plan: 'plan',
      stripeCustomerId: 'stripe_customer_id',
      stripeSubscriptionId: 'stripe_subscription_id',
      googleConnected: 'google_connected',
      googleTokens: 'google_tokens'
    };

    for (const [key, val] of Object.entries(updates)) {
      const col = colMap[key];
      if (!col) throw new Error(`Invalid update field: ${key}`);
      fields.push(`${col} = $${i++}`);
      values.push(val);
    }
    if (!fields.length) return User.findById(id);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] ? User._format(rows[0]) : null;
  },

  async findOneAndUpdate(filter, updates) {
    if (Object.keys(filter).length !== 1 || !filter.email && !filter.stripeCustomerId) {
      throw new Error('Unsupported user update filter');
    }
    const user = filter.email ? await User.findOne({ email: filter.email }) : await User.findByStripeCustomerId(filter.stripeCustomerId);
    if (!user) return null;
    return User.findByIdAndUpdate(user.id, updates);
  },

  async findByStripeCustomerId(stripeCustomerId) {
    const { rows } = await pool.query('SELECT * FROM users WHERE stripe_customer_id = $1', [stripeCustomerId]);
    return rows[0] ? User._format(rows[0]) : null;
  },

  async comparePassword(plaintext, hashedPassword) {
    return bcrypt.compare(plaintext, hashedPassword);
  },

  _format(row, includePassword = false) {
    const obj = {
      id: row.id,
      _id: row.id,
      name: row.name,
      email: row.email,
      businessName: row.business_name,
      plan: row.plan,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      googleConnected: row.google_connected,
      tone: row.tone,
      trialEndsAt: row.trial_ends_at,
      createdAt: row.created_at
    };
    if (includePassword) obj.password = row.password;
    return obj;
  }
};

module.exports = User;
