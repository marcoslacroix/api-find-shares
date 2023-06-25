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
const UserDto = require('./userDto');
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

class WeakPasswordError extends Error {
    constructor(message) {
      super(message);
      this.name = 'WeakPasswordError';
    }
}

function isStrongPassword(password) {
    if (password.length < 8) {
      throw new WeakPasswordError('A senha deve ter no mínimo 8 caracteres.');
    } else if (password.length > 12) {
        throw new WeakPasswordError('A senha deve ter no máximo 12 caracteres.');
    }
  
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[^A-Za-z0-9]/;
    
    if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password) || !digitRegex.test(password) || !specialCharRegex.test(password)) {
      throw new WeakPasswordError('A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.');
    }
  
    return true;
}

app.post('/api/create-user', async (req, res)  => {
    try {
        const { error, value } = createUserSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).json({ message: errorMessage });
        return;
    }

    const { email, password, name, lastName } = value;

    isStrongPassword(password);

    const user = await getUserByEmail(email);

    if (user) {
        res.status(400).json({ message: 'User already registered' });
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
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});


app.delete('/api/user/delete', verificarToken, async (req, res) => {
    try {
      const decoded = decodeToken(req);
      const user = await getUserByEmail(decoded.email);
      await User.destroy({
        where: {
          id: user.id
        }
      });
      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao excluir o usuário' });
    }
  });
  

app.post('/api/login', async (req, res)  => {
    const {email, password} = req.body;
    const user = await getUserByEmail(email);
    if (user) {
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (email === user.email && isPasswordMatch) {
          const token = jwt.sign({ email: email }, process.env.SECRET_KEY);
          res.json({ token: token });
          return;
        }
      }
      res.status(401).json({ message: 'Credenciais inválidas' });
});

function verificarToken(req, res, next) {
    const authorizationHeader  = getTokenFromHeader(req);
    let token = "";

    if (authorizationHeader) {
        token = authorizationHeader.split(' ')[1];
    }
  
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
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

async function getUserByEmail(email) {
    try {
        return await User.findOne({
          where: {
            email: email
          }
        });
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
}

function getTokenFromHeader(req) {
    return req.headers['authorization'];
}

function decodeToken(req) {
    const token = getTokenFromHeader(req).replace('Bearer ', '');
    return jwt.verify(token, process.env.SECRET_KEY);
}

app.get('/api/get-user', verificarToken, async (req, resp) => {
    const decoded = decodeToken(req);
    const user = await getUserByEmail(decoded.email);
    resp.json(UserDto.parseUserDto(user));
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
