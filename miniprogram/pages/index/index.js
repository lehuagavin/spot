/**
 * 首页
 */
const app = getApp();
const api = require('../../services/api');

Page({
  /**
   * 页面数据
   */
  data: {
    // 启动流程
    showPrivacy: false,
    showLocationAuth: false,
    
    // 轮播图
    banners: [],
    
    // 位置
    location: null,
    selectedCommunity: null,
    
    // 筛选
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'enrolling', label: '报名中' },
      { key: 'ongoing', label: '进行中' },
      { key: 'completed', label: '已结束' },
    ],
    currentFilter: 'all',
    
    // 课程列表
    courses: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 下拉刷新
    refreshing: false,
  },

  /**
   * 页面加载
   */
  onLoad() {
    console.log('首页加载');
    this.checkStartupFlow();
  },

  /**
   * 页面显示
   */
  onShow() {
    // 检查小区是否变化
    const selectedCommunity = app.globalData.selectedCommunity;
    if (selectedCommunity && 
        (!this.data.selectedCommunity || 
         selectedCommunity.id !== this.data.selectedCommunity.id)) {
      this.setData({ selectedCommunity });
      this.refreshData();
    }
  },

  /**
   * 检查启动流程
   */
  checkStartupFlow() {
    // 检查隐私协议
    if (app.needShowPrivacy()) {
      this.setData({ showPrivacy: true });
    } else {
      this.checkLocationAndLoad();
    }
  },

  /**
   * 同意隐私协议
   */
  onPrivacyAgree() {
    this.setData({ showPrivacy: false });
    // 显示位置授权
    this.setData({ showLocationAuth: true });
  },

  /**
   * 位置授权成功
   */
  onLocationSuccess(e) {
    const { location } = e.detail;
    this.setData({ 
      showLocationAuth: false,
      location,
    });
    this.loadInitialData();
  },

  /**
   * 跳过位置授权
   */
  onLocationSkip() {
    this.setData({ showLocationAuth: false });
    this.loadInitialData();
  },

  /**
   * 位置授权被拒绝
   */
  onLocationDenied() {
    // 保持弹窗显示，让用户可以去设置
  },

  /**
   * 检查位置并加载数据
   */
  async checkLocationAndLoad() {
    const location = app.globalData.location;
    const selectedCommunity = app.globalData.selectedCommunity;
    
    if (location || selectedCommunity) {
      this.setData({ 
        location,
        selectedCommunity,
      });
      this.loadInitialData();
    } else {
      // 没有位置信息，显示位置授权
      this.setData({ showLocationAuth: true });
    }
  },

  /**
   * 加载初始数据
   */
  async loadInitialData() {
    this.loadBanners();
    await this.loadCourses(true);
  },

  /**
   * 加载轮播图
   */
  async loadBanners() {
    try {
      const data = await api.banner.getList();
      const banners = data.list || data || [];
      
      // 如果没有数据，使用默认轮播图
      if (banners.length === 0) {
        this.setData({
          banners: [
            { id: '1', title: '国家体育总局指定考核点', color: '#667eea' },
            { id: '2', title: '专业场地，政府扶持', color: '#764ba2' },
            { id: '3', title: '10万家庭的共同选择', color: '#f093fb' },
          ],
        });
      } else {
        this.setData({ banners });
      }
    } catch (err) {
      console.error('加载轮播图失败:', err);
      // 使用默认轮播图
      this.setData({
        banners: [
          { id: '1', title: '国家体育总局指定考核点', color: '#667eea' },
          { id: '2', title: '专业场地，政府扶持', color: '#764ba2' },
          { id: '3', title: '10万家庭的共同选择', color: '#f093fb' },
        ],
      });
    }
  },

  /**
   * 加载课程列表
   */
  async loadCourses(refresh = false) {
    if (this.data.loading || this.data.loadingMore) return;
    
    const page = refresh ? 1 : this.data.page;
    
    this.setData({
      loading: refresh,
      loadingMore: !refresh && page > 1,
    });
    
    try {
      const params = {
        page,
        page_size: this.data.pageSize,
      };
      
      // 小区筛选
      if (this.data.selectedCommunity) {
        params.community_id = this.data.selectedCommunity.id;
      }
      
      // 状态筛选
      if (this.data.currentFilter !== 'all') {
        params.status = this.data.currentFilter;
      }
      
      const data = await api.course.getList(params);
      const list = Array.isArray(data.list) ? data.list : (Array.isArray(data) ? data : []);
      const total = data.total || list.length;
      
      const currentCourses = Array.isArray(this.data.courses) ? this.data.courses : [];
      const courses = refresh ? list : [...currentCourses, ...list];
      const hasMore = courses.length < total;
      
      this.setData({
        courses,
        page: page + 1,
        hasMore,
        loading: false,
        loadingMore: false,
        refreshing: false,
      });
    } catch (err) {
      console.error('加载课程失败:', err);
      this.setData({
        loading: false,
        loadingMore: false,
        refreshing: false,
      });
      
      // 显示模拟数据
      if (refresh) {
        this.setData({
          courses: this.getMockCourses(),
        });
      }
    }
  },

  /**
   * 获取模拟课程数据
   */
  getMockCourses() {
    return [
      {
        id: '1',
        name: '体能+跳绳',
        age_range: '7-12岁',
        community_name: '碧桂园中央公园',
        schedule: '周六 08:00-09:00',
        min_students: 4,
        max_students: 10,
        enrolled_count: 6,
        price: 80,
        member_price: 39.8,
        status: 'enrolling',
      },
      {
        id: '2',
        name: '篮球启蒙班',
        age_range: '5-8岁',
        community_name: '保利中央公馆',
        schedule: '周日 09:00-10:00',
        min_students: 6,
        max_students: 12,
        enrolled_count: 8,
        price: 100,
        member_price: 49.8,
        status: 'ongoing',
      },
      {
        id: '3',
        name: '足球基础班',
        age_range: '8-12岁',
        community_name: '万科城市花园',
        schedule: '周六 16:00-17:00',
        min_students: 8,
        max_students: 16,
        enrolled_count: 12,
        price: 90,
        member_price: 45,
        status: 'enrolling',
      },
    ];
  },

  /**
   * 刷新数据
   */
  refreshData() {
    this.setData({
      courses: [],
      page: 1,
      hasMore: true,
    });
    this.loadCourses(true);
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadBanners();
    this.loadCourses(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadCourses(false);
    }
  },

  /**
   * 切换筛选
   */
  onFilterChange(e) {
    const { key } = e.currentTarget.dataset;
    if (key === this.data.currentFilter) return;
    
    this.setData({
      currentFilter: key,
      courses: [],
      page: 1,
      hasMore: true,
    });
    this.loadCourses(true);
  },

  /**
   * 点击定位
   */
  onLocationTap() {
    wx.navigateTo({
      url: '/pages/community/list/index',
    });
  },

  /**
   * 点击轮播图
   */
  onBannerTap(e) {
    const { item } = e.currentTarget.dataset;
    if (item.link) {
      // 根据链接类型跳转
      if (item.link.startsWith('http')) {
        wx.navigateTo({
          url: `/pages/webview/index?url=${encodeURIComponent(item.link)}`,
        });
      } else {
        wx.navigateTo({
          url: item.link,
        });
      }
    }
  },

  /**
   * 点击拼班
   */
  onCourseJoin(e) {
    const { course } = e.detail;
    // 检查登录
    if (!app.checkLogin()) return;
    
    wx.navigateTo({
      url: `/pages/order/confirm/index?courseId=${course.id}`,
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '义城上门教育 - 专业儿童体育培训',
      path: '/pages/index/index',
    };
  },
});
