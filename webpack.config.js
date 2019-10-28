const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin=require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    "env-config.js":path.join(__dirname, "env-config.js"),
    "index.js":path.join(__dirname,"src", "index.js"),
  },
  // mode: "development",
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name]",
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          "html-loader"
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                [ "import",{libraryName: "antd", style: 'css'}],
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath:path.resolve(__dirname, 'build')
            },
          },
          'css-loader',
        ],
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['json','markdown','shell','javascript']
    }),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'public'),
      to: path.resolve(__dirname, 'build'),
    }]),
    new MiniCssExtractPlugin({
      filename: 'index.css'
    })
  ],
  devServer: { contentBase: "./" },
  watch: true
};