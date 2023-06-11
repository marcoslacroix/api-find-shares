const express = require('express');
const app = express();
const dataBase = require('./data-base');
const Company = dataBase.Company;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rota GET
app.get('/api/companies', async (req, res) => {
    const companies = await Company.findAll();
    res.json(companies);
});
  
// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});