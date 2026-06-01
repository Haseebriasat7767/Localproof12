const { pool } = require('../db');

const Feedback = {
  async create({ userId, customerName, customerEmail, rating, comment, isUnhappy, source }) {
    const { rows } = await pool.query(
      `INSERT INTO feedback (user_id, customer_name, customer_email, rating, comment, is_unhappy, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, customerName || 'Anonymous', customerEmail || '', rating, comment || '', isUnhappy || false, source || 'widget']
    );
    return Feedback._format(rows[0]);
  },

  async find(filter = {}, { sort, limit } = {}) {
    let query = 'SELECT * FROM feedback WHERE 1=1';
    const values = [];
    let i = 1;

    if (filter.userId !== undefined) { query += ` AND user_id = $${i++}`; values.push(filter.userId); }
    if (filter.isUnhappy !== undefined) { query += ` AND is_unhappy = $${i++}`; values.push(filter.isUnhappy); }

    query += ' ORDER BY created_at DESC';
    if (limit) { query += ` LIMIT $${i++}`; values.push(limit); }

    const { rows } = await pool.query(query, values);
    return rows.map(Feedback._format);
  },

  _format(row) {
    return {
      id: row.id,
      _id: row.id,
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      rating: row.rating,
      comment: row.comment,
      isUnhappy: row.is_unhappy,
      alertSent: row.alert_sent,
      source: row.source,
      createdAt: row.created_at
    };
  }
};

module.exports = Feedback;
