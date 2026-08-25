// Central error handler. Routes forward failures here with next(err) instead
// of echoing err.message, which leaked database and internal details to
// clients (e.g. raw Postgres constraint text).
module.exports = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  console.error(`${req.method} ${req.originalUrl} failed:`, err.message);

  // Body-parser and similar middleware raise 4xx errors whose messages are
  // safe and useful ("Unexpected token in JSON"). Anything 5xx is ours and
  // gets a generic message.
  if (status >= 400 && status < 500) {
    return res.status(status).json({ error: err.expose === false ? 'Bad request' : err.message });
  }

  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};
