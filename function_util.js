const fetch = require('node-fetch')
const axios = require('axios')
let companies = [];
const dataBase = require('./data-base');
const Company = dataBase.Company;
const bcrypt = require('bcrypt');
const CompanyHistoric = dataBase.CompanyHistoric;
const cache = require('./cache')
const jwt = require('jsonwebtoken');
const iconv = require('iconv-lite')
const toReadableStockPageInfo = require('./toReadableStockPageInfo')

function getHeaders() {
    return {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7,es-MX;q=0.6,es;q=0.5',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)'
    }
}


function checkIfItHasNegativeProfitInTheLast10Years(data) {
    const currentYear = new Date().getFullYear();
    const yearLimit = currentYear - 5;

    for (let i = 0; i < data.length; i++) {

      if (data[i].year <= yearLimit) {
        break;
      }

      if (data[i].lucroLiquido < 0 || data.length < 4) {
        return true;
      }
    }
    return false; 
}

function getStocksInfo(stocksInfoUrl) {
    return new Promise((resolve, reject) => {
        axios.request(stocksInfoUrl, {
            headers: getHeaders(),
            method: 'GET'
        })
        .then(response => {
            resolve(response.data.list);
        })
        .catch(error => {
            reject(error);
        });
    });
}


const getRevenueByCompanyId = async ({companyid, url}) => {
    let urlWithCompanyId = url.replace("${companyid}", companyid);
    let response = await fetch(urlWithCompanyId, {
        headers: getHeaders(),
    })
    return response.json();
}


const getRevenue = async ({ticker, url}) => {
    let urlWithTicker = url.replace("${ticker}", ticker);
    let response = await fetch(urlWithTicker, {
        headers: getHeaders(),
    })
    return response.json();
}

const getProvents = async ({companyName, url, ticker}) => {
    let urlWithCompanyNameAndTicker = url.replace("${ticker}", ticker).replace("${companyName}", companyName);
    let response = await fetch(urlWithCompanyNameAndTicker, {
        headers: getHeaders(),
    })
    return response.json();
}

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

function calculateMedianaValue(result) {
    var valores = [];
    result.assetEarningsModels.sort(function(a, b) {
        var dateA = new Date(a.ed);
        var dateB = new Date(b.ed);
        return dateB - dateA;
      });
    
    // Extrair os últimos 12 meses
    var ultimos12Meses = result.assetEarningsModels.slice(0, 12);

    // Extrair os valores em uma lista
    var valores = ultimos12Meses.map(function(item) {
    return item.v;
    });

    // Ordenar a lista de valores em ordem crescente
    valores.sort(function(a, b) {
        return a - b;
    });

    var numeroElementos = valores.length;
    var indice = (numeroElementos + 1) / 2;

    var mediana;
    if (Number.isInteger(indice)) {
        mediana = valores[indice - 1];
    } else {
        var indiceInferior = Math.floor(indice) - 1;
        var indiceSuperior = Math.ceil(indice) - 1;
        mediana = (valores[indiceInferior] + valores[indiceSuperior]) / 2;
    }
    return mediana;
}

function isInvalidProvents(result, ticker) {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1; // Os meses em JavaScript são baseados em zero
    const anoAtual = dataAtual.getFullYear();
    const anoAnterior = anoAtual - 1;

    if (result.assetEarningsModels.length < 12) {
        //console.log(`FIIS com idade inferior a 1 ano ${ticker}`);
        return true;
    }
  
    // Verificar os meses do ano anterior
    for (let i = 1; i <= 12; i++) {
      const mes = i.toString().padStart(2, '0'); // Formato de dois dígitos
      const mesAno = `${mes}/${anoAnterior}`;
  
      const registroExiste = result.assetEarningsModels.some(item => {
        const [dia, mesRegistro, anoRegistro] = item.ed.split('/');
        return mesRegistro === mes && anoRegistro === anoAnterior.toString();
      });
  
      if (!registroExiste) {
        //console.log(`Não existe registro para o mês ${mesAno}, ${ticker}`);
        return true;
      }
    }
  
    // Verificar os meses anteriores ao mês atual no ano atual
    for (let i = 1; i < mesAtual; i++) {
      const mes = i.toString().padStart(2, '0'); // Formato de dois dígitos
      const mesAno = `${mes}/${anoAtual}`;
  
      const registroExiste = result.assetEarningsModels.some(item => {
        const [dia, mesRegistro, anoRegistro] = item.ed.split('/');
        return mesRegistro === mes && anoRegistro === anoAtual.toString();
      });
  
      if (!registroExiste) {
        //console.log(`Não existe registro para o mês ${mesAno}, ${ticker}`);
        return true;
      }
    }
  
    return false;
  }
  

const getStockPageInfo = async ({ ticker, url }) => {
    let urlWithTicker = url.replace('${ticker}', ticker);
    const response = await fetch(urlWithTicker, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en,en-US;q=0.9,pt-BR;q=0.8,pt;q=0.7,es-MX;q=0.6,es;q=0.5'
      }
    })
    const responseBuffer = await response.buffer()
    const html = iconv.encode(responseBuffer, 'utf8').toString('utf8')
  
    return toReadableStockPageInfo(html);
}

const getEbitValueByCompanyId = async ({companyid, url}) => {
    let urlWithCompanyId = url.replace('${companyid}', companyid);
    let response = await fetch(urlWithCompanyId, {
        headers: getHeaders(),
    })
    return response.json();
}

const getEbitValue = async ({ticker, url}) => {
    let urlWithTicker = url.replace('${ticker}', ticker);
    let response = await fetch(urlWithTicker, {
        headers: getHeaders(),
    })
    return response.json();
}

function parseEbitValue(response) {
    let stringEbit = response?.data?.grid[7]?.columns[1]?.value;
    let ebit = 0;
    if (stringEbit.includes('M')) {
        ebit = parseFloat(stringEbit.replace('.', '').replace(',', '.')) * 1000000;
    } else if (stringEbit.includes('B')) {
        ebit = parseFloat(stringEbit.replace(/\./g, '').replace(',', '.')) * 1000000000;
    } else {
        ebit = parseFloat(stringEbit.replace(/\./g, '').replace(',', '.'));
    }
    return ebit;
}

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


function getTokenFromHeader(req) {
    return req.headers['authorization'];
}


function decodeToken(req) {
    const token = getTokenFromHeader(req).replace('Bearer ', '');
    return jwt.verify(token, process.env.SECRET_KEY);
}
  
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

module.exports = {
    checkIfItHasNegativeProfitInTheLast10Years,
    getStocksInfo,
    getRevenue,
    getStockPageInfo,
    getEbitValue,
    parseEbitValue,
    getRevenueByCompanyId,
    getEbitValueByCompanyId,
    getProvents,
    isInvalidProvents,
    calculateMedianaValue,
    encryptPassword,
    isStrongPassword,
    verificarToken,
    getTokenFromHeader,
    decodeToken
};
    