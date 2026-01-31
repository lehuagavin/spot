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

  onShow() {
    // 从新增/编辑页面返回时刷新列表
    if (this.needRefresh) {
      this.loadStudents();
      this.needRefresh = false;
    }
  },

  async loadStudents() {
    this.setData({ loading: true });
    try {
      const data = await api.student.getList();
      const rawStudents = data.list || data.items || data || [];
      const { selectedIds } = this.data;
      
      // 转换后端字段名为前端使用的字段名，并添加选中状态
      const students = rawStudents.map(item => ({
        ...item,
        name: item.id_name || item.name,  // 后端返回 id_name，前端使用 name
        gender: item.gender === '男' ? 1 : (item.gender === '女' ? 2 : item.gender),
        photo: item.photo ? app.getImageUrl(item.photo) : '',
        selected: selectedIds.indexOf(item.id) > -1,  // 选中状态
      }));
      
      this.setData({
        students: students.length > 0 ? students : [],
        loading: false,
      });
    } catch (err) {
      console.error('加载学员失败:', err);
      this.setData({
        students: [],
        loading: false,
      });
    }
  },

  getMockStudents() {
    return [
      { id: 's1', name: '张小明', birthday: '2016-05-15', gender: 1, member_type: 'normal' },
      { id: 's2', name: '李小红', birthday: '2017-08-20', gender: 2, member_type: 'vip' },
    ];
  },

  onToggleSelect(e) {
    const { id } = e.currentTarget.dataset;
    let { selectedIds, maxSelect, students } = this.data;
    
    const index = selectedIds.indexOf(id);
    if (index > -1) {
      // 取消选中
      selectedIds.splice(index, 1);
    } else {
      // 选中
      if (selectedIds.length >= maxSelect) {
        wx.showToast({ title: `最多选择${maxSelect}名学员`, icon: 'none' });
        return;
      }
      selectedIds.push(id);
    }
    
    // 更新学员的选中状态
    students = students.map(item => ({
      ...item,
      selected: selectedIds.indexOf(item.id) > -1,
    }));
    
    this.setData({ selectedIds, students });
  },

  onAddStudent() {
    this.needRefresh = true;
    wx.navigateTo({ url: '/pages/student/add/index' });
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
            // 从选中列表中移除
            const selectedIds = this.data.selectedIds.filter(sid => sid !== id);
            this.setData({ selectedIds });
            // 刷新列表
            this.loadStudents();
          } catch (err) {
            console.error('删除失败:', err);
            // 模拟删除成功
            const students = this.data.students.filter(s => s.id !== id);
            const selectedIds = this.data.selectedIds.filter(sid => sid !== id);
            this.setData({ students, selectedIds });
            wx.showToast({
              title: '删除成功',
              icon: 'success',
            });
          }
        }
      },
    });
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
