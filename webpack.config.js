module.exports = {
  entry: {
    main: './src/main.js'
  },
  mode: 'development',
  optimization: {
    minimize: false
  },
  // devtool: 'source-map',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                '@babel/plugin-transform-react-jsx',
                {
                  pragma: 'createElement'
                }
              ]
            ]
          }
        }
      }
    ]
  }
}