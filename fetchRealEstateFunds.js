const urlGetProvents = "https://statusinvest.com.br/fii/companytickerprovents?companyName=${companyName}&ticker=${ticker}&chartProventsType=1";
const urlGetStockPageInfo = 'https://statusinvest.com.br/fundos-imobiliarios/${ticker}';
//const urlSearch = "https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Segment%22%3A%22%22%2C%22Gestao%22%3A%22%22%2C%22my_range%22%3A%220%3B20%22%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22percentualcaixa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotistas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividend_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22cota_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22patrimonio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valorpatrimonialcota%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lastdividend%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&orderColumn=&isAsc=&page=0&take=480&CategoryType=2";
const urlSearch = "https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Segment%22%3A%22%22%2C%22Gestao%22%3A%22%22%2C%22my_range%22%3A%220%3B20%22%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22percentualcaixa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotistas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividend_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22cota_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3A1000000%2C%22Item2%22%3Anull%7D%2C%22patrimonio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valorpatrimonialcota%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lastdividend%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&orderColumn=liquidezmediadiaria&isAsc=false&page=0&take=94&CategoryType=2";
let companies = [];
const dataBase = require('./data-base');
const RealEstateFunds = dataBase.RealEstateFunds;
const RealStateFundsHistoric = dataBase.RealEstateFundsHistoric;
const functionUtils = require('./function_util');
const ticketsBlackList = ['RBOP11', 'BLMO11'];
const totalValue = 3333;

function validarFundoDeTijolo(item, totalImoveis) {
  let valid = true;

  if (item.sectorname === "Fundo de Tijolo") {
    if (totalImoveis < 5) {
      valid = false;
    }
  }

  return valid;
}

functionUtils.getStocksInfo(urlSearch).then(async (results) => {
    console.log("Starting progress... ", new Date())
    for (item of results) {
      if (item.companyname && item.ticker && !ticketsBlackList.includes(item.ticker)) {
        try {
          let result = await functionUtils.getProvents({ url: urlGetProvents, item: item });

          if (!result){
            continue;
          }
          const invalidProvent = functionUtils.isInvalidProvents(result, item);

          const stockPageInfo = await functionUtils.getStockPageInfo({
            ticker: item.ticker,
            url: urlGetStockPageInfo
          });

          if (item.ticker === "XPMLL11") {
            console.log("item: ", item)
            console.log(invalidProvent);
          }

          if (!invalidProvent && 
              item.sectorname !== "Fundo Misto" && 
              item.price > 0 &&
              item.dy > 0 && 
              validarFundoDeTijolo(item, stockPageInfo.totalImoveis) &&
              item.dy < 30 && 
              item.liquidezmediadiaria > 1000000
            ) {
              item.dyMediana = functionUtils.calculateMedianaValue(result);
              item.magicNumber = item.price / item.dyMediana;
              item.totalImoveis = stockPageInfo.totalImoveis;
              companies.push(item);
          }
          await new Promise(r => setTimeout(r, 3000));
        } catch (error) {
          console.error('An error has occurred: ', error);
        }
      }
    }

    try {
      let top20 = getTop20();
      //applyLimitToInvest(top20);
      await createRealEstateFundsCompanyHistoric(top20);
      await destroyRealEstate();
      await createRealEstateFunds(top20);
      console.log("Process end.", new Date());
    } catch(error) {
      console.error('An error has occurred: ', error);
    }
    
  })
  .catch((error) => {
      console.error('An error has occurred: ', error);
  });

  async function createRealEstateFunds(top20) {
    RealEstateFunds.bulkCreate(top20).then(() => {
      console.log("itens criados");
    })
    .catch((error) => {
      console.error('An error has occurred to insert:', error);
    });
  }

  function getTop20() {
    let copiedList = [...companies];
    let sorted = copiedList.sort((a, b) => a.magicNumber - b.magicNumber);
    return sorted;
  }

  async function destroyRealEstate() {
    await RealEstateFunds.destroy({
      where: {},
    })
    .then((rowsDeleted) => {
    })
    .catch((error) => {
      console.error('An error has occurred to delete:', error);
    })

  }

  async function createRealEstateFundsCompanyHistoric(top20) {
    const listOld = await RealEstateFunds.findAll();
    const historic = {
      old: JSON.stringify(listOld),
      new: JSON.stringify(top20),
      created_at: new Date()
    }

    RealStateFundsHistoric.create(historic).then(() => {
    })
    .catch((error) => {
      console.error('An error has occurred to insert:', error);
    });

  }

  function applyLimitToInvest(top20) {
    for (const [index, value] of top20.entries()) {
      if (index < 3) {
          value.limitToInvest = totalValue * 0.35 / 3; // 291 * 3 = 875
      } else if (index < 5) {
          value.limitToInvest = totalValue * 0.30 / 2; // 375 * 2 = 750
      } else if (index < 8) {
          value.limitToInvest = totalValue * 0.25 / 3; // 208 * 3  = 625
      } else if (index < 10) {
          value.limitToInvest = totalValue * 0.10 / 2; // 125  = 250
      } 
      if (value.limitToInvest) {
        value.quantidade = value.limitToInvest / value.price;
      }
    }
  }