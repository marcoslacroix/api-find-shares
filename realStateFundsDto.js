class RealStateFundsDto {
    constructor(companyid, companyName, ticker, price, dy, subsectorname, segmentname, sectorname, p_vp, dyMediana) {
        this.companyid = companyid;
        this.companyname = companyName;
        this.ticker = ticker;
        this.price = price;
        this.price = price;
        this.dy = dy;
        this.subsectorname = subsectorname;
        this.segmentname = segmentname;
        this.sectorname = sectorname;
        this.dyMediana = dyMediana;
        this.p_vp = p_vp ;
    }
}

function parseRealStateFundsDto(data) {
    const { companyid, companyName, ticker, price, dy, subsectorname, segmentname, sectorname, p_vp, dyMediana } = data;
    return new RealStateFundsDto(companyid, companyName, ticker, price, dy, subsectorname, segmentname, sectorname, p_vp, dyMediana);
}

module.exports = {
    parseRealStateFundsDto
}