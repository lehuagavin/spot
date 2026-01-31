/**
 * 义城上门教育 - 小程序应用
 */
App({
  onLaunch() {
    // 应用启动时执行
    console.log('小程序启动');
  },

  globalData: {
    userInfo: null,
    apiBase: 'http://localhost:8000/api/v1',
  },
});
