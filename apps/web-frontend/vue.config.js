module.exports = {
  runtimeCompiler: true,
  publicPath: process.env.CDN_ENV ? process.env.CDN_ENV : '/',

  chainWebpack: config => {
    config.output.globalObject('this');

    // Copy static assets (including the engine files and skydata)
    config.plugin('copy')
      .tap(([pathConfigs]) => {
         const to = pathConfigs[0].to;
         pathConfigs[0].force = true;

         // Copy engine JS and WASM from the build folder
         pathConfigs.unshift({
           from: '../../build/stellarium-web-engine.js',
           to: to + '/js/stellarium-web-engine.js',
         });
         pathConfigs.unshift({
           from: '../../build/stellarium-web-engine.wasm',
           to: to + '/js/stellarium-web-engine.wasm',
         });

         // Copy skydata
         pathConfigs.unshift({
           from: '../skydata',
           to: to + '/skydata',
         });

         return [pathConfigs];
       });

    // Prevent Webpack from trying to parse .wasm files
    config.module
      .rule('ignore-wasm')
      .test(/\.wasm$/)
      .type('javascript/auto')
      .use('null-loader')
      .loader('null-loader');
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  }
}