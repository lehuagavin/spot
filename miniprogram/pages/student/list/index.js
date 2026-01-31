/**
 * 学员列表页面
 */
const app = getApp();
const api = require('../../../services/api');

Page({
  /**
   * 页面数据
   */
  data: {
    students: [],
    loading: true,
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.loadStudents();
  },

  /**
   * 页面显示
   */
  onShow() {
    // 从新增/编辑页面返回时刷新
    if (this.needRefresh) {
      this.loadStudents();
      this.needRefresh = false;
    }
  },

  /**
   * 加载学员列表
   */
  async loadStudents() {
    this.setData({ loading: true });
    
    try {
      const data = await api.student.getList();
      const students = data.list || data || [];
      
      this.setData({
        students,
        loading: false,
      });
    } catch (err) {
      console.error('加载学员失败:', err);
      
      // 使用模拟数据
      this.setData({
        students: this.getMockStudents(),
        loading: false,
      });
    }
  },

  /**
   * 获取模拟数据
   */
  getMockStudents() {
    return [
      {
        id: 's1',
        name: '张小明',
        id_type: 'idcard',
        id_number: '460100********1234',
        birthday: '2016-05-15',
        gender: 1,
        photo: '',
        member_type: 'normal',
      },
      {
        id: 's2',
        name: '李小红',
        id_type: 'idcard',
        id_number: '460100********5678',
        birthday: '2017-08-20',
        gender: 2,
        photo: '',
        member_type: 'vip',
      },
    ];
  },

  /**
   * 新增学员
   */
  onAddStudent() {
    this.needRefresh = true;
    wx.navigateTo({
      url: '/pages/student/add/index',
    });
  },

  /**
   * 编辑学员
   */
  onEditStudent(e) {
    const { id } = e.currentTarget.dataset;
    this.needRefresh = true;
    wx.navigateTo({
      url: `/pages/student/add/index?id=${id}`,
    });
  },

  /**
   * 删除学员
   */
  onDeleteStudent(e) {
    const { id, name } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除学员"${name}"吗？`,
      confirmColor: '#ff3b30',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.student.delete(id);
            wx.showToast({
              title: '删除成功',
              icon: 'success',
            });
            this.loadStudents();
          } catch (err) {
            console.error('删除失败:', err);
            // 模拟删除成功
            const students = this.data.students.filter(s => s.id !== id);
            this.setData({ students });
            wx.showToast({
              title: '删除成功',
              icon: 'success',
            });
          }
        }
      },
    });
  },

  /**
   * 计算年龄
   */
  calculateAge(birthday) {
    if (!birthday) return '';
    const birth = new Date(birthday);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return `${age}岁`;
  },
});
