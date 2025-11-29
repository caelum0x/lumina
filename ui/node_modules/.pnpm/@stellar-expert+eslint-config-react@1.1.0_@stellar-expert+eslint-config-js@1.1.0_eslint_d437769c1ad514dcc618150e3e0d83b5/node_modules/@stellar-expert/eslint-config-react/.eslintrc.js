module.exports = {
    extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        "@stellar-expert/eslint-config-js"
    ],
    parserOptions: {
        ecmaFeatures: {
            'jsx': true,
            'modules': true
        }
    },
    plugins: [
        'react'
    ],
    rules: {
        //OFF
        'react/prop-types': 'off',
        'react/forbid-prop-types': 'off',
        'react/require-default-props': 'off',
        'react/destructuring-assignment': 'off',
        'react/jsx-one-expression-per-line': 'off',
        'react/jsx-wrap-multilines': 'off',
        'react/jsx-props-no-spreading': 'off',

        //WARN
        'react/function-component-definition': ['warn', {namedComponents: 'function-declaration'}],
        'react/sort-comp': 'warn',
        'react/no-unused-prop-types': 'warn',
        'react/no-array-index-key': 'warn',
        'react/no-access-state-in-setstate': 'warn',
        'react/no-unused-state': 'warn',
        'react/default-props-match-prop-types': 'warn',
        'react/hook-use-state': 'warn',
        'react/self-closing-comp': 'warn',
        'react/jsx-curly-brace-presence': ['warn', {props: 'never', children: 'never', propElementValues: 'always'}],
        'react/jsx-first-prop-new-line': ['warn', 'never'],
        'react/jsx-boolean-value': ['warn', 'never'],
        'react/jsx-fragments': ['warn', 'syntax'],
        'react/jsx-no-bind': 'warn',
        'react/jsx-no-constructed-context-values': 'warn',
        'react/jsx-no-useless-fragment': 'warn',
        'react/jsx-no-leaked-render': 'warn',

        //ERROR
        'indent': ['error', 4, {ignoredNodes: ['JSXElement *']}],
        'react/jsx-indent': ['error', 4, {indentLogicalExpressions: true, checkAttributes: true}],
        'react/jsx-indent-props': ['error', 'first'],
        'react/no-this-in-sfc': 'error',
        'react/no-typos': 'error',
        'react/prefer-stateless-function': 'error',
        'react/style-prop-object': 'error',
        'react/void-dom-elements-no-children': 'error',
        'react/jsx-closing-bracket-location': ['error', {selfClosing: 'after-props', nonEmpty: 'after-props'}],
        'react/jsx-curly-spacing': ['error', {when: 'never'}],
        'react/jsx-equals-spacing': ['error', 'never'],
        'react/jsx-filename-extension': ['error', {extensions: ['.js']}],
        'react/jsx-no-script-url': 'error',
        'react/jsx-props-no-multi-spaces': 'error',
        'react/jsx-pascal-case': ['error', {allowNamespace: true}],
        'react/jsx-tag-spacing': ['error', {closingSlash: 'never', beforeSelfClosing: 'never', beforeClosing: 'never'}]
    },
    'settings': {
        'react': {
            'pragma': 'React',
            'version': 'detect'
        }
    }
}