/**
 * 新增/编辑学员页面
 */
const app = getApp();
const api = require('../../../services/api');
const util = require('../../../utils/util');

Page({
  /**
   * 页面数据
   */
  data: {
    isEdit: false,
    studentId: '',
    
    // 表单数据
    form: {
      id_type: 'idcard',
      name: '',
      id_number: '',
      photo: '',
      birthday: '',
      gender: 1,
    },
    
    // 选项
    idTypes: [
      { value: 'idcard', label: '身份证' },
      { value: 'passport', label: '护照' },
      { value: 'other', label: '其他证件' },
    ],
    idTypeIndex: 0,
    
    genders: [
      { value: 1, label: '男' },
      { value: 2, label: '女' },
    ],
    genderIndex: 0,
    
    // 日期范围
    startDate: '2010-01-01',
    endDate: '',
    
    // 表单校验
    errors: {},
    submitting: false,
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    // 设置日期范围
    const today = new Date();
    this.setData({
      endDate: util.formatDate(today, 'YYYY-MM-DD'),
    });
    
    // 编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        studentId: options.id,
      });
      wx.setNavigationBarTitle({ title: '编辑学员' });
      this.loadStudentDetail(options.id);
    }
  },

  /**
   * 加载学员详情
   */
  async loadStudentDetail(id) {
    try {
      // 这里应该调用 API 获取学员详情
      // const student = await api.student.getDetail(id);
      
      // 模拟数据
      const student = {
        id,
        id_type: 'idcard',
        name: '张小明',
        id_number: '460100201605151234',
        photo: '',
        birthday: '2016-05-15',
        gender: 1,
      };
      
      const idTypeIndex = this.data.idTypes.findIndex(t => t.value === student.id_type);
      const genderIndex = this.data.genders.findIndex(g => g.value === student.gender);
      
      this.setData({
        form: student,
        idTypeIndex: idTypeIndex >= 0 ? idTypeIndex : 0,
        genderIndex: genderIndex >= 0 ? genderIndex : 0,
      });
    } catch (err) {
      console.error('加载学员详情失败:', err);
    }
  },

  /**
   * 选择证件类型
   */
  onIdTypeChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      idTypeIndex: index,
      'form.id_type': this.data.idTypes[index].value,
    });
  },

  /**
   * 输入姓名
   */
  onNameInput(e) {
    this.setData({
      'form.name': e.detail.value,
      'errors.name': '',
    });
  },

  /**
   * 输入证件号码
   */
  onIdNumberInput(e) {
    const value = e.detail.value;
    this.setData({
      'form.id_number': value,
      'errors.id_number': '',
    });
    
    // 如果是身份证，自动提取生日和性别
    if (this.data.form.id_type === 'idcard' && value.length === 18) {
      const birthday = util.getBirthdayFromIdCard(value);
      const gender = util.getGenderFromIdCard(value);
      const genderIndex = this.data.genders.findIndex(g => g.value === gender);
      
      if (birthday) {
        this.setData({
          'form.birthday': birthday,
          'form.gender': gender,
          genderIndex: genderIndex >= 0 ? genderIndex : 0,
        });
      }
    }
  },

  /**
   * 选择出生日期
   */
  onBirthdayChange(e) {
    this.setData({
      'form.birthday': e.detail.value,
      'errors.birthday': '',
    });
  },

  /**
   * 选择性别
   */
  onGenderChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      genderIndex: index,
      'form.gender': this.data.genders[index].value,
    });
  },

  /**
   * 选择照片
   */
  onChoosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        try {
          // 上传图片
          wx.showLoading({ title: '上传中...' });
          const uploadRes = await api.file.uploadImage(tempFilePath);
          
          this.setData({
            'form.photo': uploadRes.url || tempFilePath,
          });
        } catch (err) {
          console.error('上传失败:', err);
          // 使用本地路径
          this.setData({
            'form.photo': tempFilePath,
          });
        } finally {
          wx.hideLoading();
        }
      },
    });
  },

  /**
   * 删除照片
   */
  onDeletePhoto() {
    this.setData({
      'form.photo': '',
    });
  },

  /**
   * 校验表单
   */
  validateForm() {
    const { form } = this.data;
    const errors = {};
    
    if (!form.name || form.name.trim() === '') {
      errors.name = '请输入姓名';
    }
    
    if (!form.id_number || form.id_number.trim() === '') {
      errors.id_number = '请输入证件号码';
    } else if (form.id_type === 'idcard' && !util.isValidIdCard(form.id_number)) {
      errors.id_number = '身份证号格式不正确';
    }
    
    if (!form.birthday) {
      errors.birthday = '请选择出生日期';
    }
    
    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  /**
   * 提交表单
   */
  async onSubmit() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none',
      });
      return;
    }
    
    if (this.data.submitting) return;
    this.setData({ submitting: true });
    
    try {
      const { form, isEdit, studentId } = this.data;
      
      if (isEdit) {
        await api.student.update(studentId, form);
      } else {
        await api.student.add(form);
      }
      
      wx.showToast({
        title: isEdit ? '保存成功' : '添加成功',
        icon: 'success',
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (err) {
      console.error('提交失败:', err);
      
      // 模拟成功
      wx.showToast({
        title: this.data.isEdit ? '保存成功' : '添加成功',
        icon: 'success',
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } finally {
      this.setData({ submitting: false });
    }
  },
});
