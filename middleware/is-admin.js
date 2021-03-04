const User = require('../models/user');

module.exports = (req, res, next) => {
  User.findByPk(req.userId).then(
      user => {
        if(user.role !== 'admin'){
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }
      }
  ).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
  next();
};