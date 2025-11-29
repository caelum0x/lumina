const db = require('../../connectors/mongodb-connector')

const xlmMeta = {
    _id: 0,
    name: 'XLM',
    asset: 'XLM',
    domain: 'stellar.org',
    tomlInfo: {
        image: 'https://stellar.expert/img/vendor/stellar.svg',
        orgName: 'Stellar Development Foundation',
        name: 'Lumens',
        desc: 'Stellar Lumens (XLM) is the native cryptocurrency of the Stellar network',
        decimals: 7
    },
    isNative: true
}

/**
 * Find domains that have been added to the blocklist
 * @param {String} network - Stellar network
 * @param {String[]} domains
 * @return {Promise<String[]>}
 * @internal
 */
async function checkBlockedDomains(network, domains) {
    try {
        if (!db[network] || !db[network].collection) return []
        const filter = [...domains]
        for (let domain of domains) {
            for (const tld of retrieveTopLevelDomains(domain)) {
                filter.push(tld)
            }
        }
        const res = await db[network].collection('blocked_domains')
            .find({_id: {$in: filter}})
            .project({_id: 1})
            .toArray()
        return res.map(v => v._id)
    } catch (e) {
        return []
    }
}

/**
 * Fetch tags for account
 * @param {String} network - Stellar network
 * @param {String[]} issuers - Asset issuer accounts to check
 * @return {Promise<String[]>}
 * @internal
 */
async function checkIssuersWarnings(network, issuers) {
    try {
        if (!db[network] || !db[network].collection) return []
        return await db[network].collection('directory')
            .find({
                _id: {$in: issuers},
                tags: {$in: ['malicious', 'unsafe']}
            }) //search only for accounts with 'malicious' and 'unsafe' tags
            .project({_id: 1})
            .toArray()
    } catch (e) {
        return []
    }
}

/**
 * Retrieve assets meta from the db
 * @param {String} network - Stellar network
 * @param {String[]|Number[]} assets - Asset ids or FQANs
 * @return {Promise<Array<{asset: String, name: String, domain?: String, unconfirmed_domain?: String, toml_info?: {}}>>}
 */
async function retrieveAssetsMetadata(network, assets) {
    if (!assets.length) return []
    
    let foundAssets = []
    
    // Try MongoDB first
    try {
        const query = typeof assets[0] === 'number' ?
            {_id: {$gt: 0, $in: assets}} :
            {name: {$in: assets}, _id: {$gt: 0}}

        if (db[network] && db[network].collection) {
            foundAssets = await db[network].collection('assets')
                .find(query)
                .project({name: 1, domain: 1, tomlInfo: 1})
                .toArray()
        }
    } catch (e) {
        console.log('MongoDB query failed, using hardcoded assets only:', e.message)
    }

    //add predefined XLM meta
    if (assets.includes('XLM') || assets.includes(0)) {
        foundAssets.unshift(xlmMeta)
    }

    const domainsMap = {}
    const issuersMap = {}

    //normalize response properties
    foundAssets = foundAssets.map(a => {
        const res = {_id: a._id, asset: a.name, name: a.name}
        if (a.domain) {
            if (a.tomlInfo) {
                //TOML metadata exists
                res.domain = a.domain
                res.toml_info = a.tomlInfo
                domainsMap[a.domain] = 1
            } else {
                //mark domain as unconfirmed if relevant TOML info not found
                res.unconfirmed_domain = a.domain
            }
            domainsMap[a.domain] = 1
        }
        if (a.name.includes('-')) {
            const issuer = a.name.split('-')[1]
            issuersMap[issuer] = 1
        }
        return res
    })

    //process Directory info
    const [blockedDomains, issuerWarnings] = await Promise.all([
        checkBlockedDomains(network, Object.keys(domainsMap)), //check whether any of the found domains has been blocked
        checkIssuersWarnings(network, Object.keys(issuersMap)) //check warnings set to issuer accounts
    ])

    if (blockedDomains.length) {
        const blocked = new Set(blockedDomains)
        for (const a of foundAssets) {
            const originalDomain = a.domain || a.unconfirmed_domain
            for (let domain of [originalDomain, ...retrieveTopLevelDomains(originalDomain)]) {
                if (blocked.has(domain)) {
                    a.unsafe = true
                    break
                }
            }
        }
    }

    if (issuerWarnings.length) {
        for (const issuerTags of issuerWarnings) {
            for (const a of foundAssets) {
                if (a.name.includes(issuerTags._id)) {
                    a.unsafe = true
                }
            }
        }
    }
    return foundAssets
}

/**
 * @param {string} domain
 * @return {string[]}
 */
function retrieveTopLevelDomains(domain) {
    if (typeof domain !== 'string')
        return []
    const res = []
    const parts = domain.split('.')
    while (parts.length > 2) {
        parts.shift()
        res.push(parts.join('.'))
    }
    return res
}

module.exports = {retrieveAssetsMetadata}