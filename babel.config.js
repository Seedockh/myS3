module.exports = api => {
  api.cache(true)

  const presets = ['@babel/preset-typescript', '@babel/preset-env']
  const plugins = [
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-proposal-export-default-from'],
    ['@babel/plugin-transform-runtime']
  ]

  return {
    presets,
    plugins
  }
}
