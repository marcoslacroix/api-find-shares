const Sequelize = require('sequelize');

const company = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  companyid: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  companyname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ticker: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  p_l: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  dy: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  p_vp: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  p_ebit: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  p_ativo: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  ev_ebit: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  margembruta: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  margemebit: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  margemliquida: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  p_sr: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  p_capitalgiro: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  p_ativocirculante: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  giroativos: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  roe: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  roa: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  roic: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  dividaliquidapatrimonioliquido: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  dividaLiquidaebit: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  pl_ativo: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  passivo_ativo: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  liquidezcorrente: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  peg_ratio: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  receitas_cagr5: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  lucros_cagr5: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  liquidezmediadiaria: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  vpa: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  lpa: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  valormercado: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false
  },
  segmentid: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  sectorid: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  subsectorid: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  subsectorname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  segmentname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  sectorname: {    
    type: Sequelize.STRING,
    allowNull: false},
  vi: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  percent_more: {
    type: Sequelize.FLOAT,
    allowNull: false
  }

}


module.exports = {company};