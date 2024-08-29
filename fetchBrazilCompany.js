let companies = [];
const { func } = require('joi');
const dataBase = require('./data-base');
const BrazilCompany = dataBase.BrazilCompany;
const BrazilCompanyHistoric = dataBase.BrazilCompanyHistoric;
const functionUtils = require('./function_util');
// sem filtro
//const urlGetStocksInfo  = 'https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Sector%22%3A%22%22%2C%22SubSector%22%3A%22%22%2C%22Segment%22%3A%22%22%2C%22my_range%22%3A%22-20%3B100%22%2C%22forecast%22%3A%7B%22upsidedownside%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22estimatesnumber%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22revisedup%22%3Atrue%2C%22reviseddown%22%3Atrue%2C%22consensus%22%3A%5B%5D%7D%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_l%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22peg_ratio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3A0.01%2C%22Item2%22%3A100%7D%2C%22p_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margembruta%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemliquida%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22ev_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidaebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidapatrimonioliquido%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_sr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_capitalgiro%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ativocirculante%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roe%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roic%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezcorrente%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22pl_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22passivo_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22giroativos%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22receitas_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lucros_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22vpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valormercado%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&orderColumn=p_vp&isAsc=false&page=0&take=506&CategoryType=1';
// filtro Liquidez média diária > 1_000_000
const urlGetStocksInfo = 'https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Sector%22%3A%22%22%2C%22SubSector%22%3A%22%22%2C%22Segment%22%3A%22%22%2C%22my_range%22%3A%22-20%3B100%22%2C%22forecast%22%3A%7B%22upsidedownside%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22estimatesnumber%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22revisedup%22%3Atrue%2C%22reviseddown%22%3Atrue%2C%22consensus%22%3A%5B%5D%7D%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_l%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22peg_ratio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margembruta%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22margemliquida%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22ev_ebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidaebit%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividaliquidapatrimonioliquido%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_sr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_capitalgiro%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_ativocirculante%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roe%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roic%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22roa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezcorrente%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22pl_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22passivo_ativo%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22giroativos%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22receitas_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lucros_cagr5%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3A1000000%2C%22Item2%22%3Anull%7D%2C%22vpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lpa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valormercado%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&orderColumn=&isAsc=&page=0&take=241&CategoryType=1';
const urlGetRevenue = 'https://statusinvest.com.br/acao/getrevenue?code=${ticker}&type=2&viewType=0';
const urlGetStockPageInfo = 'https://statusinvest.com.br/acoes/${ticker}';
const urlGetEbitValue = 'https://statusinvest.com.br/acao/getdre?code=${ticker}&type=0&futureData=false';
const subSectoresToIgnore = ['Exploração de Imóveis', 'Comércio', 'Hoteis e Restaurantes', 'Alimentos Processados'];
const ticketsBlackList = ['GGBR4', 'GGBR3'];
const checkNegativeProfit = true;
var totalBanks = 0;
var totalInsurers = 0;
var totalAgriculture = 0;
var totalElectricity = 0;
var totalCarsAndMotorcycles = 0;
var totalIncorporations = 0;

functionUtils.getStocksInfo(urlGetStocksInfo).then((results) => {
    console.log("Starting progress... ", new Date());

    const promises = results.map((item, i) => {
      if (!subSectoresToIgnore.includes(item.subsectorname) && !ticketsBlackList.includes(item.ticker)) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
              functionUtils.getRevenue({ ticker: item.ticker, url: urlGetRevenue }).then((result) => {
                  const wasProfitNegative = functionUtils.checkIfItHasNegativeProfitInTheLast10Years(result, item.ticker, checkNegativeProfit);
                  functionUtils.getStockPageInfo({ticker: item.ticker, url: urlGetStockPageInfo}).then((stockPageInfo) => {
                      if ((stockPageInfo.tagAlong === '100 %' || stockPageInfo.tagAlong === '80 %')  && 
                          !wasProfitNegative && 
                          segmentIsAvailable(item) &&
                          item.margemebit > 0) {
                            functionUtils.getEbitValue({ticker: item.ticker, url: urlGetEbitValue}).then((response) => {
                                let ebit = functionUtils.parseEbitValue(response);
                                let vi = Math.sqrt(22.5 * item.lpa * item.vpa);
                                item.vi = vi;
                                item.percent_more = ((vi - item.price) / item.price) * 100
                                item.tagAlong = stockPageInfo.tagAlong;
                                item.earningYield = (ebit / stockPageInfo['Valor de firma']) * 100;
                                if (item.price < vi && item.earningYield > 0) {
                                  countVariableSegment(item);
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
            }, i * 2000);
        });
      }
      
    });

    Promise.all(promises).then(async () => {
      let newList = parseNewListWithoutSameCompany();
      let top30 = getTop30(newList);
      //applyLimitToInvest(top30);
      await createBrazilCompanyHistoric(top30);
      await destroiyBrazilCompany();
      await createBrazilCompanies(top30);
      console.log("Process end. ", new Date());
    });
  })
  .catch((error) => {
    console.error('An error has occurred: ', error);
  });

  function segmentIsAvailable(item) {
    var isAvailable = true;
    let limit = 3;
    switch(item.segmentname) {
      case 'Bancos':
        if (totalBanks == limit) {
          isAvailable = false;
        }
        break;
      case 'Agricultura':
        if (totalAgriculture == limit) {
          isAvailable = false;
        }
        break;
      case 'Energia Elétrica':
        if (totalElectricity == limit) {
          isAvailable = false;
        }
        break;
      case 'Seguradoras':
        if (totalInsurers == limit) {
          isAvailable = false;
        }
        break;
    }
    return isAvailable;
  }

  function countVariableSegment(item) {
    switch(item.segmentname) {
      case 'Bancos':
        totalBanks++;
        break;
      case 'Agricultura':
        totalAgriculture++;
        break;
      case 'Energia Elétrica':
        totalElectricity++;
        break;
      case 'Seguradoras':
        totalInsurers++;
        break;
      case 'Automóveis e Motocicletas':
        totalCarsAndMotorcycles++;
        break;
      case 'Incorporações':
        totalIncorporations++;
        break;
    }

  }

  function getTop30(newList) {
    let copiedList = [...newList];
    let sorted = copiedList.sort((a, b) => a.earningYield - b.earningYield);
    sorted.reverse();
    return sorted.slice(0, 30);
  }

  function parseNewListWithoutSameCompany() {
    // se tiver empresa repetida, pega a que tiver a liquidezmediadiaria maior
    const newList = [];
    companies.forEach(item => {
      const existingItemIndex = newList.findIndex(newItem => newItem.companyname === item.companyname);
      if (existingItemIndex !== -1) {
          if (item.liquidezmediadiaria > newList[existingItemIndex].liquidezmediadiaria) {
              newList[existingItemIndex] = item;
          }
      } else {
          newList.push(item);
      }
    });
    return newList;
  }

  async function createBrazilCompanies(top30) {
    await BrazilCompany.bulkCreate(top30).then(() => {
    })
    .catch((error) => {
      console.error('An error has occurred to insert:', error);
    });

  }


  async function destroiyBrazilCompany() {
    await BrazilCompany.destroy({
      where: {},
    })
    .then((rowsDeleted) => {
    })
    .catch((error) => {
      console.error('An error has occurred to delete:', error);
    })

  }

  async function createBrazilCompanyHistoric(top30) {
    const listOld = await BrazilCompany.findAll();
    const brazilCompanyHistoric = {
      old: JSON.stringify(listOld),
      new: JSON.stringify(top30),
      created_at: new Date()
    }

    BrazilCompanyHistoric.create(brazilCompanyHistoric).then(() => {
    })
    .catch((error) => {
      console.error('An error has occurred to insert:', error);
    });

  }




// QUERY BUSCA POR EMPRESAS
/* SELECT companyname, ticker, p_vp, price, quantidade, limitToInvest, subsectorname, segmentname, sectorname
FROM find_shares.brazil_company
where p_vp < 1.5 and p_vp is not null and quantidade > 1;
*/