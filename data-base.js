const Sequelize = require('sequelize');
const models = require('./models');

const db = new Sequelize('find_shares', 'root', 'live0102', {
    host: 'localhost',
    dialect: 'mysql'
});
const BrazilCompany = db.define('brazil_company', models.brazilCompany, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'brazil_company'
});

const AmericanCompany = db.define('american_company', models.americanCompany, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'american_company'
});
const RealEstateFunds = db.define('real_estate_funds', models.realEstateFunds, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'real_estate_funds'
});
const Favorite = db.define('favorite', models.favorite, {
    freezeTableName: true,
    timestamps: false
});
const User = db.define('user', models.user, {
    freezeTableName: true,
    timestamps: false
});
const CompanyHistoric = db.define('company_historic', models.companyHistoric, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'company_historic'
});

module.exports = {BrazilCompany, Favorite, CompanyHistoric, AmericanCompany, RealEstateFunds, User}