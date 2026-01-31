/**
 * 小区列表页面
 */
const app = getApp();
const api = require('../../../services/api');
const util = require('../../../utils/util');
const storage = require('../../../utils/storage');

Page({
  /**
   * 页面数据
   */
  data: {
    // 搜索
    keyword: '',
    searchHistory: [],
    showHistory: true,
    
    // 列表
    communities: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 20,
    
    // 当前选中
    selectedId: '',
    
    // 位置
    location: null,
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 获取当前位置
    this.setData({
      location: app.globalData.location,
      selectedId: app.globalData.selectedCommunity?.id || '',
      searchHistory: storage.getSearchHistory(),
    });
    
    // 加载附近小区
    this.loadNearbyCommunities();
  },

  /**
   * 加载附近小区
   */
  async loadNearbyCommunities() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const { location } = this.data;
      let data;
      
      if (location) {
        // 有位置信息，获取附近小区
        data = await api.community.getNearby({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 10, // 10公里范围
        });
      } else {
        // 没有位置信息，获取所有小区
        data = await api.community.getList({
          page: 1,
          page_size: 50,
        });
      }
      
      let communities = data.items || data || [];
      
      // 计算距离并格式化
      if (location && communities.length > 0) {
        communities = communities.map(item => {
          const distance = util.calculateDistance(
            location.latitude,
            location.longitude,
            item.latitude,
            item.longitude
          );
          return {
            ...item,
            distance,
            distanceValue: distance < 1 ? Math.round(distance * 1000) : distance.toFixed(1),
            distanceUnit: distance < 1 ? 'm' : 'km',
          };
        });
        
        // 按距离排序
        communities.sort((a, b) => a.distance - b.distance);
      }
      
      this.setData({
        communities,
        loading: false,
        showHistory: false,
      });
    } catch (err) {
      console.error('加载小区失败:', err);
      this.setData({ loading: false });
      
      // 显示模拟数据
      this.setData({
        communities: this.getMockCommunities(),
        showHistory: false,
      });
    }
  },

  /**
   * 搜索小区
   */
  async searchCommunities(keyword) {
    if (this.data.loading) return;
    
    this.setData({
      loading: true,
      page: 1,
      hasMore: true,
    });
    
    try {
      const data = await api.community.getList({
        keyword,
        page: 1,
        page_size: this.data.pageSize,
      });
      
      let communities = data.items || data || [];
      const total = data.total || communities.length;
      
      // 计算距离并格式化
      const { location } = this.data;
      if (location && communities.length > 0) {
        communities = communities.map(item => {
          const distance = util.calculateDistance(
            location.latitude,
            location.longitude,
            item.latitude,
            item.longitude
          );
          return {
            ...item,
            distance,
            distanceValue: distance < 1 ? Math.round(distance * 1000) : distance.toFixed(1),
            distanceUnit: distance < 1 ? 'm' : 'km',
          };
        });
      }
      
      this.setData({
        communities,
        loading: false,
        hasMore: communities.length < total,
        page: 2,
        showHistory: false,
      });
      
      // 保存搜索历史
      if (keyword) {
        storage.addSearchHistory(keyword);
        this.setData({
          searchHistory: storage.getSearchHistory(),
        });
      }
    } catch (err) {
      console.error('搜索小区失败:', err);
      this.setData({ loading: false });
    }
  },

  /**
   * 获取模拟数据
   */
  getMockCommunities() {
    return [
      {
        id: '1',
        name: '碧桂园中央公园',
        address: '海口市美兰区桂林横路',
        image: '',
        latitude: 20.05,
        longitude: 110.35,
        distance: 0.5,
        distanceValue: '500',
        distanceUnit: 'm',
      },
      {
        id: '2',
        name: '保利中央公馆',
        address: '海口市龙华区金龙路',
        image: '',
        latitude: 20.03,
        longitude: 110.32,
        distance: 1.2,
        distanceValue: '1.2',
        distanceUnit: 'km',
      },
      {
        id: '3',
        name: '万科城市花园',
        address: '海口市秀英区长流镇',
        image: '',
        latitude: 20.01,
        longitude: 110.28,
        distance: 3.5,
        distanceValue: '3.5',
        distanceUnit: 'km',
      },
      {
        id: '4',
        name: '融创观澜湖',
        address: '海口市龙华区观澜湖大道',
        image: '',
        latitude: 19.98,
        longitude: 110.42,
        distance: 5.8,
        distanceValue: '5.8',
        distanceUnit: 'km',
      },
    ];
  },

  /**
   * 输入搜索关键词
   */
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    
    if (!keyword) {
      this.setData({ showHistory: true });
    }
  },

  /**
   * 确认搜索
   */
  onSearchConfirm() {
    const { keyword } = this.data;
    if (keyword) {
      this.searchCommunities(keyword);
    } else {
      this.loadNearbyCommunities();
    }
  },

  /**
   * 清空搜索
   */
  onSearchClear() {
    this.setData({
      keyword: '',
      showHistory: true,
    });
    this.loadNearbyCommunities();
  },

  /**
   * 点击搜索历史
   */
  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ keyword });
    this.searchCommunities(keyword);
  },

  /**
   * 清空搜索历史
   */
  onClearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史？',
      success: (res) => {
        if (res.confirm) {
          storage.clearSearchHistory();
          this.setData({ searchHistory: [] });
        }
      },
    });
  },

  /**
   * 选择全部小区（取消定位筛选）
   */
  onSelectAll() {
    // 清空选中的小区
    app.setSelectedCommunity(null);
    
    // 返回上一页
    wx.navigateBack();
  },

  /**
   * 选择小区
   */
  onSelectCommunity(e) {
    const { item } = e.currentTarget.dataset;
    
    // 保存选中的小区
    app.setSelectedCommunity(item);
    
    // 返回上一页
    wx.navigateBack();
  },

  /**
   * 打开地图
   */
  onOpenMap() {
    wx.navigateTo({
      url: '/pages/community/map/index',
    });
  },

  /**
   * 重新定位
   */
  onRelocate() {
    wx.showLoading({ title: '定位中...' });
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
        
        app.globalData.location = location;
        storage.setLocation(location);
        
        this.setData({ location });
        this.loadNearbyCommunities();
      },
      fail: (err) => {
        console.error('定位失败:', err);
        wx.showToast({
          title: '定位失败',
          icon: 'none',
        });
      },
      complete: () => {
        wx.hideLoading();
      },
    });
  },
});
