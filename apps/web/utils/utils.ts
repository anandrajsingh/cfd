export const PRECISION = 10000;
export const USD_PRECISION = 100;

export function toDisplayPrice(intPrice:number){
    return Number.parseFloat((intPrice / PRECISION).toFixed(2));
}

export function toInternalPrice(price: number){
    return Math.round(price * PRECISION);
}

export function getPrecisedDate(val:string){
    return Math.round(parseFloat(val) * PRECISION);
}

export function getRealValue(val:number){
    return val / PRECISION
}

export function toDisplayPriceUSD(val: number){
    return val / USD_PRECISION;
}

export function convertToUsdPrice(val: number){
    return Math.round(val * USD_PRECISION);
}
