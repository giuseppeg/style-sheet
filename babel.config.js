module.exports = {
  presets: [['@babel/preset-env']],
  env: {
    test: {
      presets: [['@babel/preset-env', { targets: { node: true } }]],
    },
  },
}
