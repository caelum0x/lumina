# @stellar-expert/eslint-config-react

> Basic StellarExpert ESLint conventions for React web apps 

## Usage

1. Install package

    ```
    npm i -D @stellar-expert/eslint-config-react
    ```

2. Create `.eslintrc.js` file in the project root

    ```js
    module.exports = {
        //utilize this ESLint config
        extends: ['@stellar-expert/eslint-config-react'],
        //provide paths to ignore
        ignorePatterns: ['distr/', 'node_modules/'],
        //define project-specific globals if any
        globals: {},
        //ovveride some rules if needed
        rules: {
            'react/no-typos': 'error'
        }
    }
    ```

3. Have fun 🚀