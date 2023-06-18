const urlGetProvents = "https://statusinvest.com.br/fii/companytickerprovents?companyName=${companyName}&ticker=${ticker}&chartProventsType=1";
const urlSearch = "https://statusinvest.com.br/category/advancedsearchresultpaginated?search=%7B%22Segment%22%3A%22%22%2C%22Gestao%22%3A%22%22%2C%22my_range%22%3A%220%3B20%22%2C%22dy%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22p_vp%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22percentualcaixa%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotistas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22dividend_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22cota_cagr%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22liquidezmediadiaria%22%3A%7B%22Item1%22%3A1000000%2C%22Item2%22%3Anull%7D%2C%22patrimonio%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22valorpatrimonialcota%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22numerocotas%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%2C%22lastdividend%22%3A%7B%22Item1%22%3Anull%2C%22Item2%22%3Anull%7D%7D&orderColumn=&isAsc=&page=0&take=71&CategoryType=2";
let companies = [];
const dataBase = require('./data-base');
const RealEstateFunds = dataBase.RealEstateFunds;
const CompanyHistoric = dataBase.CompanyHistoric;
const functionUtils = require('./function_util');


functionUtils.getStocksInfo(urlSearch).then((results) => {
    console.log("Starting progress...")
    const promises = results.map((item, i) => {
      return new Promise((resolve, reject) => {
            setTimeout(() => {
                functionUtils.getProvents({ companyName: item.companyName, url: urlGetProvents, ticker: item.ticker }).then((result) => {
                    const invalidProvent = functionUtils.isInvalidProvents(result, item.ticker);
                    if (!invalidProvent && item.sectorname !== "Fundo Misto") {
                        
                        item.dyMediana = functionUtils.calculateMedianaValue(result);
                        item.magicNumber = item.price / item.dyMediana;
                        companies.push(item);
                    }
                    resolve("teste");
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
  
        RealEstateFunds.destroy({
          where: {},
        })
        .then((rowsDeleted) => {
        })
        .catch((error) => {
          console.error('An error has occurred to delete:', error);
        })

        console.log(companies);
  
        RealEstateFunds.bulkCreate(companies).then(() => {
            console.log("itens criados");
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

