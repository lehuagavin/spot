/**
 * 加入拼班页面
 */
const app = getApp();
const api = require('../../../services/api');
const { formatWeekDay } = require('../../../utils/util');

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
    payPrice: '0.00',
    remainingSlots: 0,
    courseScheduleText: '',
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
      this.processCourseData(course);
    } catch (err) {
      // 使用模拟数据
      this.processCourseData({
        id,
        name: '普通-运动课1.5h',
        age_range: '7-12岁',
        schedule_day: 1,
        schedule_start: '16:10',
        schedule_end: '17:40',
        start_date: '2026-02-02',
        community_name: '海沧天心岛',
        location: '海沧天心岛',
        price: 80,
        member_price: 40,
        total_weeks: 2,
        current_week: 1,
        max_students: 6,
        enrolled_count: 3,
        status: 'ongoing',
      });
    }
  },

  processCourseData(course) {
    // 计算剩余名额
    const remainingSlots = (course.max_students || 6) - (course.enrolled_count || 0);
    
    // 格式化课程时间文字
    let scheduleText = '';
    if (course.start_date) {
      const date = new Date(course.start_date);
      const weekDay = formatWeekDay(course.schedule_day || date.getDay());
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      scheduleText = `${dateStr} ${weekDay} ${course.schedule_start || '16:10'}~${course.schedule_end || '17:40'}`;
    } else if (course.schedule) {
      scheduleText = course.schedule;
    }
    
    this.setData({
      course,
      loading: false,
      remainingSlots,
      courseScheduleText: scheduleText,
    });
  },

  onSelectStudent() {
    const selected = this.data.selectedStudents.map(s => s.id).join(',');
    wx.navigateTo({
      url: `/pages/student/select/index?selected=${selected}&max=10`,
    });
  },

  onStudentsSelected(students) {
    // 处理学员数据，计算每个学员的价格
    const { course } = this.data;
    const userInfo = app.globalData.userInfo;
    const isMember = userInfo?.is_member;
    const coursePrice = parseFloat(course.price) || 0;
    const memberPrice = parseFloat(course.member_price) || coursePrice;
    
    const processedStudents = students.map(student => {
      let actualPrice, discountAmount;
      
      // 判断是否是新用户（这里简单判断：如果学员没有 order_count 或 order_count 为 0，则为新用户）
      const isNewUser = student.is_new || student.is_new_user || !student.order_count;
      
      if (isNewUser) {
        // 新人价 = 会员价
        actualPrice = memberPrice;
        discountAmount = (coursePrice - memberPrice).toFixed(1);
      } else if (isMember) {
        // 会员价
        actualPrice = memberPrice;
        discountAmount = (coursePrice - memberPrice).toFixed(1);
      } else {
        // 原价
        actualPrice = coursePrice;
        discountAmount = '0';
      }
      
      return {
        ...student,
        is_new: isNewUser,
        actualPrice: actualPrice.toFixed(1),
        discountAmount,
      };
    });
    
    this.setData({ selectedStudents: processedStudents });
    this.calculatePrice();
  },

  calculatePrice() {
    const { selectedStudents } = this.data;
    
    if (selectedStudents.length === 0) {
      this.setData({ totalPrice: 0, discountPrice: 0, payPrice: '0.00' });
      return;
    }
    
    let total = 0;
    let discount = 0;
    
    selectedStudents.forEach(student => {
      total += parseFloat(student.actualPrice);
      discount += parseFloat(student.discountAmount);
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

  onAgreementTap() {
    this.setData({ agreed: !this.data.agreed });
  },

  onAgreementChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 });
  },

  onViewAgreement() {
    wx.navigateTo({
      url: '/pages/user/about/index',
    });
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
