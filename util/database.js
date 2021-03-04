const Sequelize = require('sequelize');

const sequelize = new Sequelize('casestudy', 'root', 'casestudy', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
