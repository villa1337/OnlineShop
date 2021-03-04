const User = require('../models/user');

module.exports = (req, res, next) => {
  User.findByPk(req.userId).then(
      user => {
          req.user = user;
      }
  ).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
  next();
};