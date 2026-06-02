const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const User = {
  async create({ name, email, password, businessName }) {
    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, business_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email.toLowerCase(), hashed, businessName || '']
    );
    return User._format(rows[0]);
  },

  async findOne({ email }) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
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
      const col = colMap[key] || key;
      fields.push(`${col} = $${i++}`);
      values.push(val);
    }
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] ? User._format(rows[0]) : null;
  },

  async findOneAndUpdate(filter, updates) {
    const user = await User.findOne(filter);
    if (!user) return null;
    return User.findByIdAndUpdate(user.id, updates);
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
      googleTokens: row.google_tokens,
      tone: row.tone,
      trialEndsAt: row.trial_ends_at,
      createdAt: row.created_at
    };
    if (includePassword) obj.password = row.password;
    return obj;
  }
};

module.exports = User;
