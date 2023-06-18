class BrazilCompanyDTO {
    constructor(companyid, companyName, ticker, price, vi, percent_more, dy, tagAlong, subsectorname, sectorname, valormercado, earningYield) {
        this.companyid = companyid;
        this.companyname = companyName;
        this.ticker = ticker;
        this.price = price;
        this.vi = vi;
        this.price = price;
        this.dy = dy;
        this.percent_more = percent_more;
        this.tagAlong = tagAlong;
        this.subsectorname = subsectorname;
        this.sectorname = sectorname;
        this.valormercado = valormercado
        this.earningYield = earningYield;
    }
}

function parseBrazilCompanyDTO(data) {
    const { companyid, companyname, ticker, price, vi, percent_more, dy, tagAlong, subsectorname, sectorname, valormercado, earningYield} = data;
    return new BrazilCompanyDTO(companyid, companyname, ticker, price, vi, percent_more, dy, tagAlong, subsectorname, sectorname, valormercado, earningYield);
}

module.exports = {
    parseBrazilCompanyDTO
}