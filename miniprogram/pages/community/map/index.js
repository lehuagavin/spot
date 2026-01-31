/**
 * 地图选择小区页面
 */
const app = getApp();
const api = require('../../../services/api');
const util = require('../../../utils/util');

Page({
  /**
   * 页面数据
   */
  data: {
    // 地图
    latitude: 20.03,
    longitude: 110.35,
    scale: 14,
    markers: [],
    
    // 小区列表
    communities: [],
    selectedCommunity: null,
    
    // 搜索
    keyword: '',
    showSearch: false,
    searchResults: [],
    
    // 加载
    loading: false,
  },

  /**
   * 页面加载
   */
  onLoad() {
    // 获取当前位置
    const location = app.globalData.location;
    if (location) {
      this.setData({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
    
    // 加载附近小区
    this.loadNearbyCommunities();
  },

  /**
   * 页面就绪
   */
  onReady() {
    // 获取地图上下文
    this.mapCtx = wx.createMapContext('communityMap');
  },

  /**
   * 加载附近小区
   */
  async loadNearbyCommunities() {
    this.setData({ loading: true });
    
    try {
      const { latitude, longitude } = this.data;
      
      const data = await api.community.getNearby({
        latitude,
        longitude,
        radius: 10,
      });
      
      let communities = data.list || data || [];
      
      // 如果没有数据，使用模拟数据
      if (communities.length === 0) {
        communities = this.getMockCommunities();
      }
      
      // 计算距离
      communities = communities.map(item => ({
        ...item,
        distance: util.calculateDistance(
          latitude,
          longitude,
          item.latitude,
          item.longitude
        ),
      }));
      
      // 生成标记点
      const markers = communities.map((item, index) => ({
        id: index,
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.name,
        iconPath: '/assets/icons/marker.png',
        width: 32,
        height: 40,
        callout: {
          content: item.name,
          color: '#1d1d1f',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#ffffff',
          padding: 8,
          display: 'BYCLICK',
        },
      }));
      
      this.setData({
        communities,
        markers,
        loading: false,
      });
    } catch (err) {
      console.error('加载小区失败:', err);
      
      // 使用模拟数据
      const communities = this.getMockCommunities();
      const markers = communities.map((item, index) => ({
        id: index,
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.name,
        width: 32,
        height: 40,
      }));
      
      this.setData({
        communities,
        markers,
        loading: false,
      });
    }
  },

  /**
   * 获取模拟数据
   */
  getMockCommunities() {
    const { latitude, longitude } = this.data;
    return [
      {
        id: '1',
        name: '碧桂园中央公园',
        address: '海口市美兰区桂林横路',
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
      },
      {
        id: '2',
        name: '保利中央公馆',
        address: '海口市龙华区金龙路',
        latitude: latitude - 0.01,
        longitude: longitude + 0.02,
      },
      {
        id: '3',
        name: '万科城市花园',
        address: '海口市秀英区长流镇',
        latitude: latitude + 0.02,
        longitude: longitude - 0.01,
      },
    ];
  },

  /**
   * 点击标记点
   */
  onMarkerTap(e) {
    const { markerId } = e;
    const community = this.data.communities[markerId];
    if (community) {
      this.setData({ selectedCommunity: community });
    }
  },

  /**
   * 点击地图
   */
  onMapTap() {
    this.setData({ selectedCommunity: null });
  },

  /**
   * 区域改变
   */
  onRegionChange(e) {
    if (e.type === 'end' && e.causedBy === 'drag') {
      // 拖动结束后，可以重新加载该区域的小区
      // this.loadNearbyCommunities();
    }
  },

  /**
   * 移动到当前位置
   */
  onMoveToLocation() {
    this.mapCtx.moveToLocation({
      success: () => {
        console.log('移动到当前位置成功');
      },
    });
  },

  /**
   * 选择小区
   */
  onSelectCommunity() {
    const { selectedCommunity } = this.data;
    if (!selectedCommunity) return;
    
    // 保存选中的小区
    app.setSelectedCommunity(selectedCommunity);
    
    // 返回首页
    wx.navigateBack({
      delta: 2, // 返回两级（跳过小区列表页）
    });
  },

  /**
   * 查看小区列表
   */
  onViewList() {
    wx.navigateBack();
  },

  /**
   * 打开搜索
   */
  onOpenSearch() {
    this.setData({ showSearch: true });
  },

  /**
   * 关闭搜索
   */
  onCloseSearch() {
    this.setData({
      showSearch: false,
      keyword: '',
      searchResults: [],
    });
  },

  /**
   * 搜索输入
   */
  onSearchInput: util.debounce(function(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    
    if (keyword) {
      this.searchCommunities(keyword);
    } else {
      this.setData({ searchResults: [] });
    }
  }, 300),

  /**
   * 搜索小区
   */
  async searchCommunities(keyword) {
    try {
      const data = await api.community.getList({
        keyword,
        page: 1,
        page_size: 10,
      });
      
      const searchResults = data.list || data || [];
      this.setData({ searchResults });
    } catch (err) {
      console.error('搜索失败:', err);
    }
  },

  /**
   * 选择搜索结果
   */
  onSelectSearchResult(e) {
    const { item } = e.currentTarget.dataset;
    
    // 移动到该位置
    this.setData({
      latitude: item.latitude,
      longitude: item.longitude,
      selectedCommunity: item,
      showSearch: false,
      keyword: '',
      searchResults: [],
    });
    
    // 缩放地图
    this.mapCtx.includePoints({
      points: [{ latitude: item.latitude, longitude: item.longitude }],
      padding: [100, 100, 100, 100],
    });
  },
});
