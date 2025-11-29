import {StrKey, Asset} from '@stellar/stellar-base'
import {generateLiquidityPoolId} from './liquidity-pool-id'
import {isValidAssetCode, isValidContract, isValidPoolId} from './validation'

/**
 * Stellar Asset definition.
 */
export class AssetDescriptor {
    /**
     * Creates an instance of the Asset
     * @param {String|Asset|AssetDescriptor|{code:String,issuer:String}} code - Asset code or fully qualified asset name in CODE-ISSUER-TYPE format.
     * @param {String} [issuer] - Asset issuer account public key.
     * @param {String|Number} [type] - Asset type. One of ['credit_alphanum4', 'credit_alphanum12', 'native'].
     */
    constructor(code, issuer, type) {
        if (this instanceof LiquidityPoolDescriptor || this instanceof ContractAssetDescriptor)
            return
        if (code instanceof AssetDescriptor) {
            Object.assign(this, code)
        } else if (typeof code === 'object' && !issuer) {
            this.code = code.code
            this.issuer = code.issuer
            this.type = code.issuer ? normalizeType(this.code) : 0
        } else if (issuer !== undefined) {
            this.code = code
            this.type = normalizeType(code, type)
            this.issuer = issuer
        } else if (((code === nativeAssetCode || code === 'native') && !type) || type === 0) {
            this.type = 0
            this.code = nativeAssetCode
        } else {
            if (!code || typeof code !== 'string' || code.length < 3)
                throw new TypeError(`Invalid asset name: ${code}.`)
            const separator = code.includes(':') ? ':' : '-'
            const parts = code.split(separator)
            if (parts.length < 2)
                throw new TypeError(`Invalid asset name: ${code}.`)
            this.code = parts[0]
            this.issuer = parts[1]
            this.type = normalizeType(this.code, parts[2])
        }
        if (this.type !== 0 && !StrKey.isValidEd25519PublicKey(this.issuer))
            throw new Error('Invalid asset issuer address: ' + this.issuer)
        if (!isValidAssetCode(this.code))
            throw new Error('Invalid asset code: ' + this.code)
        //if (!this.code || !/^[a-zA-Z0-9]{1,12}$/.test(this.code)) throw new Error(`Invalid asset code. See https://www.stellar.org/developers/guides/concepts/assets.html#alphanumeric-4-character-maximum`)
        Object.freeze(this)
    }

    /**
     * Asset type
     * @type {Number}
     * @readonly
     */
    type = 0

    /**
     * Check whether the asset is XLM
     * @return {boolean}
     */
    get isNative() {
        return this.type === 0
    }

    /**
     * Check assets equality
     * @param {AssetDescriptor} anotherAsset
     * @return {Boolean}
     */
    equals(anotherAsset) {
        if (!anotherAsset)
            return false
        return this.toString() === anotherAsset.toString()
    }

    /**
     * Returns Asset name in a CODE-ISSUER format (compatible with StellarSDK).
     * @returns {String}
     */
    toString() {
        if (this.isNative)
            return nativeAssetCode
        return `${this.code}-${this.issuer}`
    }

    /**
     * Returns a fully-qualified Asset unique name in a CODE-ISSUER-TYPE format.
     * @returns {String}
     */
    toFQAN() {
        if (this.isNative)
            return nativeAssetCode
        return `${this.code}-${this.issuer}-${this.type}`
    }

    /**
     * Formats Asset as a currency with optional maximum length.
     * @param issuerMaxLength {Number}
     * @returns {String}
     */
    toCurrency(issuerMaxLength) {
        if (this.isNative)
            return 'XLM'
        if (issuerMaxLength) {
            let issuerAllowedLength = issuerMaxLength - 1,
                shortenedIssuer = trim(this.issuer, issuerAllowedLength)

            return `${this.code}-${shortenedIssuer}`
        }
        return this.code
    }

    /**
     * JSON field converter
     * @return {String}
     */
    toJSON() {
        return this.toString()
    }

    /**
     * @return {Asset}
     */
    toAsset() {
        if (this.isNative)
            return Asset.native()
        return new Asset(this.code, this.issuer)
    }

    /**
     * Native asset type.
     * @returns {AssetDescriptor}
     */
    static get native() {
        return new AssetDescriptor(nativeAssetCode)
    }

    /**
     * Parse string or object as AssetDescriptor
     * @param {String|{}} source
     * @return {AssetDescriptor}
     */
    static parse(source) {
        if (!source)
            return null
        if (source instanceof AssetDescriptor)
            return source
        if (isValidPoolId(source))
            return new LiquidityPoolDescriptor(source)
        if (isValidContract(source))
            return new ContractAssetDescriptor(source)
        if (source.getLiquidityPoolParameters)
            return new LiquidityPoolDescriptor(generateLiquidityPoolId(source))
        return new AssetDescriptor(source)
    }
}

export class LiquidityPoolDescriptor extends AssetDescriptor {
    constructor(id) {
        super()
        this.poolId = id
        this.poolType = 0
        this.type = 3
        Object.freeze(this)
    }

    /**
     * Poll unique identifier (hash)
     * @type {String}
     * @readonly
     */
    poolId

    /**
     * Liquidity pool type
     * @type {Number}
     * @readonly
     */
    poolType

    /**
     * @inheritDoc
     */
    toString() {
        return this.poolId
    }

    /**
     * @inheritDoc
     */
    toFQAN() {
        return this.poolId
    }

    /**
     * @inheritDoc
     */
    toCurrency(maxLength = 8) {
        if (this.code)
            return this.code
        if (maxLength < 56)
            return trim(this.poolId, maxLength)
        return this.poolId
    }

    /**
     * @inheritDoc
     */
    toAsset() {
        throw new TypeError(`Impossible to convert LiquidityPoolDescriptor to LiquidityPoolAsset`)
    }
}

export class ContractAssetDescriptor extends AssetDescriptor {
    constructor(contractAddress) {
        super()
        if (!isValidContract(contractAddress))
            throw new TypeError('Invalid asset contract: ' + contractAddress)
        this.contract = contractAddress
        this.type = 4
        Object.freeze(this)
    }

    /**
     * Contract address
     * @type {String}
     * @readonly
     */
    contract

    get isContract() {
        return true
    }

    /**
     * @inheritDoc
     */
    toString() {
        return this.contract
    }

    /**
     * @inheritDoc
     */
    toFQAN() {
        return this.contract
    }

    /**
     * @inheritDoc
     */
    toCurrency(maxLength = 8) {
        if (this.code)
            return this.code
        if (maxLength < 56)
            return trim(this.contract, maxLength)
        return this.contract
    }

    /**
     * @inheritDoc
     */
    toAsset() {
        throw new TypeError(`Impossible to convert ContractAssetDescriptor to LiquidityPoolAsset`)
    }
}

/**
 * Check whether an asset descriptor or string representation is valid
 * @param {String|AssetDescriptor} asset - Asset to check
 * @return {Boolean}
 */
export function isAssetValid(asset) {
    if (asset instanceof AssetDescriptor)
        return true
    if (isValidContract(asset) || isValidPoolId(asset))
        return true
    try {
        new AssetDescriptor(asset)
        return true
    } catch (e) {
        return false
    }
}

const nativeAssetCode = 'XLM'

function normalizeType(code, type) {
    switch (type) {
        case 'credit_alphanum4':
            return 1
        case 'credit_alphanum12':
            return 2
        default: //autodetect type
            return code.length > 4 ? 2 : 1
    }
}

function trim(value, symbols) {
    const affixLength = Math.max(2, Math.floor(symbols / 2))
    return value.substring(0, affixLength) + '…' + value.substring(value.length - affixLength)
}