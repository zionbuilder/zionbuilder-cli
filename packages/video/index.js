module.exports = (context, options = {}) => {
    const presets = []
    const plugins = []

    const {
        useBuiltIns = 'entry',
        modules = false,
        loose = false,
        spec,
        ignoreBrowserslistConfig = false,
        configPath,
        debug = false,
        decoratorsBeforeExport,
        decoratorsLegacy
      } = options

    plugins.push([
        require('@babel/plugin-transform-runtime').default,
        {
            helpers: false,
            regenerator: true,
        },
    ])

    plugins.push([
        require('@babel/plugin-proposal-class-properties'), 
        { 
            loose 
        }
    ])

    plugins.push([
        require('@babel/plugin-syntax-dynamic-import')
    ])
    
    plugins.push([
        require('@babel/plugin-proposal-decorators'),
        {
            decoratorsBeforeExport,
            legacy: decoratorsLegacy !== false
        }
    ])

    const envOptions = {
        corejs: 3,
        spec,
        loose,
        debug,
        modules,
        useBuiltIns,
        ignoreBrowserslistConfig,
        configPath
    }

    presets.unshift([require('@babel/preset-env'), options])

    return {
        sourceType: 'unambiguous',
        presets,
        plugins
    }
}