const express = require('express');
const app = express();
const sequelize = require('sequelize');
const dataBase = require('./data-base');
const Company = dataBase.Company;
const Favorite = dataBase.Favorite;

class CompanyDTO {
    constructor(companyid, companyName, ticker, price, vi, percent_more, dy, tagAlong, subsectorname, segmentname, sectorname) {
        this.companyid = companyid;
        this.companyname = companyName;
        this.ticker = ticker;
        this.price = price;
        this.vi = vi;
        this.price = price;
        this.dy = dy;
        this.percent_more = percent_more;
        this.tagAlong = tagAlong;
        this.subsectorname = subsectorname;
        this.segmentname = segmentname;
        this.sectorname = sectorname;
    }
}

function parseCompanyDTO(data) {
    const { companyid, companyname, ticker, price, vi, percent_more, dy, tagAlong, subsectorname, segmentname, sectorname} = data;
    return new CompanyDTO(companyid, companyname, ticker, price, vi, percent_more, dy, tagAlong, subsectorname, segmentname, sectorname);
}
  
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

app.get("/api/companies/sector", async (req, resp) => {
    const sector = await Company.findAll({
        attributes: [sequelize.fn('DISTINCT', sequelize.col('sectorname')), 'sectorname'],
    });
    
    resp.json(sector);
})

// Rota GET
app.get('/api/companies', async (req, res) => {
    const companies = await Company.findAll();
    let companiesDto = []
    companies.forEach(it => {
        companiesDto.push(parseCompanyDTO(it));
    })
    const favorites = await Favorite.findAll(); 
    favorites.forEach(favorite => {
        const companyToUpdate = companiesDto.find(company => company.ticker === favorite.ticker);
        if (companyToUpdate) {
            companyToUpdate.favorite = true;
        }
    })
    // Sort the companiesDto array by percent_more in descending order
    companiesDto.sort((a, b) => b.percent_more - a.percent_more);
    res.json(companiesDto);
});
  
// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});