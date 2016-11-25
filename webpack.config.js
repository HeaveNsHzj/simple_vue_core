
var count = 5;
var entry = {};
for (var i = 0; i < count; i++) {
  var key = 'step' + (i + 1);
  entry[key] = `./${key}/main.js`
}
entry.page = './js/page.js'

module.exports = {
  entry: entry,
  watch: true,
  output: {
    path: 'dist',
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  },
  cache: true,
  babel: {
    presets: ['es2015', 'stage-2'],
    plugins: []
  },
  module: {
    loaders: [{
      test: /\.js/,
      exclude: /node_modules|dist|webpack\.config\.js/,
      loader: 'babel'
    }, {
      test: /\.css/,
      loader: 'style-loader!css-loader'
    }]
  },
  resolve: {
    alias: {
      "vue$": "vue/dist/vue.js"
    }
  }
}
