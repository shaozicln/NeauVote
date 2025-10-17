<template>
  <!-- 背景遮罩层 -->
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleClose">
    <!-- 弹窗内容 -->
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6" @click.stop>
      <!-- 弹窗头部 -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-800">个人信息</h3>
        <button @click="handleClose" class="text-gray-500 hover:text-gray-700">
          <i class="text-xl">×</i>
        </button>
      </div>
      
      <!-- 弹窗内容 -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">用户名：</span>
          <span class="font-medium">{{ authStore.username || '-' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">身份：</span>
          <span class="font-medium">{{ positionText || '-' }}</span>
        </div>
      </div>
      
      <!-- 底部提示信息 -->
      <div class="mt-6 pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600 text-center">
          若当前个人信息有误请联系现场工作人员修改
        </p>
      </div>
      
      <!-- 联系工作人员按钮 -->
      <div class="mt-4 text-center">
        <button 
          @click="handleContactStaff"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          联系工作人员
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/authStore.js'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 获取authStore实例
const authStore = useAuthStore()

// 计算属性：职位文本
const positionText = computed(() => {
  const positionMap = {
    1: '管理员',
    2: '评审专家',
    3: '普通用户'
  }
  return positionMap[authStore.position] || authStore.position || '未知'
})

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}

// 联系工作人员
const handleContactStaff = () => {
  ElMessage({ 
    message: '已联系工作人员，请耐心等待',
    type: 'success',
    duration: 3000
  })
  handleClose()
}

// Emits
const emit = defineEmits(['update:visible'])
</script>

<style scoped>
/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.scale-enter-active, .scale-leave-active {
  transition: transform 0.3s ease;
}
.scale-enter-from {
  transform: scale(0.9);
}
.scale-leave-to {
  transform: scale(0.9);
}
</style>