const path = require('path');

module.exports = function (context) {
  const {siteConfig} = context;
  const {themeConfig} = siteConfig;
  const {baiduAnalytics} = themeConfig || {};

  if (!baiduAnalytics) {
    throw new Error(
      `You need to specify 'baiduAnalytics' object in 'themeConfig' with 'trackingId' field in it to use docusaurus-plugin-baidu-analytics`,
    );
  }

  const {trackingID} = baiduAnalytics;

  if (!trackingID) {
    throw new Error(
      'You specified the `baiduAnalytics` object in `themeConfig` but the `trackingID` field was missing. ' +
        'Please ensure this is not a mistake.',
    );
  }

  const isProd = process.env.NODE_ENV === 'production';

  return {
    name: 'docusaurus-plugin-baidu-analytics',

    injectHtmlTags() {
      if (!isProd) {
        return {};
      }
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              async: true,
              src: 'https://hm.baidu.com/hm.js?'+trackingID,
            },
          },
        ],
      };
    },
  };
};
