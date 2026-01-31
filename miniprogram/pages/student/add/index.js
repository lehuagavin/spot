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
    
    // 头像选择弹窗
    showAvatarModal: false,
    
    // 防止重复选择头像
    choosingAvatar: false,
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
    wx.showActionSheet({
      itemList: ['用微信头像', '从相册选择', '拍照'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.useWechatAvatar();
            break;
          case 1:
            this.chooseFromAlbum();
            break;
          case 2:
            this.takePhoto();
            break;
        }
      },
    });
  },

  /**
   * 使用微信头像 - 显示选择弹窗
   */
  useWechatAvatar() {
    // 首先尝试使用已保存的用户头像
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.avatar && !userInfo.avatar.includes('default') && !userInfo.avatar.includes('132')) {
      this.setData({
        'form.photo': app.getImageUrl(userInfo.avatar),
      });
      wx.showToast({
        title: '已使用微信头像',
        icon: 'success',
      });
      return;
    }
    
    // 显示选择头像弹窗
    this.setData({ showAvatarModal: true });
  },

  /**
   * 关闭头像选择弹窗
   */
  onCloseAvatarModal() {
    this.setData({ showAvatarModal: false });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 空函数，用于阻止点击弹窗内容时关闭弹窗
  },

  /**
   * 微信头像选择回调
   */
  onChooseWechatAvatar(e) {
    // 防止重复调用
    if (this.data.choosingAvatar) {
      console.log('chooseAvatar 正在进行中，忽略重复调用');
      return;
    }
    
    const { avatarUrl } = e.detail;
    console.log('获取到微信头像:', avatarUrl);
    
    // 先设置状态防止重复触发
    this.setData({ 
      choosingAvatar: true,
      showAvatarModal: false,
    });
    
    if (avatarUrl) {
      // 上传头像
      this.uploadPhoto(avatarUrl)
        .then(() => {
          console.log('头像上传完成');
        })
        .catch((err) => {
          console.error('头像上传失败:', err);
        })
        .finally(() => {
          // 延迟重置状态，避免快速重复触发
          setTimeout(() => {
            this.setData({ choosingAvatar: false });
          }, 500);
        });
    } else {
      console.log('未获取到头像 URL');
      this.setData({ choosingAvatar: false });
    }
  },


  /**
   * 从相册选择
   */
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: async (res) => {
        await this.uploadPhoto(res.tempFiles[0].tempFilePath);
      },
    });
  },

  /**
   * 拍照
   */
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: async (res) => {
        await this.uploadPhoto(res.tempFiles[0].tempFilePath);
      },
    });
  },

  /**
   * 上传照片
   */
  async uploadPhoto(tempFilePath) {
    console.log('开始上传照片:', tempFilePath);
    try {
      wx.showLoading({ title: '上传中...' });
      const uploadRes = await api.file.uploadImage(tempFilePath);
      console.log('上传响应:', uploadRes);
      
      // 使用 app.getImageUrl 处理返回的图片路径
      const photoUrl = uploadRes.url ? app.getImageUrl(uploadRes.url) : tempFilePath;
      console.log('处理后的图片 URL:', photoUrl);
      
      this.setData({
        'form.photo': photoUrl,
      });
      console.log('设置 form.photo 完成:', this.data.form.photo);
      
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success',
      });
    } catch (err) {
      console.error('上传失败:', err);
      wx.hideLoading();
      
      // 如果是微信临时文件路径，直接使用
      if (tempFilePath.startsWith('http://tmp') || tempFilePath.startsWith('wxfile://')) {
        console.log('使用微信临时文件路径:', tempFilePath);
        this.setData({
          'form.photo': tempFilePath,
        });
        wx.showToast({
          title: '使用本地图片',
          icon: 'none',
        });
      } else {
        wx.showToast({
          title: '上传失败',
          icon: 'none',
        });
      }
    }
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
   * 预览照片
   */
  onPreviewPhoto() {
    if (this.data.form.photo) {
      wx.previewImage({
        urls: [this.data.form.photo],
        current: this.data.form.photo,
      });
    }
  },

  /**
   * 照片加载错误
   */
  onPhotoError(e) {
    console.error('照片加载失败:', this.data.form.photo, e);
    wx.showToast({
      title: '照片加载失败',
      icon: 'none',
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
      const { form, isEdit, studentId, genders } = this.data;
      
      // 转换为后端期望的数据格式
      const submitData = {
        id_type: form.id_type === 'idcard' ? '身份证' : (form.id_type === 'passport' ? '护照' : '其他证件'),
        id_name: form.name,  // 后端字段名是 id_name
        id_number: form.id_number,
        photo: form.photo || '',
        birthday: form.birthday,
        gender: genders[this.data.genderIndex]?.label || '男',  // 后端期望字符串 "男"/"女"
      };
      
      console.log('提交学员数据:', submitData);
      
      if (isEdit) {
        await api.student.update(studentId, submitData);
      } else {
        await api.student.add(submitData);
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
      wx.showToast({
        title: err.message || '提交失败',
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
