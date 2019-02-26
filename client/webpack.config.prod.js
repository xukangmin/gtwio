var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var BrotliPlugin = require('brotli-webpack-plugin');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

//console.log('Node Modules: '+ JSON.stringify(nodeModules));
module.exports = [
{
    // The configuration for the server-side rendering
    name: 'server',
    target: 'node',
    entry: './server/routes/server.js',
    output: {
        path: path.join(__dirname, './server/bin'),
        publicPath: path.join(__dirname, './server/bin'),
        filename: 'server.js'
    },
    externals: nodeModules,
    module: {
        rules: [
            { test : /\.jsx?/,

                loaders: [
                    'babel-loader'
                    //,'jsx-loader'
                ]
            },
            {test: /\.css$/, use: [
                'style-loader',
                'css-loader'
                ]
              },
            {test:  /\.json$/, loader: 'json-loader' },
            {test: /(\.eot|\.woff2|\.jpg|\.ttf|\.svg)/, loader: 'file-loader'},
        ]
    }
},
{
  name: 'client',
  mode: 'production',
  devtool: '',
  entry: path.resolve(__dirname, 'client/src') + '/app.js',
  output: {
    path: path.join(__dirname, './server/public/js'),
    filename: '[name].bundle.js'
  },
  optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		}
	},
  module: {
      rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          },
          {test: /\.css$/, use: [
            'style-loader',
            'css-loader'
            ]
          },
          {test:  /\.json$/, loader: 'json-loader' },
          {
            test: /\.(png|jpg|gif)$/,
            loader: 'url-loader'
          },
      ]
  }

}

];


/*
{
    test: /\.svg$/,
    loader: 'babel-loader!svg-react-loader'
},
*/
