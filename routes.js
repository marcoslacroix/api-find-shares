require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('sequelize');
const functionUtils = require('./function_util');
const dataBase = require('./data-base');
const BrazilCompany = dataBase.BrazilCompany;
const AmericanCompany = dataBase.AmericanCompany;
const RealEstateFunds = dataBase.RealEstateFunds;
const User = dataBase.User;
const Favorite = dataBase.Favorite;
const CompanyDto = require('./brazilCompanyDto');
const RealStateFundsDto = require('./realStateFundsDto');
const AmericanCompanyDto = require('./americanCompanyDto');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');


  
// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json());


const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  lastName: Joi.string().required()
});

app.post('/create-user', async (req, res)  => {
    try {
        const { error, value } = createUserSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).json({ mensagem: errorMessage });
        return;
    }

    const { email, password, name, lastName } = value;

    const user = await User.findOne({ where: { email } });
    if (user) {
        res.status(400).json({ mensagem: 'User already registered' });
        return;
    }

    const encryptedPwd = await functionUtils.encryptPassword(password);

    await User.create({
      email,
      password: encryptedPwd,
      name,
      last_name: lastName
    });

    res.send("User created!");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


app.get('/login', async (req, res)  => {
    const {email, password} = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (email === user.email && isPasswordMatch) {
          const token = jwt.sign({ email: email }, process.env.SECRET_KEY);
          res.json({ token: token });
          return;
        }
      }
      res.status(401).json({ mensagem: 'Credenciais inválidas' });
});

function verificarToken(req, res, next) {
    const authorizationHeader  = req.headers['authorization'];
    let token = "";

    if (authorizationHeader) {
        token = authorizationHeader.split(' ')[1];
    }
  
    if (!token) {
        return res.status(401).json({ mensagem: 'Token não fornecido' });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ mensagem: 'Token inválido' });
        }
  
        req.user = decoded;
        next();
    });
}

app.post('/api/companies/updateFavorite', verificarToken, async (req, res) => {

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

app.get("/api/brazil-company/sector", verificarToken, async (req, resp) => {
    const sector = await BrazilCompany.findAll({
        attributes: [sequelize.fn('DISTINCT', sequelize.col('sectorname')), 'sectorname'],
    });
    
    resp.json(sector);
})


app.get('/api/fetch/real-state-funds', verificarToken, async (req, res) => {
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
  
app.get('/api/fetch/american-company', verificarToken, async (req, res) => {
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

app.get('/api/fetch/brazil-company', verificarToken, async (req, res) => {
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
  
const server = app.listen(process.env.PORT, () => {
    console.log(`Servidor iniciado na porta ${process.env.PORT}`);
});

module.exports = server;
