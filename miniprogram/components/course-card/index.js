/**
 * 课程卡片组件
 */
const util = require('../../utils/util');
const app = getApp();

// 默认课程图片
const DEFAULT_COURSE_IMAGE = '/assets/images/course-default.png';

Component({
  /**
   * 组件属性
   */
  properties: {
    course: {
      type: Object,
      value: {},
    },
  },

  /**
   * 组件数据
   */
  data: {
    imageUrl: DEFAULT_COURSE_IMAGE,
    avatarList: [],
  },

  /**
   * 数据观察器
   */
  observers: {
    'course': function(course) {
      if (course && course.id) {
        this.formatCourseData(course);
      }
    },
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 格式化课程数据
     */
    formatCourseData(course) {
      // 处理图片 URL
      let imageUrl = DEFAULT_COURSE_IMAGE;
      if (course.image) {
        // 检查是否是有效的图片 URL
        if (course.image.startsWith('http://') || course.image.startsWith('https://')) {
          // 检查是否是假的测试 URL
          if (course.image.includes('img.example.com')) {
            imageUrl = DEFAULT_COURSE_IMAGE;
          } else {
            imageUrl = course.image;
          }
        } else if (course.image.startsWith('/uploads') || course.image.startsWith('uploads')) {
          // 本地上传的图片，拼接完整 URL
          imageUrl = app.getImageUrl(course.image);
        } else {
          imageUrl = course.image;
        }
      }
      this.setData({ imageUrl });
      // 格式化上课时间
      const scheduleText = course.schedule || '';
      
      // 计算剩余名额
      const remainingSlots = (course.max_students || 10) - (course.enrolled_count || 0);
      
      // 格式化价格
      const priceObj = util.formatPriceObject(course.price || 0);
      const memberPriceObj = util.formatPriceObject(course.member_price || 0);
      
      // 状态标签
      let statusTag = '';
      let statusClass = '';
      switch (course.status) {
        case 'enrolling':
          statusTag = '报名中';
          statusClass = 'tag-primary';
          break;
        case 'ongoing':
          statusTag = '进行中';
          statusClass = 'tag-success';
          break;
        case 'completed':
          statusTag = '已结束';
          statusClass = 'tag-secondary';
          break;
        case 'cancelled':
          statusTag = '已取消';
          statusClass = 'tag-secondary';
          break;
        default:
          break;
      }
      
      // 生成头像列表（模拟已报名用户头像）
      const enrolledCount = course.enrolled_count || 0;
      const avatarList = [];
      const defaultAvatars = [
        '/assets/images/avatar-default.png',
      ];
      // 显示最多3个头像
      for (let i = 0; i < Math.min(enrolledCount, 3); i++) {
        avatarList.push(defaultAvatars[0]);
      }
      
      this.setData({
        scheduleText,
        remainingSlots,
        priceObj,
        memberPriceObj,
        statusTag,
        statusClass,
        avatarList,
      });
    },

    /**
     * 图片加载失败
     */
    onImageError() {
      this.setData({ imageUrl: DEFAULT_COURSE_IMAGE });
    },

    /**
     * 点击卡片
     */
    onTap() {
      const { course } = this.properties;
      if (course && course.id) {
        wx.navigateTo({
          url: `/pages/course/detail/index?id=${course.id}`,
        });
      }
    },

    /**
     * 点击拼班按钮
     */
    onJoin() {
      const { course } = this.properties;
      this.triggerEvent('join', { course });
    },
  },
});
