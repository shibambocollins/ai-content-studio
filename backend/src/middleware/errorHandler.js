export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);

  if (err.name === 'AbortError') {
    return res.status(504).json({ error: 'The AI provider took too long to respond. Please try again.' });
  }

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  // In dev, surface the real error (e.g. "All text providers failed...") so
  // it's obvious which key/config is missing. In prod, keep it generic so
  // internals (provider names, error shapes) aren't leaked to clients.
  const message = status === 500 ? (isProd ? 'Something went wrong generating your content.' : err.message) : err.message;

  res.status(status).json({ error: message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route: ${req.method} ${req.originalUrl}` });
}
