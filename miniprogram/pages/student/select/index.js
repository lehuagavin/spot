/**
 * 选择学员页面
 */
const app = getApp();
const api = require('../../../services/api');

Page({
  data: {
    students: [],
    selectedIds: [],
    loading: true,
    maxSelect: 10,
  },

  onLoad(options) {
    if (options.selected) {
      this.setData({
        selectedIds: options.selected.split(','),
      });
    }
    if (options.max) {
      this.setData({ maxSelect: parseInt(options.max) });
    }
    this.loadStudents();
  },

  async loadStudents() {
    this.setData({ loading: true });
    try {
      const data = await api.student.getList();
      this.setData({
        students: data.list || data || this.getMockStudents(),
        loading: false,
      });
    } catch (err) {
      this.setData({
        students: this.getMockStudents(),
        loading: false,
      });
    }
  },

  getMockStudents() {
    return [
      { id: 's1', name: '张小明', birthday: '2016-05-15', gender: 1, is_new: true },
      { id: 's2', name: '李小红', birthday: '2017-08-20', gender: 2, is_new: false },
    ];
  },

  onToggleSelect(e) {
    const { id } = e.currentTarget.dataset;
    let { selectedIds, maxSelect } = this.data;
    
    const index = selectedIds.indexOf(id);
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      if (selectedIds.length >= maxSelect) {
        wx.showToast({ title: `最多选择${maxSelect}名学员`, icon: 'none' });
        return;
      }
      selectedIds.push(id);
    }
    
    this.setData({ selectedIds });
  },

  onAddStudent() {
    wx.navigateTo({ url: '/pages/student/add/index' });
  },

  onConfirm() {
    const { selectedIds, students } = this.data;
    if (selectedIds.length === 0) {
      wx.showToast({ title: '请选择学员', icon: 'none' });
      return;
    }
    
    const selectedStudents = students.filter(s => selectedIds.includes(s.id));
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.onStudentsSelected) {
      prevPage.onStudentsSelected(selectedStudents);
    }
    wx.navigateBack();
  },
});
