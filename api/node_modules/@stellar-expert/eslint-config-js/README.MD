# @stellar-expert/eslint-config-js

Basic StellarExpert ESLint config for JS projects

## Usage

1. Install package  

    ```
    npm i -D github:stellar-expert/eslint-config-js
    ```

2. Create `.eslintrc.js` file in the project root  

    ```js
    module.exports = {
        //utilize this ESLint config
        extends: ['@stellar-expert/eslint-config-js'],
        //provide paths to ignore
        ignorePatterns: ['distr/', 'node_modules/'],
        //define project-specific globals if any
        globals: {},
        //ovveride some rules if needed
        rules: {
            'no-console': 'off'
        }
    }
    ```

3. Have fun 🚀