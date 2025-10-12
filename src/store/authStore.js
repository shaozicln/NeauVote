import { defineStore } from 'pinia'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 从localStorage初始化，保持刷新后状态
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
    position: localStorage.getItem('position') || ''
  }),
  actions: {
    // 设置认证信息（登录成功后调用）
    setAuthInfo(authData) {
      this.token = authData.token
      this.username = authData.username
      this.position = authData.position
      // 同步到localStorage
      localStorage.setItem('token', authData.token)
      localStorage.setItem('username', authData.username)
      localStorage.setItem('position', authData.position)
    },
     // 清除认证信息时添加路由跳转（退出登录或token失效时调用）
    clearAuthInfo() {
      this.token = ''
      this.username = ''
      this.position = ''
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('position')
      
      // 主动跳转到登录页
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
  }
})