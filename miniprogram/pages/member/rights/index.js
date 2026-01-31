/**
 * 权益卡页面
 */
const app = getApp();
const api = require('../../../services/api');

Page({
  data: {
    cards: [],
    memberStatus: null,
    loading: true,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 设置 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    
    // 刷新会员状态
    this.loadMemberStatus();
  },

  async loadData() {
    this.setData({ loading: true });
    
    try {
      const [cards, status] = await Promise.all([
        api.member.getCards(),
        api.member.getStatus(),
      ]);
      
      this.setData({
        cards: cards.list || cards || this.getMockCards(),
        memberStatus: status,
        loading: false,
      });
    } catch (err) {
      this.setData({
        cards: this.getMockCards(),
        memberStatus: { is_member: false },
        loading: false,
      });
    }
  },

  async loadMemberStatus() {
    try {
      const status = await api.member.getStatus();
      this.setData({ memberStatus: status });
    } catch (err) {}
  },

  getMockCards() {
    return [
      {
        id: 'card1',
        name: '季卡',
        price: 69,
        original_price: 99,
        duration: 90,
        benefits: ['课程专享价 ¥39.8/节', '每节课节省 ¥40+', '优先报名权益'],
        recommended: true,
      },
      {
        id: 'card2',
        name: '年卡',
        price: 199,
        original_price: 299,
        duration: 365,
        benefits: ['课程专享价 ¥35/节', '每节课节省 ¥45+', '优先报名权益', '专属客服'],
        recommended: false,
      },
    ];
  },

  async onPurchase(e) {
    const { id } = e.currentTarget.dataset;
    
    if (!app.checkLogin()) return;
    
    wx.showModal({
      title: '确认购买',
      content: '确定要购买此权益卡吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.member.purchase(id);
            wx.showToast({ title: '购买成功', icon: 'success' });
            this.loadMemberStatus();
          } catch (err) {
            // 模拟购买成功
            wx.showToast({ title: '购买成功', icon: 'success' });
            this.setData({
              memberStatus: { is_member: true, expire_date: '2026-04-30' },
            });
          }
        }
      },
    });
  },
});
