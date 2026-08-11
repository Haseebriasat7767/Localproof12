const { pool } = require('../db');

const Review = {
  async create({ userId, platform, reviewId, authorName, rating, text, date, sentiment, isFakeSuspected, fakeReasons }) {
    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, platform, review_id, author_name, rating, text, date, sentiment, is_fake_suspected, fake_reasons)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [userId, platform, reviewId, authorName || 'Anonymous', rating, text || '', date || new Date(), sentiment || 'neutral', isFakeSuspected || false, fakeReasons || []]
    );
    return Review._format(rows[0]);
  },

  async find(filter = {}, { sort = '-date', skip = 0, limit } = {}) {
    let query = 'SELECT * FROM reviews WHERE 1=1';
    const values = [];
    let i = 1;

    if (filter.userId !== undefined) { query += ` AND user_id = $${i++}`; values.push(filter.userId); }
    if (filter.sentiment !== undefined) { query += ` AND sentiment = $${i++}`; values.push(filter.sentiment); }
    if (filter.replied !== undefined) { query += ` AND replied = $${i++}`; values.push(filter.replied); }
    if (filter.platform !== undefined) { query += ` AND platform = $${i++}`; values.push(filter.platform); }
    if (filter.isFakeSuspected !== undefined) { query += ` AND is_fake_suspected = $${i++}`; values.push(filter.isFakeSuspected); }

    const sortMap = { '-date': 'date DESC', date: 'date ASC', newest: 'date DESC', oldest: 'date ASC' };
    query += ` ORDER BY ${sortMap[sort] || 'date DESC'}`;

    if (skip > 0) { query += ` OFFSET $${i++}`; values.push(Math.floor(skip)); }
    if (limit !== undefined) { query += ` LIMIT $${i++}`; values.push(Math.min(100, Math.max(1, Math.floor(limit)))); }

    const { rows } = await pool.query(query, values);
    return rows.map(Review._format);
  },

  async findOne(filter) {
    const results = await Review.find(filter, { limit: 1 });
    return results[0] || null;
  },

  async countDocuments(filter = {}) {
    let query = 'SELECT COUNT(*) FROM reviews WHERE 1=1';
    const values = [];
    let i = 1;

    if (filter.userId !== undefined) { query += ` AND user_id = $${i++}`; values.push(filter.userId); }
    if (filter.sentiment !== undefined) { query += ` AND sentiment = $${i++}`; values.push(filter.sentiment); }
    if (filter.replied !== undefined) { query += ` AND replied = $${i++}`; values.push(filter.replied); }
    if (filter.platform !== undefined) { query += ` AND platform = $${i++}`; values.push(filter.platform); }
    if (filter.isFakeSuspected !== undefined) { query += ` AND is_fake_suspected = $${i++}`; values.push(filter.isFakeSuspected); }

    const { rows } = await pool.query(query, values);
    return parseInt(rows[0].count, 10);
  },

  async findByIdAndUpdate(id, updates) {
    const fields = [];
    const values = [];
    let i = 1;

    const colMap = {
      replyDraft: 'reply_draft',
      replyText: 'reply_text',
      replied: 'replied',
      sentiment: 'sentiment',
      isFakeSuspected: 'is_fake_suspected'
    };

    for (const [key, val] of Object.entries(updates)) {
      const col = colMap[key];
      if (!col) throw new Error(`Invalid review update field: ${key}`);
      fields.push(`${col} = $${i++}`);
      values.push(val);
    }
    if (!fields.length) return Review.findOne({ id });

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] ? Review._format(rows[0]) : null;
  },

  async findOneAndUpdate(filter, updates) {
    const fields = [];
    const values = [];
    const conditions = [];
    let i = 1;

    const colMap = {
      replyDraft: 'reply_draft',
      replyText: 'reply_text',
      replied: 'replied',
      sentiment: 'sentiment',
      isFakeSuspected: 'is_fake_suspected'
    };
    const filterMap = {
      id: 'id',
      userId: 'user_id',
      sentiment: 'sentiment',
      replied: 'replied',
      platform: 'platform',
      isFakeSuspected: 'is_fake_suspected'
    };

    for (const [key, val] of Object.entries(updates)) {
      const col = colMap[key];
      if (!col) throw new Error(`Invalid review update field: ${key}`);
      fields.push(`${col} = $${i++}`);
      values.push(val);
    }
    for (const [key, val] of Object.entries(filter)) {
      const col = filterMap[key];
      if (!col) throw new Error(`Invalid review filter field: ${key}`);
      conditions.push(`${col} = $${i++}`);
      values.push(val);
    }
    if (!fields.length || !conditions.length) return null;

    const { rows } = await pool.query(
      `UPDATE reviews SET ${fields.join(', ')} WHERE ${conditions.join(' AND ')} RETURNING *`,
      values
    );
    return rows[0] ? Review._format(rows[0]) : null;
  },

  async aggregate(pipeline) {
    const matchStage = pipeline.find(s => s.$match);
    const userId = matchStage?.$match?.userId;
    const query = userId
      ? 'SELECT AVG(rating) as avg FROM reviews WHERE user_id = $1'
      : 'SELECT AVG(rating) as avg FROM reviews';
    const values = userId ? [userId] : [];
    const { rows } = await pool.query(query, values);
    return rows[0]?.avg ? [{ _id: null, avg: parseFloat(rows[0].avg) }] : [];
  },

  _format(row) {
    return {
      id: row.id,
      _id: row.id,
      userId: row.user_id,
      platform: row.platform,
      reviewId: row.review_id,
      authorName: row.author_name,
      rating: row.rating,
      text: row.text,
      date: row.date,
      replied: row.replied,
      replyText: row.reply_text,
      replyDraft: row.reply_draft,
      sentiment: row.sentiment,
      isFakeSuspected: row.is_fake_suspected,
      fakeReasons: row.fake_reasons || [],
      createdAt: row.created_at
    };
  }
};

module.exports = Review;
