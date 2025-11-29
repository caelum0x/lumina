(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@stellar/stellar-base"));
	else if(typeof define === 'function' && define.amd)
		define(["@stellar/stellar-base"], factory);
	else if(typeof exports === 'object')
		exports["assetDescriptor"] = factory(require("@stellar/stellar-base"));
	else
		root["assetDescriptor"] = factory(root["@stellar/stellar-base"]);
})(this, (__WEBPACK_EXTERNAL_MODULE__755__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 755:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__755__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ commonjs)
});

// EXTERNAL MODULE: external "@stellar/stellar-base"
var stellar_base_ = __webpack_require__(755);
;// CONCATENATED MODULE: ./src/liquidity-pool-id.js



/**
 * Generate constant product liquidity pool id from provided assets
 * @param {Array<String>|LiquidityPoolAsset} assetProps
 * @return {String}
 */
function generateLiquidityPoolId(assetProps) {
  const lp = assetProps instanceof Array ? getLiquidityPoolAsset(assetProps) : assetProps;
  if (lp === null) return null; //invalid pool
  const id = (0,stellar_base_.getLiquidityPoolId)('constant_product', lp.getLiquidityPoolParameters());
  return id.toString('hex');
}

/**
 * Generate Stellar LiquidityPoolAsset for a given asset pair
 * @param {Array<String>} asset
 * @return {LiquidityPoolAsset}
 */
function getLiquidityPoolAsset(asset) {
  if (asset[0] === asset[1]) return null; //invalid pool
  const wrappedAssets = asset.map(a => AssetDescriptor.parse(a).toAsset());
  wrappedAssets.sort(stellar_base_.Asset.compare);
  return new stellar_base_.LiquidityPoolAsset(wrappedAssets[0], wrappedAssets[1], stellar_base_.LiquidityPoolFeeV18);
}
;// CONCATENATED MODULE: ./src/validation.js
/**
 * Asset code validation
 * @param {String} code
 * @return {Boolean}
 */
function isValidAssetCode(code) {
  return typeof code === 'string' && /^[a-zA-Z0-9]{1,12}$/.test(code);
}

/**
 * Check whether a pool identifier is valid
 * @param {String|Uint8Array} poolId - Pool id to check
 * @return {Boolean}
 */
function isValidPoolId(poolId) {
  if (typeof poolId === 'string') return /^\w{64}$/.test(poolId);
  if (poolId instanceof Uint8Array) return poolId.length === 32;
  return false;
}

/**
 * Lazy contract address format check
 * @param {String} address
 * @return {Boolean}
 */
function isValidContract(address) {
  return typeof address === 'string' && address.length === 56 && address[0] === 'C';
}
;// CONCATENATED MODULE: ./src/asset-descriptor.js




/**
 * Stellar Asset definition.
 */
class AssetDescriptor {
  /**
   * Creates an instance of the Asset
   * @param {String|Asset|AssetDescriptor|{code:String,issuer:String}} code - Asset code or fully qualified asset name in CODE-ISSUER-TYPE format.
   * @param {String} [issuer] - Asset issuer account public key.
   * @param {String|Number} [type] - Asset type. One of ['credit_alphanum4', 'credit_alphanum12', 'native'].
   */
  constructor(code, issuer, type) {
    if (this instanceof LiquidityPoolDescriptor || this instanceof ContractAssetDescriptor) return;
    if (code instanceof AssetDescriptor) {
      Object.assign(this, code);
    } else if (typeof code === 'object' && !issuer) {
      this.code = code.code;
      this.issuer = code.issuer;
      this.type = code.issuer ? normalizeType(this.code) : 0;
    } else if (issuer !== undefined) {
      this.code = code;
      this.type = normalizeType(code, type);
      this.issuer = issuer;
    } else if ((code === nativeAssetCode || code === 'native') && !type || type === 0) {
      this.type = 0;
      this.code = nativeAssetCode;
    } else {
      if (!code || typeof code !== 'string' || code.length < 3) throw new TypeError(`Invalid asset name: ${code}.`);
      const separator = code.includes(':') ? ':' : '-';
      const parts = code.split(separator);
      if (parts.length < 2) throw new TypeError(`Invalid asset name: ${code}.`);
      this.code = parts[0];
      this.issuer = parts[1];
      this.type = normalizeType(this.code, parts[2]);
    }
    if (this.type !== 0 && !stellar_base_.StrKey.isValidEd25519PublicKey(this.issuer)) throw new Error('Invalid asset issuer address: ' + this.issuer);
    if (!isValidAssetCode(this.code)) throw new Error('Invalid asset code: ' + this.code);
    //if (!this.code || !/^[a-zA-Z0-9]{1,12}$/.test(this.code)) throw new Error(`Invalid asset code. See https://www.stellar.org/developers/guides/concepts/assets.html#alphanumeric-4-character-maximum`)
    Object.freeze(this);
  }

  /**
   * Asset type
   * @type {Number}
   * @readonly
   */
  type = 0;

  /**
   * Check whether the asset is XLM
   * @return {boolean}
   */
  get isNative() {
    return this.type === 0;
  }

  /**
   * Check assets equality
   * @param {AssetDescriptor} anotherAsset
   * @return {Boolean}
   */
  equals(anotherAsset) {
    if (!anotherAsset) return false;
    return this.toString() === anotherAsset.toString();
  }

  /**
   * Returns Asset name in a CODE-ISSUER format (compatible with StellarSDK).
   * @returns {String}
   */
  toString() {
    if (this.isNative) return nativeAssetCode;
    return `${this.code}-${this.issuer}`;
  }

  /**
   * Returns a fully-qualified Asset unique name in a CODE-ISSUER-TYPE format.
   * @returns {String}
   */
  toFQAN() {
    if (this.isNative) return nativeAssetCode;
    return `${this.code}-${this.issuer}-${this.type}`;
  }

  /**
   * Formats Asset as a currency with optional maximum length.
   * @param issuerMaxLength {Number}
   * @returns {String}
   */
  toCurrency(issuerMaxLength) {
    if (this.isNative) return 'XLM';
    if (issuerMaxLength) {
      let issuerAllowedLength = issuerMaxLength - 1,
        shortenedIssuer = trim(this.issuer, issuerAllowedLength);
      return `${this.code}-${shortenedIssuer}`;
    }
    return this.code;
  }

  /**
   * JSON field converter
   * @return {String}
   */
  toJSON() {
    return this.toString();
  }

  /**
   * @return {Asset}
   */
  toAsset() {
    if (this.isNative) return stellar_base_.Asset.native();
    return new stellar_base_.Asset(this.code, this.issuer);
  }

  /**
   * Native asset type.
   * @returns {AssetDescriptor}
   */
  static get native() {
    return new AssetDescriptor(nativeAssetCode);
  }

  /**
   * Parse string or object as AssetDescriptor
   * @param {String|{}} source
   * @return {AssetDescriptor}
   */
  static parse(source) {
    if (!source) return null;
    if (source instanceof AssetDescriptor) return source;
    if (isValidPoolId(source)) return new LiquidityPoolDescriptor(source);
    if (isValidContract(source)) return new ContractAssetDescriptor(source);
    if (source.getLiquidityPoolParameters) return new LiquidityPoolDescriptor(generateLiquidityPoolId(source));
    return new AssetDescriptor(source);
  }
}
class LiquidityPoolDescriptor extends AssetDescriptor {
  constructor(id) {
    super();
    this.poolId = id;
    this.poolType = 0;
    this.type = 3;
    Object.freeze(this);
  }

  /**
   * Poll unique identifier (hash)
   * @type {String}
   * @readonly
   */
  poolId;

  /**
   * Liquidity pool type
   * @type {Number}
   * @readonly
   */
  poolType;

  /**
   * @inheritDoc
   */
  toString() {
    return this.poolId;
  }

  /**
   * @inheritDoc
   */
  toFQAN() {
    return this.poolId;
  }

  /**
   * @inheritDoc
   */
  toCurrency(maxLength = 8) {
    if (this.code) return this.code;
    if (maxLength < 56) return trim(this.poolId, maxLength);
    return this.poolId;
  }

  /**
   * @inheritDoc
   */
  toAsset() {
    throw new TypeError(`Impossible to convert LiquidityPoolDescriptor to LiquidityPoolAsset`);
  }
}
class ContractAssetDescriptor extends AssetDescriptor {
  constructor(contractAddress) {
    super();
    if (!isValidContract(contractAddress)) throw new TypeError('Invalid asset contract: ' + contractAddress);
    this.contract = contractAddress;
    this.type = 4;
    Object.freeze(this);
  }

  /**
   * Contract address
   * @type {String}
   * @readonly
   */
  contract;
  get isContract() {
    return true;
  }

  /**
   * @inheritDoc
   */
  toString() {
    return this.contract;
  }

  /**
   * @inheritDoc
   */
  toFQAN() {
    return this.contract;
  }

  /**
   * @inheritDoc
   */
  toCurrency(maxLength = 8) {
    if (this.code) return this.code;
    if (maxLength < 56) return trim(this.contract, maxLength);
    return this.contract;
  }

  /**
   * @inheritDoc
   */
  toAsset() {
    throw new TypeError(`Impossible to convert ContractAssetDescriptor to LiquidityPoolAsset`);
  }
}

/**
 * Check whether an asset descriptor or string representation is valid
 * @param {String|AssetDescriptor} asset - Asset to check
 * @return {Boolean}
 */
function isAssetValid(asset) {
  if (asset instanceof AssetDescriptor) return true;
  if (isValidContract(asset) || isValidPoolId(asset)) return true;
  try {
    new AssetDescriptor(asset);
    return true;
  } catch (e) {
    return false;
  }
}
const nativeAssetCode = 'XLM';
function normalizeType(code, type) {
  switch (type) {
    case 'credit_alphanum4':
      return 1;
    case 'credit_alphanum12':
      return 2;
    default:
      //autodetect type
      return code.length > 4 ? 2 : 1;
  }
}
function trim(value, symbols) {
  const affixLength = Math.max(2, Math.floor(symbols / 2));
  return value.substring(0, affixLength) + '…' + value.substring(value.length - affixLength);
}
;// CONCATENATED MODULE: ./src/parser.js


/**
 * Parse asset from Horizon API response
 * @param obj {Object} - Object that contains asset properties
 * @param prefix {String} - Optional field names prefix
 * @returns {AssetDescriptor}
 */
function parseAssetFromObject(obj, prefix = '') {
  const keyPrefix = prefix + 'asset';
  if (obj[keyPrefix + '_type'] === 'liquidity_pool_shares') return new LiquidityPoolDescriptor(obj.liquidity_pool_id);
  if (obj[keyPrefix])
    //new format
    return new AssetDescriptor(obj[keyPrefix]);
  const type = obj[keyPrefix + '_type'],
    code = obj[keyPrefix + '_code'],
    issuer = obj[keyPrefix + '_issuer'];
  if (type === 'native' || !type && !issuer) return AssetDescriptor.native;
  return new AssetDescriptor(code, issuer, type);
}
;// CONCATENATED MODULE: ./src/commonjs.js




const assetDescriptor = {
  AssetDescriptor: AssetDescriptor,
  ContractAssetDescriptor: ContractAssetDescriptor,
  LiquidityPoolDescriptor: LiquidityPoolDescriptor,
  isAssetValid: isAssetValid,
  generateLiquidityPoolId: generateLiquidityPoolId,
  getLiquidityPoolAsset: getLiquidityPoolAsset,
  isValidAssetCode: isValidAssetCode,
  isValidContract: isValidContract,
  isValidPoolId: isValidPoolId,
  parseAssetFromObject: parseAssetFromObject
};
/* harmony default export */ const commonjs = (assetDescriptor);
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=asset-descriptor.js.map