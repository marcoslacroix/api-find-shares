const Sequelize = require('sequelize');
const models = require('./models');

const db = new Sequelize('find_shares', 'root', 'live0102', {
    host: 'localhost',
    dialect: 'mysql'
});
const BrazilCompany = db.define('brazil_company', models.brazilCompany, {
    freezeTableName: true,
    tableName: 'brazil_company'
});

const AmericanCompany = db.define('american_company', models.americanCompany, {
    freezeTableName: true,
    tableName: 'american_company'
});
const RealEstateFunds = db.define('real_estate_funds', models.realEstateFunds, {
    freezeTableName: true,
    tableName: 'real_estate_funds'
});
const Favorite = db.define('favorite', models.favorite, {
    freezeTableName: true
});
const User = db.define('user', models.user, {
    freezeTableName: true
});
const CompanyHistoric = db.define('company_historic', models.companyHistoric, {
    freezeTableName: true,
    tableName: 'company_historic'
});

module.exports = {BrazilCompany, Favorite, CompanyHistoric, AmericanCompany, RealEstateFunds, User}