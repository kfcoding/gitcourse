const path = require("path");

module.exports = {
  watch: true,
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 500,
    ignored: /node_modules/
  },
  mode: "production",
  entry: {
    "index.js":path.join(__dirname,"src", "index.js")
  },
  output: {
    path: path.join(__dirname, "lib"),
    filename: "[name]",
    publicPath: '/',
    libraryTarget: "umd",
    library: "minsmap",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [
                ["import", {libraryName: "antd", style: "css"}]
              ],
              compact:true
            },
          }
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader','css-loader'
        ],
      }
    ]
  },
  plugins: [
  ]
};