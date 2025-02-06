const logger = require("../log/errorLogger");
const {UnauthorizedError} = require("../errors/authErrors");

const errorHandler = (error, req, res, next) => {
  try {
    logger.error(error.message);
  } catch {
    if (err.code === "ENOENT") {
      console.log("Error: ENOENT: no such file or directory, mkdir logs");
    }
  }
  if (error instanceof UnauthorizedError) {
    res.redirect('http://localhost:5173/login');
  }

  res.status(error.status || 500);
  res.json({ message: error.message || "Internal Server Error" });

};

module.exports = errorHandler;