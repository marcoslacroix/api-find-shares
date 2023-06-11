const Sequelize = require('sequelize');
const models = require('./models');

const db = new Sequelize('find_shares', 'root', 'live0102', {
    host: 'localhost',
    dialect: 'mysql'
});
const Company = db.define('company', models.company, {freezeTableName: true});
const Favorite = db.define('favorite', models.favorite, {freezeTableName: true});

module.exports = {Company, Favorite}