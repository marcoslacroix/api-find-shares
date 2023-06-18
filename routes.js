const express = require('express');
const app = express();
const sequelize = require('sequelize');
const dataBase = require('./data-base');
const BrazilCompany = dataBase.BrazilCompany;
const AmericanCompany = dataBase.AmericanCompany;
const RealEstateFunds = dataBase.RealEstateFunds;
const Favorite = dataBase.Favorite;
const CompanyDto = require('./brazilCompanyDto');
const RealStateFundsDto = require('./realStateFundsDto');
const AmericanCompanyDto = require('./americanCompanyDto');
  
// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/companies/updateFavorite', async (req, res) => {

    try {
        const ticker = req.query.ticker;
        if (req.query.favorite === 'true') {
            await Favorite.create({ ticker });
        } else {
            Favorite.destroy({
                where: {
                    ticker
                },
              });
        }
        res.send('Favorite status updated');
    } catch (error) {
        console.error('An error occurred while updating favorite status:', error);
        res.status(500).send('Internal Server Error');
    }

})

app.get("/api/brazil-company/sector", async (req, resp) => {
    const sector = await BrazilCompany.findAll({
        attributes: [sequelize.fn('DISTINCT', sequelize.col('sectorname')), 'sectorname'],
    });
    
    resp.json(sector);
})


app.get('/api/fetch/real-state-funds', async (req, res) => {
    const companies = await RealEstateFunds.findAll({
        order: [[sequelize.literal('magicNumber'), 'ASC']]
    });
    
    const companiesDto = companies.map(RealStateFundsDto.parseRealStateFundsDto);
    
    const favorites = await Favorite.findAll(); 
    favorites.forEach(favorite => {
        const companyToUpdate = companiesDto.find(company => company.ticker === favorite.ticker);
        if (companyToUpdate) {
            companyToUpdate.favorite = true;
        }
    })
   
    res.json(companiesDto);
});
  
app.get('/api/fetch/american-company', async (req, res) => {
    const companies = await AmericanCompany.findAll({
        order: [[sequelize.literal('earningYield'), 'DESC']]
    });
    
    const companiesDto = companies.map(AmericanCompanyDto.parseAmericanCompanyDto);
    
    const favorites = await Favorite.findAll(); 
    favorites.forEach(favorite => {
        const companyToUpdate = companiesDto.find(company => company.ticker === favorite.ticker);
        if (companyToUpdate) {
            companyToUpdate.favorite = true;
        }
    })
   
    res.json(companiesDto);
});

app.get('/api/fetch/brazil-company', async (req, res) => {
    const companies = await BrazilCompany.findAll({
        order: [[sequelize.literal('earningYield'), 'DESC']]
    });
    
    const companiesDto = companies.map(CompanyDto.parseBrazilCompanyDTO);
    
    const favorites = await Favorite.findAll(); 
    favorites.forEach(favorite => {
        const companyToUpdate = companiesDto.find(company => company.ticker === favorite.ticker);
        if (companyToUpdate) {
            companyToUpdate.favorite = true;
        }
    })
   
    res.json(companiesDto);
});
  
// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});