require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('sequelize');
const functionUtils = require('./function_util');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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

function getLimitToInvestBrazilCompanies(totalValue, index) {
    let limitToInvest = 0;
    if (index < 3) {
        limitToInvest = totalValue * 0.13 / 3;
    } else if (index < 5) {
        limitToInvest = totalValue * 0.12 / 2;
    } else if (index < 8) {
        limitToInvest = totalValue * 0.06 / 3;
    } else if (index < 10) {
        limitToInvest = totalValue * 0.035 / 2;
    } else if (index < 13) {
        limitToInvest = totalValue * 0.02 / 3;
    } else if (index < 15) {
        limitToInvest = totalValue * 0.015 / 2;
    } else if (index < 20) {
        limitToInvest = totalValue * 0.01 / 1;
    } 

    return limitToInvest;

}

function parseBrazilCompaniesDtoCsv(companies, totalValue) {
    const dtos = [];
    for (const [index, value] of companies.entries()) {
        let valorMaximo = getLimitToInvestBrazilCompanies(totalValue, index);
        let quantidade =  Math.floor(valorMaximo / value.price);
        const dto = {
            nome: value.companyname,
            ticker: value.ticker,
            valorMaximo: valorMaximo.toFixed(2),
            quantidade: quantidade,
            p_vp: value.p_vp,
            valorAtual: value.price,
            comprar: value.p_vp < 1.5 && quantidade > 0 ? 'Sim' : 'Não'

        }
        dtos.push(dto);
      }

    return dtos;
}

function getLimitToInvestRealEstateFunds(totalValue, index) {
    let limitToInvest = 0;
    if (index < 3) {
        limitToInvest = totalValue * 0.35 / 3; // 291 * 3 = 875
    } else if (index < 5) {
        limitToInvest = totalValue * 0.25 / 2; // 375 * 2 = 750
    } else if (index < 8) {
        limitToInvest = totalValue * 0.25 / 3; // 208 * 3  = 625
    } else if (index < 10) {
        limitToInvest = totalValue * 0.10 / 2; // 125  = 250
    } 

    return limitToInvest;

}

function parseRealEstateFundsDtoCsv(companies, totalValue) {
    const dtos = [];
    for (const [index, value] of companies.entries()) {
        let valorMaximo = getLimitToInvestRealEstateFunds(totalValue, index);
        let quantidade = Math.floor(valorMaximo / value.price);
        const dto = {
            nome: value.companyname,
            ticker: value.ticker,
            valorMaximo: valorMaximo.toFixed(2),
            quantidade: quantidade,
            p_vp: value.p_vp,
            valorAtual: value.price,
            comprar: value.p_vp < 1 && quantidade > 0 ? 'Sim' : 'Não'

        }
        dtos.push(dto);
      }

    return dtos;
}

app.get("/api/download-csv-real-estate-funds", async (req, res) => {
    try{
        const realEstateFunds = await RealEstateFunds.findAll({
            where: {
                sectorname: req.query.sectorName,
            },
            limit: 20
        });

        const dtos = parseRealEstateFundsDtoCsv(realEstateFunds, req.query.totalValue * req.query.percent);

        const csvHeader = [
            { id: 'nome', title: 'Nome' },
            { id: 'ticker', title: 'ticker' },
            { id: 'valorMaximo', title: 'valorMaximo' },
            { id: 'quantidade', title: 'quantidade' },
            { id: 'p_vp', title: 'p_vp' },
            { id: 'valorAtual', title: 'valorAtual' },
            { id: 'comprar', title: 'comprar' },
        ];

        // Cria um objeto CSV Writer
        const csvWriter = createCsvWriter({
            path: 'output.csv',
            header: csvHeader,
        });

        // Escreve os dados no arquivo CSV
        await csvWriter.writeRecords(dtos);

        // Define o tipo de conteúdo da resposta como CSV
        res.header('Content-Type', 'text/csv');
        // Define o nome do arquivo no cabeçalho da resposta
        res.attachment('output.csv');

        // Envia o arquivo como resposta
        res.sendFile('output.csv', { root: '.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
})

app.get("/api/download-csv-brazil-company", async (req, res) => {
    try{
        const companies = await BrazilCompany.findAll();

        const dtos = parseBrazilCompaniesDtoCsv(companies, req.query.totalValue * req.query.percent);

        const csvHeader = [
            { id: 'nome', title: 'Nome' },
            { id: 'ticker', title: 'ticker' },
            { id: 'valorMaximo', title: 'valorMaximo' },
            { id: 'quantidade', title: 'quantidade' },
            { id: 'p_vp', title: 'p_vp' },
            { id: 'valorAtual', title: 'valorAtual' },
            { id: 'comprar', title: 'comprar' },
        ];

        // Cria um objeto CSV Writer
        const csvWriter = createCsvWriter({
            path: 'output.csv',
            header: csvHeader,
        });

        // Escreve os dados no arquivo CSV
        await csvWriter.writeRecords(dtos);

        // Define o tipo de conteúdo da resposta como CSV
        res.header('Content-Type', 'text/csv');
        // Define o nome do arquivo no cabeçalho da resposta
        res.attachment('output.csv');

        // Envia o arquivo como resposta
        res.sendFile('output.csv', { root: '.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error(error);
    }
})

app.post('/api/create-user', async (req, res)  => {
    try {
        const { error, value } = createUserSchema.validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.status(400).json({ message: errorMessage });
        return;
    }

    const { email, password, name, lastName } = value;

    functionUtils.isStrongPassword(password);

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


app.delete('/api/user/delete', functionUtils.verificarToken, async (req, res) => {
    try {
      const decoded = functionUtils.decodeToken(req);
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


app.post('/api/companies/updateFavorite', functionUtils.verificarToken, async (req, res) => {

    try {
        const decoded = functionUtils.decodeToken(req);
        const user = await getUserByEmail(decoded.email);

        console.log(user.id);
        const ticker = req.query.ticker;
        if (req.query.favorite === 'true') {
            await Favorite.create({
                 ticker: ticker,
                 user: user.id
            });
        } else {
            Favorite.destroy({
                where: {
                    ticker: ticker,
                    user: user.id
                },
              });
        }
        res.send('Favorite status updated');
    } catch (error) {
        console.error('An error occurred while updating favorite status:', error);
        res.status(500).send('Internal Server Error');
    }

})

app.get("/api/brazil-company/sector", functionUtils.verificarToken, async (req, resp) => {
    const sector = await BrazilCompany.findAll({
        attributes: [sequelize.fn('DISTINCT', sequelize.col('sectorname')), 'sectorname'],
    });
    
    resp.json(sector);
})


app.get('/api/fetch/real-state-funds', functionUtils.verificarToken, async (req, res) => {
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
  
app.get('/api/fetch/american-company', functionUtils.verificarToken, async (req, res) => {
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

app.get('/api/get-user', functionUtils.verificarToken, async (req, resp) => {
    const decoded = functionUtils.decodeToken(req);
    const user = await getUserByEmail(decoded.email);
    resp.json(UserDto.parseUserDto(user));
});

app.get('/api/fetch/brazil-company', functionUtils.verificarToken, async (req, res) => {
    const companies = await BrazilCompany.findAll({
        order: [[sequelize.literal('earningYield'), 'DESC']]
    });
    
    const companiesDto = companies.map(CompanyDto.parseBrazilCompanyDTO);
    const decoded = functionUtils.decodeToken(req);
    const user = await getUserByEmail(decoded.email);

    const favorites = await Favorite.findAll({
        where: {
            user: user.id
        }
    }); 
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
