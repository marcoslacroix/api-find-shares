let companies = [];
const dataBase = require('./data-base');
const Company = dataBase.Company;
const CompanyHistoric = dataBase.CompanyHistoric;
const functionUtils = require('./function_util');
const urlGetStocksInfo  = 'https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Sector%22%3A%22%22%2C%22SubSector%22%3A%22%22%2C%22Segment%22%3A%22%22%2C%22my_range%22%3A%22-20%3B100%22%2C%22forecast%22%3A%7B%22upsidedownside%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22estimatesnumber%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22revisedup%22%3Atrue%2C%22reviseddown%22%3Atrue%2C%22consensus%22%3A%5B%5D%7D%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_l%22%3A%7B%22Item1%22%3A0.01%2C%22Item2%22%3A15%7D%2C%22peg_ratio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3A0.08%2C%22Item2%22%3A1.5%7D%2C%22p_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margembruta%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemliquida%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22ev_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidaebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidapatrimonioliquido%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_sr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_capitalgiro%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ativocirculante%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roe%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roic%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezcorrente%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22pl_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22passivo_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22giroativos%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22receitas_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lucros_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22vpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valormercado%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&orderColumn=price&isAsc=false&page=0&take=156&CategoryType=1';
const urlGetRevenue = 'https://statusinvest.com.br/stock/getrevenuechart?companyid=${companyId}&type=1&viewType=0';
const urlGetStockPageInfo = 'https://statusinvest.com.br/acoes/${ticker}';
const urlGetEbitValue = 'https://statusinvest.com.br/acao/getdre?code=${ticker}&type=0&futureData=false';

functionUtils.getStocksInfo(urlGetStocksInfo).then((results) => {
    console.log("Starting progress...")
    const promises = results.map((item, i) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
            functionUtils.getRevenue({ ticker: item.ticker, url: urlGetRevenue }).then((result) => {
                const wasProfitNegative = functionUtils.checkIfItHasNegativeProfitInTheLast10Years(result);
                functionUtils.getStockPageInfo({ticker: item.ticker, url: urlGetStockPageInfo}).then((stockPageInfo) => {
                    if ((stockPageInfo.tagAlong === '100 %' || stockPageInfo.tagAlong === '80 %')  && !wasProfitNegative) {
                      functionUtils.getEbitValue({ticker: item.ticker, url: urlGetEbitValue}).then((response) => {
                          let ebit = functionUtils.parseEbitValue(response);
                          let vi = Math.sqrt(22.5 * item.lpa * item.vpa);
                          item.vi = vi;
                          item.percent_more = ((vi - item.price) / item.price) * 100
                          item.tagAlong = stockPageInfo.tagAlong;
                          item.earningYield = (ebit / stockPageInfo['Valor de firma']) * 100
                          if (item.price < vi) {
                            companies.push(item);
                          }
                      })
                      
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

    Promise.all(promises).then(async () => {

      const companyHistoric = await CompanyHistoric.findAll({});

      companies.forEach(it => {
        const ticker = it.ticker;
        const isTickerOnHistoric = companyHistoric.some(companyHistoric => companyHistoric.ticker === ticker);
        if(!isTickerOnHistoric) {
          CompanyHistoric.create({
            ticker
          })
        }
      })
      

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

