export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/search/index',
    'pages/calculator/index',
    'pages/detail/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1a56db',
    navigationBarTitleText: '策查查',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f6f8',
  },
  tabBar: {
    color: '#8c95a6',
    selectedColor: '#1a56db',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png',
      },
      {
        pagePath: 'pages/calculator/index',
        text: '工具',
        iconPath: 'assets/tab-tool.png',
        selectedIconPath: 'assets/tab-tool-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-user.png',
        selectedIconPath: 'assets/tab-user-active.png',
      },
    ],
  },
})
