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

  async find(filter = {}, { sort, skip, limit } = {}) {
    let query = 'SELECT * FROM reviews WHERE 1=1';
    const values = [];
    let i = 1;

    if (filter.userId !== undefined) { query += ` AND user_id = $${i++}`; values.push(filter.userId); }
    if (filter.sentiment !== undefined) { query += ` AND sentiment = $${i++}`; values.push(filter.sentiment); }
    if (filter.replied !== undefined) { query += ` AND replied = $${i++}`; values.push(filter.replied); }
    if (filter.platform !== undefined) { query += ` AND platform = $${i++}`; values.push(filter.platform); }
    if (filter.isFakeSuspected !== undefined) { query += ` AND is_fake_suspected = $${i++}`; values.push(filter.isFakeSuspected); }

    if (sort) {
      const col = sort === '-date' || sort?.date === -1 ? 'date DESC' : 'date DESC';
      query += ` ORDER BY ${col}`;
    } else {
      query += ' ORDER BY date DESC';
    }

    if (skip) { query += ` OFFSET $${i++}`; values.push(skip); }
    if (limit) { query += ` LIMIT $${i++}`; values.push(limit); }

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
      const col = colMap[key] || key;
      fields.push(`${col} = $${i++}`);
      values.push(val);
    }
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] ? Review._format(rows[0]) : null;
  },

  async findOneAndUpdate(filter, updates) {
    const review = await Review.findOne(filter);
    if (!review) return null;
    return Review.findByIdAndUpdate(review.id, updates);
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
