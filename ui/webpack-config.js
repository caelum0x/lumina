const path = require('path')
const webpack = require('webpack')
const {initWebpackConfig} = require('@stellar-expert/webpack-template')
const pkgInfo = require('./package.json')

const config = initWebpackConfig({
    entries: {
        app: {
            import: path.join(__dirname, './app.js'),
            htmlTemplate: './static-template/index.html'
        }
    },
    outputPath: './public/',
    staticFilesPath: './static/',
    scss: {
        additionalData: '@import "~@stellar-expert/ui-framework/basic-styles/variables.scss";',
        sassOptions: {
            quietDeps: true
        }
    },
    define: {
        appVersion: pkgInfo.version
    },
    devServer: {
        host: '0.0.0.0',
        server: 'http',
        port: 9001,
        allowedHosts: 'all',
        client: {
            overlay: {
                warnings: false,
                errors: true
            }
        }
    }
})

// Polyfill process.env for browser
if (!config.plugins) config.plugins = []
config.plugins.push(
    new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
)

// Polyfill react-dom/client for React 17 compatibility
if (!config.resolve) config.resolve = {}
if (!config.resolve.alias) config.resolve.alias = {}
config.resolve.alias['react-dom/client$'] = path.join(__dirname, 'react-dom-client-polyfill.js')

// Add fallbacks for Node.js modules
config.resolve.fallback = {
    ...config.resolve.fallback,
    process: require.resolve('process/browser'),
    buffer: require.resolve('buffer/')
}

// Suppress Three.js PlaneBufferGeometry warnings (safe to ignore)
if (config.ignoreWarnings) {
    config.ignoreWarnings.push(
        /PlaneBufferGeometry/,
        /export 'PlaneBufferGeometry'/
    )
} else {
    config.ignoreWarnings = [
        /PlaneBufferGeometry/,
        /export 'PlaneBufferGeometry'/
    ]
}

module.exports = config
