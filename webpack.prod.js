const path = require('path')

module.exports = {
	mode: 'production',

	entry: {
		index: './src/index.js',
	},

	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},

	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{

				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
			},
			{
				test: /template\.html$/i,
				loader: 'html-loader',
			},
		],
	},

}
