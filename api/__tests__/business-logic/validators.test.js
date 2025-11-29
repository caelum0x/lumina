const {validateNetwork, validateAccountAddress, validateAssetName} = require('../../../business-logic/validators')
const errors = require('../../../business-logic/errors')

describe('Validators', () => {
    describe('validateNetwork', () => {
        it('should validate known networks', () => {
            expect(() => validateNetwork('public')).not.toThrow()
            expect(() => validateNetwork('testnet')).not.toThrow()
        })

        it('should throw error for unknown network', () => {
            expect(() => validateNetwork('unknown')).toThrow()
        })
    })

    describe('validateAccountAddress', () => {
        it('should validate valid Stellar account address', () => {
            const validAddress = 'GBLHEWM4JUJDIDBPSHRNIF43SCJZ2SRPIJYKNRV3T57A6UGLMBB3QSIN'
            expect(() => validateAccountAddress(validAddress)).not.toThrow()
        })

        it('should throw error for invalid account address', () => {
            expect(() => validateAccountAddress('invalid')).toThrow()
        })
    })

    describe('validateAssetName', () => {
        it('should validate XLM', () => {
            expect(() => validateAssetName('XLM')).not.toThrow()
        })

        it('should validate asset with issuer', () => {
            const asset = 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
            expect(() => validateAssetName(asset)).not.toThrow()
        })

        it('should throw error for invalid asset format', () => {
            expect(() => validateAssetName('invalid-asset')).toThrow()
        })
    })
})

