export const assets = {
    "btc": 'btc',
    'erc-20': 'eth',
    'arbitrum sepolia': 'eth',
    'base sepolia': 'eth',
    'holesky': 'eth',
    'trc-20': 'trx',
    'algo': 'algo',
    'ada': 'cardano',
    'xlm': 'str',
    'sol': 'sol'
}
 
export const addressRegex = {
    'btc': /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}|bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58})$/,
    'erc-20': /^0x[a-fA-F0-9]{40}$/,
    'arbitrum sepolia':/^0x[a-fA-F0-9]{40}$/,
    'base sepolia':/^0x[a-fA-F0-9]{40}$/,
    'holesky':/^0x[a-fA-F0-9]{40}$/,
    'trc-20': /^(T[1-9A-HJ-NP-Za-km-z]{33}|41[a-fA-F0-9]{40})$/,
    'algo':/^[A-Z2-7]{58}$/,
    'ada':/^((addr1|DdzFFzC)[0-9a-zA-Z]{58,})$/,
    'xlm':/^G[A-Z2-7]{55}$/,
    'sol':/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}
 
export const bitcoinAddressFormats = {
    default:/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2pkh: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // Legacy
    p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,   // Pay-to-Script-Hash
    bech32m: /^bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/,    // Taproot (Bech32m)
    bech32: /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}$/,  // SegWit
};
export const tronAddressFormats = {
    default: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    base58: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,  // Base58 (starts with 'T')
    hex: /^41[a-fA-F0-9]{40}$/              // Hexadecimal (starts with '41')
};
 
export const evmAddressFormats = {
    default:/^0x[a-fA-F0-9]{40}$/,
    hexadecimal: /^0x[a-fA-F0-9]{40}$/              // EVM-compatible (starts with '0x')
};
 
export const stellarAddressFormats={
    default:/^G[A-Z2-7]{55}$/,
}
export const cardanoAddressFormats={
    default:/^addr1[0-9a-z]{58,}$/,
    base58:/^DdzFFzC[0-9a-zA-Z]{58,}$/,
    bech32:/^addr1[0-9a-z]{58,}$/,
 
}
export const algorandAddressFormats={
    default:/^[A-Z2-7]{58}$/,
}
export const solanaAddressFormats={
    default:/^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
}
export const addressRegexBasedOnAsset=(asset:any)=>{
    switch(asset){
        case 'btc': return bitcoinAddressFormats
        case 'trx': return tronAddressFormats
        case 'eth': return evmAddressFormats
        case 'algo': return algorandAddressFormats
        case 'sol':return solanaAddressFormats
        case 'str':return stellarAddressFormats
        case 'cardano':return cardanoAddressFormats
        default : return evmAddressFormats
    }
}
 export const getaddressFormat = (network:any, address:any) => {
    const getExactFormat = (formats:any) => {
        for (const key in formats) {
            if (formats[key].test(address)) {
                return key;
            }
        }
        return null
    }
    switch (network) {
        case 'ERC-20': return getExactFormat(evmAddressFormats);
        case 'BTC': return getExactFormat(bitcoinAddressFormats);
        case 'TRC-20': return getExactFormat(tronAddressFormats);
        case 'Cardano':return getExactFormat(cardanoAddressFormats);
        case 'ALGO':return getExactFormat(algorandAddressFormats);
        case 'XLM':return getExactFormat(stellarAddressFormats);
        case 'SOL':return getExactFormat(solanaAddressFormats)
        case 'Solana':return getExactFormat(solanaAddressFormats)
        default: return getExactFormat(evmAddressFormats)
    }
}
