const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const { resolve } = require('path');

module.exports = {
	...defaultConfig,
	resolve: {
		alias: {
			...defaultConfig.resolve.alias,
			'@src': resolve(__dirname, 'src'),
			'@tests': resolve(__dirname, 'tests'),
			'^@public': resolve(__dirname, 'public'),
				  },
	},
};