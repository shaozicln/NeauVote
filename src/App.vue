<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

// 创建一个自定义事件总线，用于在组件间通信
const eventBus = {
  events: {},
  
  // 触发事件
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  },
  
  // 监听事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    
    // 返回取消监听的函数
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }
}

// 将事件总线挂载到window对象上，使其全局可访问
window.eventBus = eventBus

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)
const isAdmin = ref(false)
const username = ref('')

// 检查登录状态和用户身份
onMounted(() => {
  checkLoginStatus()
  
  // 如果没有登录信息且不在登录页，则显示提示并跳转到登录页
  if (!isLoggedIn.value && route.path !== '/login' && route.path !== '/404') {
    console.log('未检测到用户信息，显示提示并跳转到登录页面')
    ElMessage.info('尚无用户信息，请登录')
    // 延迟一小段时间后跳转，让用户有时间看到提示信息
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }
  
  // 监听登录成功事件，更新状态
  eventBus.on('loginSuccess', () => {
    console.log('接收到登录成功事件，更新登录状态')
    checkLoginStatus()
  })
})

// 检查登录状态
function checkLoginStatus() {
  const token = localStorage.getItem('token')
  const userPosition = localStorage.getItem('position')
  const userUsername = localStorage.getItem('username')
  
  if (token) {
    isLoggedIn.value = true
    username.value = userUsername || '用户'
    
    // 检查是否是管理员
    if (userPosition && userPosition.includes('管理员')) {
      isAdmin.value = true
    }
  }
}

// 退出登录
function logout() {
  console.log('执行退出登录函数')
  
  // 使用Element Plus的确认对话框
  ElMessageBox.confirm(
    '是否退出登录？',
    '确认退出',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 用户点击确认后执行的逻辑
    try {
      // 清空本地所有数据
      console.log('清空localStorage和sessionStorage')
      localStorage.clear()
      sessionStorage.clear()
      
      // 更新状态
      console.log('更新登录状态')
      isLoggedIn.value = false
      isAdmin.value = false
      username.value = ''
      
      // 跳转到登录页面
      console.log('跳转到登录页面')
      router.push('/login')
      
      // 显示成功消息
      ElMessage.success('退出登录成功')
    } catch (error) {
      console.error('退出登录过程中发生错误:', error)
      ElMessage.error('退出登录失败，请重试')
    }
  }).catch(() => {
    // 用户点击取消后执行的逻辑
    console.log('用户取消退出登录')
    // 不需要特殊操作，回到当前状态
  })
}

// 根据当前路由决定跳转到管理页面还是前台页面
function toggleAdminFrontend() {
  if (route.path === '/adminIndex') {
    // 如果当前在管理页面，则跳转到前台首页
    router.push('/')
  } else {
    // 否则跳转到管理页面
    router.push('/adminIndex')
  }
}

// 计算属性：根据当前路由返回按钮文本
const adminButtonText = computed(() => {
  return route.path === '/adminIndex' ? '前台' : '管理'
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <!-- 根据路由显示不同的标题 -->
        <template v-if="route.path === '/adminIndex'">
          <h2 class="font-bold text-xl text-blue-600">后台管理Vote@NEAU</h2>
          <span class="text-gray-700">欢迎，{{ username }}</span>
        </template>
        <template v-else>
          <div class="font-bold text-xl text-gray-800">投票系统Vote@NEAU</div>
        </template>
        
        <!-- 右侧按钮区域 -->
        <div class="flex items-center space-x-4">
          <!-- 管理员/前台切换按钮 -->
          <button 
            v-if="isAdmin"
            @click="toggleAdminFrontend"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {{ adminButtonText }}
          </button>
          
          <!-- 登录/退出按钮 -->
          <button 
            @click="logout"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {{ isLoggedIn ? '退出登录' : '登录' }}
          </button>
        </div>
      </div>
    </nav>
    
    <!-- 页面内容 -->
    <main class="flex-grow">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Tailwind CSS基础样式 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 一些全局样式来测试是否生效 */
body {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
