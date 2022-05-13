module.exports = {
	env: {
		browser: true,
		es2021: true,
		jest: true,
	},

	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	extends: ['airbnb-base'],

	rules: {
		semi: ['error', 'never'],
		'no-unexpected-multiline': 'error',
		'semi-style': ['error', 'first'],
		'no-extra-semi': 'error',

		'arrow-parens': ['error', 'as-needed'],
		'comma-dangle': ['error', 'always-multiline'],

		quotes: ['error', 'single', { avoidEscape: true }],

		'no-tabs': 'off',
		indent: ['error', 'tab'],

		'import/prefer-default-export': 'off',

		'no-console': 'off',

		strict: ['off'],

		'no-plusplus': 'off',
		'no-minusminus': 'off',

		'max-len': ['error', 119],
		'no-constant-condition': ['error', { checkLoops: false }],
		'no-continue': 'off',

		'no-use-before-define': ['error', { functions: false }],
	},
}
