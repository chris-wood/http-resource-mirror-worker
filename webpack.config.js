module.exports = {
  entry: "./src/index.js",
  optimization: {
    minimize: false
  },
  performance: {
    hints: false
  },
  output: {
    path: __dirname + "/dist",
    publicPath: "dist",
    filename: "worker.js"
  }
};
