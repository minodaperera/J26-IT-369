const errorHandler = (err, req, res, next) => {
  // Order: explicit err.status/statusCode -> known error types -> res.statusCode set by a controller -> 500
  let statusCode = err.status || err.statusCode;
  let message = err.message || 'Internal Server Error';

  if (!statusCode) {
    if (err.code === 11000) {
      statusCode = 409;
      message = 'A record with the same unique value already exists';
    } else if (err.name === 'ValidationError' || err.name === 'CastError' || err.name === 'MulterError') {
      statusCode = 400;
    } else {
      statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    }
  }

  console.error(`[Error] ${req.method} ${req.url} - ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { errorHandler };
