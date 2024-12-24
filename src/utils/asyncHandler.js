const asyncHandler = (requestHandler) => (req, res, next) =>
  Promise.resolve(requestHandler(req, res, next)).catch((err) => {
    console.log(err(next));
    res.status(500).json({ message: 'Internal Server Error' });
  });

export default asyncHandler;
