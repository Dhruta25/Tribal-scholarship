import fs from 'node:fs';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
  let statusCode = err.status || err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}.`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'This record already exists. Refresh and try again.';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File size exceeds the 5MB limit.';
  } else if (['MongoServerSelectionError', 'MongoNetworkError', 'MongooseServerSelectionError'].includes(err.name)) {
    statusCode = 503;
    message = 'Database is unavailable. Please try again shortly.';
  }
  if (statusCode >= 500) console.error('[API Error]:', err.message);
  res.status(statusCode).json({ success: false, message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : message });
};
