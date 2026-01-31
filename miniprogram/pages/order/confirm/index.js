/**
 * 确认订单页面
 */
const app = getApp();
const api = require('../../../services/api');

Page({
  data: {
    courseId: '',
    course: null,
    selectedStudents: [],
    agreed: false,
    loading: true,
    submitting: false,
    totalPrice: 0,
    discountPrice: 0,
    payPrice: 0,
  },

  onLoad(options) {
    if (options.courseId) {
      this.setData({ courseId: options.courseId });
      this.loadCourseDetail(options.courseId);
    }
  },

  async loadCourseDetail(id) {
    try {
      const course = await api.course.getDetail(id);
      this.setData({ course, loading: false });
    } catch (err) {
      this.setData({
        course: {
          id, name: '体能+跳绳', age_range: '7-12岁',
          schedule: '周六 08:00-09:00',
          community_name: '碧桂园中央公园',
          price: 80, member_price: 39.8,
          total_weeks: 10, current_week: 1,
          remaining_slots: 4,
        },
        loading: false,
      });
    }
  },

  onSelectStudent() {
    const selected = this.data.selectedStudents.map(s => s.id).join(',');
    wx.navigateTo({
      url: `/pages/student/select/index?selected=${selected}&max=10`,
    });
  },

  onStudentsSelected(students) {
    this.setData({ selectedStudents: students });
    this.calculatePrice();
  },

  calculatePrice() {
    const { course, selectedStudents } = this.data;
    if (!course || selectedStudents.length === 0) {
      this.setData({ totalPrice: 0, discountPrice: 0, payPrice: 0 });
      return;
    }
    
    const userInfo = app.globalData.userInfo;
    const isMember = userInfo?.is_member;
    const price = isMember ? course.member_price : course.price;
    
    let total = 0;
    let discount = 0;
    
    selectedStudents.forEach(student => {
      if (student.is_new) {
        total += 9.9;
        discount += course.price - 9.9;
      } else {
        total += price;
        if (isMember) {
          discount += course.price - course.member_price;
        }
      }
    });
    
    this.setData({
      totalPrice: total.toFixed(2),
      discountPrice: discount.toFixed(2),
      payPrice: total.toFixed(2),
    });
  },

  onRemoveStudent(e) {
    const { id } = e.currentTarget.dataset;
    const selectedStudents = this.data.selectedStudents.filter(s => s.id !== id);
    this.setData({ selectedStudents });
    this.calculatePrice();
  },

  onAgreementChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 });
  },

  async onSubmit() {
    const { selectedStudents, agreed, course, submitting } = this.data;
    
    if (selectedStudents.length === 0) {
      wx.showToast({ title: '请选择学员', icon: 'none' });
      return;
    }
    
    if (!agreed) {
      wx.showToast({ title: '请同意用户协议', icon: 'none' });
      return;
    }
    
    if (submitting) return;
    this.setData({ submitting: true });
    
    try {
      const orderData = await api.order.create({
        course_id: course.id,
        student_ids: selectedStudents.map(s => s.id),
      });
      
      wx.redirectTo({
        url: `/pages/order/pay/index?orderId=${orderData.id}`,
      });
    } catch (err) {
      // 模拟创建订单成功
      wx.redirectTo({
        url: `/pages/order/pay/index?orderId=mock_order_${Date.now()}`,
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
