var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var BrotliPlugin = require('brotli-webpack-plugin');
const Dotenv = require('dotenv-webpack');

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
    entry: './server/srcServer.js',
    output: {
        path: path.join(__dirname, './server/bin'),
        publicPath: path.join(__dirname, './server/bin'),
        filename: 'server.js'
    },
    plugins: [
      new Dotenv()
    ],
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          },
          {test: /(\.css)$/, loaders: ['style-loader', 'css-loader']},
          {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader"},
          {test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=5000"},
          {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream"},
          {
            test: /\.(png|jpg|gif)$/,
            loader: 'url-loader'
          },
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
  plugins: [
    new Dotenv()
  ],
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
          {test: /(\.css)$/, loaders: ['style-loader', 'css-loader']},
          {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader"},
          {test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=5000"},
          {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream"},
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
