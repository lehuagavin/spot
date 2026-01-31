/**
 * 课程详情页面
 */
const app = getApp();
const api = require('../../../services/api');
const util = require('../../../utils/util');

Page({
  /**
   * 页面数据
   */
  data: {
    courseId: '',
    course: null,
    loading: true,
    
    // 格式化数据
    priceObj: { symbol: '¥', integer: '0', decimal: '.00' },
    memberPriceObj: { symbol: '¥', integer: '0', decimal: '.00' },
    savingAmount: 0,
    remainingSlots: 0,
    enrolledStudents: [],
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ courseId: id });
      this.loadCourseDetail(id);
    } else {
      wx.showToast({
        title: '课程不存在',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载课程详情
   */
  async loadCourseDetail(id) {
    this.setData({ loading: true });
    
    try {
      const course = await api.course.getDetail(id);
      
      // 处理图片 URL（将相对路径转换为完整 URL）
      if (course.image) {
        course.image = app.getImageUrl(course.image);
      }
      
      // 格式化数据（确保价格为数字类型，后端 Decimal 序列化为字符串）
      const coursePrice = parseFloat(course.price) || 0;
      const memberPrice = parseFloat(course.member_price) || 0;
      const priceObj = util.formatPriceObject(coursePrice);
      const memberPriceObj = util.formatPriceObject(memberPrice);
      const savingAmount = (coursePrice - memberPrice).toFixed(1);
      const remainingSlots = (course.max_students || 10) - (course.enrolled_count || 0);
      
      this.setData({
        course,
        priceObj,
        memberPriceObj,
        savingAmount,
        remainingSlots,
        enrolledStudents: course.enrolled_students || [],
        loading: false,
      });
    } catch (err) {
      console.error('加载课程详情失败:', err);
      
      // 使用模拟数据
      const course = this.getMockCourse(id);
      // 处理模拟数据图片 URL
      if (course.image) {
        course.image = app.getImageUrl(course.image);
      }
      const priceObj = util.formatPriceObject(course.price);
      const memberPriceObj = util.formatPriceObject(course.member_price);
      const savingAmount = (course.price - course.member_price).toFixed(1);
      const remainingSlots = course.max_students - course.enrolled_count;
      
      this.setData({
        course,
        priceObj,
        memberPriceObj,
        savingAmount,
        remainingSlots,
        enrolledStudents: course.enrolled_students || [],
        loading: false,
      });
    }
  },

  /**
   * 获取模拟数据
   */
  getMockCourse(id) {
    return {
      id,
      name: '基础跳绳寒假班',
      age_range: '7-12岁',
      status: 'ongoing',
      teacher: {
        id: 't1',
        name: '蔡薇',
        avatar: '',
        intro: '专业体育教练，从业5年',
      },
      community_name: '光明大地',
      address: '深圳市广东省深圳市光明区光明街道观光路与邦凯路交汇处(光明会展中心对面)',
      location: '深圳市广东省深圳市光明区光明街道观光路与邦凯路交汇处(光明会展中心对面)',
      schedule: '周日11:00~12:30',
      schedule_time: '11:00~12:30',
      start_date: '2026-02-01',
      total_weeks: 1,
      total_lessons: 1,
      current_week: 1,
      class_no: '141688',
      deadline: '2026-02-01 10:00',
      price: 560,
      member_price: 420,
      min_students: 1,
      max_students: 10,
      enrolled_count: 5,
      description: '跳绳项目是一项学生喜爱的体育运动，跳绳形式多样，它不受场地、器材设备的限制，易开展，不同身体条件的学生都可以参加，它能使学生全身得到锻炼，发展心肺功能，培养学生下肢力量、灵敏性、协调性、耐力；培养学生顽拼搏的意志品德。\n教学目标',
      enrolled_students: [
        { avatar: 'https://randomuser.me/api/portraits/kids/1.jpg' },
        { avatar: 'https://randomuser.me/api/portraits/kids/2.jpg' },
        { avatar: 'https://randomuser.me/api/portraits/kids/3.jpg' },
        { avatar: 'https://randomuser.me/api/portraits/kids/4.jpg' },
        { avatar: 'https://randomuser.me/api/portraits/kids/5.jpg' },
      ],
    };
  },

  /**
   * 导航到上课地址
   */
  onNavigate() {
    const { course } = this.data;
    const address = course.location || course.address;
    if (!address) {
      wx.showToast({
        title: '地址信息不完整',
        icon: 'none',
      });
      return;
    }
    
    // 使用微信地图导航
    wx.openLocation({
      latitude: 22.7506, // 默认深圳光明区坐标
      longitude: 113.9187,
      name: course.community_name || '上课地点',
      address: address,
      scale: 18,
    });
  },

  /**
   * 加入拼班
   */
  onJoinClass() {
    // 检查登录
    if (!app.checkLogin()) return;
    
    const { courseId, course, remainingSlots } = this.data;
    
    // 检查名额
    if (remainingSlots <= 0) {
      wx.showToast({
        title: '名额已满',
        icon: 'none',
      });
      return;
    }
    
    // 检查状态
    if (course.status !== 'enrolling') {
      wx.showToast({
        title: '课程不可报名',
        icon: 'none',
      });
      return;
    }
    
    // 跳转到确认订单页
    wx.navigateTo({
      url: `/pages/order/confirm/index?courseId=${courseId}`,
    });
  },

  /**
   * 联系客服
   */
  onContactService() {
    // 打开客服会话
    // 需要在微信公众平台配置客服
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    const { course } = this.data;
    return {
      title: `${course.name} - 一起来拼班吧！`,
      path: `/pages/course/detail/index?id=${this.data.courseId}`,
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { course } = this.data;
    return {
      title: `${course.name} - 义城上门教育`,
      query: `id=${this.data.courseId}`,
    };
  },
});
