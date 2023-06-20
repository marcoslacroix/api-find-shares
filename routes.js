require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('sequelize');
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



  
// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json());


app.post('/create-user', async (req, res)  => {
    const {email, password, name, lastName} = req.body;
    if (email === "" || !email) {
        res.status(400).json({ mensagem: 'E-mail required' });
    } else if (password === "" || !password) {
        res.status(400).json({ mensagem: 'Password required' });
    } else if (name === "" || !name) {
        res.status(400).json({ mensagem: 'Name required' });
    } else if (lastName === "" || !lastName) {
        res.status(400 ).json({ mensagem: 'Last name required' });
    }

    const user = await User.findOne({
        where: {
            email: email  
        } 
    })

    if (user) {
        res.status(400 ).json({ mensagem: 'User already registered' });
    }
    

    const encryptedPwd = await encryptPassword(password); 

    await User.create({
        email,
        password: encryptedPwd,
        name,
        last_name: lastName
    })

    res.send("User created!");
});

async function encryptPassword(password) {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

app.post('/login', (req, res)  => {
    const {email, password} = req.body;
    // Verifique se as credenciais estão corretas (exemplo fictício)
    if (email === 'teste' && password === 'teste') {
        const token = jwt.sign({ email: email }, process.env.SECRET_KEY);
        res.json({ token: token });
    } else {
        res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
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
  
// Iniciar o servidor
app.listen(process.env.PORT, () => {
    console.log(`Servidor iniciado na porta ${process.env.PORT}`);
});