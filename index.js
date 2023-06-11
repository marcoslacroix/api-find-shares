const fetch = require('node-fetch')
const axios = require('axios')
let companies = [];
const dataBase = require('./data-base');
const Company = dataBase.Company;
const cache = require('./cache')
const iconv = require('iconv-lite')
const toReadableStockPageInfo = require('./toReadableStockPageInfo')
let tickerToIgnore = ['FIGE3', 'COCE6'];

// todo filtrar por tagalong 100%

getRevenue = async ({ticker}) => {
    
    let response = await fetch(`https://statusinvest.com.br/acao/getrevenue?code=${ticker}&type=2&viewType=0`, {
        headers: {
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
          },
      })
      return response.json();
}

const getStockPageInfo = async ({ ticker }) => {
  const response = await fetch(`https://statusinvest.com.br/acoes/${ticker}`, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'en,en-US;q=0.9,pt-BR;q=0.8,pt;q=0.7,es-MX;q=0.6,es;q=0.5'
    }
  })
  const responseBuffer = await response.buffer()
  const html = iconv.encode(responseBuffer, 'utf8').toString('utf8')

  return toReadableStockPageInfo(html);
}

const getStocksInfo = async () => {
    const stocksInfoUrl = 'https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Sector%22%3A%22%22%2C%22SubSector%22%3A%22%22%2C%22Segment%22%3A%22%22%2C%22my_range%22%3A%22-20%3B100%22%2C%22forecast%22%3A%7B%22upsidedownside%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22estimatesnumber%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22revisedup%22%3Atrue%2C%22reviseddown%22%3Atrue%2C%22consensus%22%3A%5B%5D%7D%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_l%22%3A%7B%22Item1%22%3A0.01%2C%22Item2%22%3A15%7D%2C%22peg_ratio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3A0.08%2C%22Item2%22%3A1.5%7D%2C%22p_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margembruta%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemliquida%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22ev_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidaebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidapatrimonioliquido%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_sr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_capitalgiro%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ativocirculante%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roe%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roic%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezcorrente%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22pl_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22passivo_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22giroativos%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22receitas_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lucros_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22vpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valormercado%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&orderColumn=price&isAsc=false&page=0&take=156&CategoryType=1'
    const { data } = await axios.request(stocksInfoUrl, {
      headers: {
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
      },
      method: 'GET'
    })
    return data.list;
  }

getStocksInfo()
  .then((results) => {
    console.log("Starting progress...")
    const promises = results.map((item, i) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
            getRevenue({ ticker: item.ticker })
              .then((result) => {
                const wasProfitNegative = checkIfItHasNegativeProfitInTheLast10Years(result);
                getStockPageInfo({ticker: item.ticker})
                  .then((stockPageInfo) => {
                    if ((stockPageInfo.tagAlong === '100 %' || stockPageInfo.tagAlong === '80 %')  && !wasProfitNegative && !tickerToIgnore.includes(item.ticker)) {
                      let vi = Math.sqrt(22.5 * item.lpa * item.vpa);
                      item.vi = vi;
                      item.percent_more = ((vi - item.price) / item.price) * 100
                      item.tagAlong = stockPageInfo.tagAlong;
                      if (item.price < vi) {
                        companies.push(item);
                      }
                }
                resolve("teste");
                })
                
              })
              .catch((error) => {
                console.error('An error has occurred: ', error);
                reject("error");
              });
          }, i * 1000);
      });
    });

    Promise.all(promises).then(() => {

      Company.destroy({
        where: {},
      })
      .then((rowsDeleted) => {
      })
      .catch((error) => {
        console.error('An error has occurred to delete:', error);
      })

      Company.bulkCreate(companies).then(() => {
      })
      .catch((error) => {
        console.error('An error has occurred to insert:', error);
      });

      console.log("Process end.");
      
    });
  })
  .catch((error) => {
    console.error('An error has occurred: ', error);
  });


function checkIfItHasNegativeProfitInTheLast10Years(data) {
  const currentYear = new Date().getFullYear();
  const yearLimit = currentYear - 10;
  
  for (let i = 0; i < data.length; i++) {
    
    if (data[i].year <= yearLimit) {
      break;
    }
      
    if (data[i].lucroLiquido < 0) {
      return true;
    }
  }
  return false; 
}
  
