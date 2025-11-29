const DataIngestionService = require('./data-ingestion-service')

const services = {}

function startIngestion(networks = ['public', 'testnet']) {
    networks.forEach(network => {
        if (!services[network]) {
            services[network] = new DataIngestionService(network)
            services[network].start()
        }
    })
}

function stopIngestion() {
    Object.values(services).forEach(service => service.stop())
}

module.exports = {startIngestion, stopIngestion}
