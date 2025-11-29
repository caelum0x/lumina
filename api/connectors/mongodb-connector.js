const MongoClient = require('mongodb').MongoClient
const config = require('../app.config.json')

const connections = {
    archive: {},

    async init() {
        for (const [networkName, networkParams] of Object.entries(config.networks)) {
            // Skip if no db configured
            if (!networkParams.db) {
                console.log(`No database configured for ${networkName}, skipping`)
                continue
            }

            const options = {
                appname: 'api-stellar-expert',
                promoteValues: true,
                promoteLongs: false,
                useUnifiedTopology: true,
                maxPoolSize: 30,
                minPoolSize: 2
            }
            
            // Don't use directConnection for SRV URIs
            if (!networkParams.db.includes('mongodb+srv://')) {
                options.directConnection = true
            }

            try {
                const connection = await MongoClient.connect(networkParams.db, options)
                connections[networkName] = connection.db()
                console.log(`Connected to db ${networkParams.db}`)

                if (networkParams.archive) {
                    const archiveOptions = {...options}
                    if (!networkParams.archive.includes('mongodb+srv://')) {
                        archiveOptions.directConnection = true
                    }
                    const archive = await MongoClient.connect(networkParams.archive, archiveOptions)
                    connections.archive[networkName] = archive.db()
                    console.log(`Connected to archive ${networkParams.archive}`)
                }
            } catch (e) {
                console.log(`MongoDB connection failed for ${networkName}, will use Horizon fallback:`, e.message)
            }
        }
    }
}

module.exports = connections