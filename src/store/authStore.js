import { defineStore } from 'pinia'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 从localStorage初始化，保持刷新后状态
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
    position: localStorage.getItem('position') || '',
    userId: localStorage.getItem('userId') || ''
  }),
  actions: {
    // 设置认证信息（登录成功后调用）
    setAuthInfo(authData) {
      this.token = authData.token
      this.username = authData.username
      this.position = authData.position
      this.userId = authData.id || '' // 从返回数据中获取id字段
      // 同步到localStorage
      localStorage.setItem('token', authData.token)
      localStorage.setItem('username', authData.username)
      localStorage.setItem('position', authData.position)
      localStorage.setItem('userId', authData.id || '')
    },
     // 清除认证信息时添加路由跳转（退出登录或token失效时调用）
    clearAuthInfo() {
      console.log('执行clearAuthInfo，清除认证信息')
      // 清空状态
      this.token = ''
      this.username = ''
      this.position = ''
      this.userId = ''
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('position')
      localStorage.removeItem('userId')
      
      // 清除sessionStorage中的相关信息
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userInfo')
      
      // 主动跳转到登录页，确保在非登录页面时跳转
      setTimeout(() => {
        if (router.currentRoute.value.path !== '/login') {
          console.log('跳转到登录页面')
          router.push('/login')
        }
      }, 100)
    }
  }
})