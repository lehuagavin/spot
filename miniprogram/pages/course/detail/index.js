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
      name: '体能+跳绳',
      age_range: '7-12岁',
      status: 'enrolling',
      teacher: {
        id: 't1',
        name: '小黑老师',
        avatar: '',
        intro: '专业体育教练，从业5年',
      },
      community_name: '碧桂园中央公园',
      address: '海口市美兰区桂林横路',
      schedule: '周六 08:00-09:00',
      total_weeks: 10,
      total_lessons: 10,
      current_week: 1,
      deadline: '2026-02-01 08:00:00',
      price: 80,
      member_price: 40,
      min_students: 4,
      max_students: 10,
      enrolled_count: 6,
      enrolled_students: [
        { avatar: '' },
        { avatar: '' },
        { avatar: '' },
        { avatar: '' },
        { avatar: '' },
        { avatar: '' },
      ],
    };
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
