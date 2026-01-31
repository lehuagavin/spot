Component({
  data: {
    selected: 0,
    color: "#86868b",
    selectedColor: "#0071e3",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "home",
        selectedIconPath: "home-active"
      },
      {
        pagePath: "/pages/member/rights/index",
        text: "权益卡",
        iconPath: "card",
        selectedIconPath: "card-active"
      },
      {
        pagePath: "/pages/order/list/index",
        text: "拼班",
        iconPath: "order",
        selectedIconPath: "order-active"
      },
      {
        pagePath: "/pages/user/index/index",
        text: "我的",
        iconPath: "user",
        selectedIconPath: "user-active"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
    }
  }
});
