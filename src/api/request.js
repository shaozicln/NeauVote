import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

//console.log('当前环境的后端基础地址：', import.meta.env.VITE_API_BASE_URL)

// 创建Axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器：自动携带token
request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    // 从pinia获取token并添加到请求头
    if (authStore.token) {
      config.headers.token = authStore.token
    }
    return config
  },
  (error) => {
    ElMessage.error('请求无法发送，请检查网络连接')
    return Promise.reject(error)
  }
)

// 响应拦截器：处理响应和错误
request.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data

    if (code === 1) {
      return data
    }

    ElMessage.warning(msg || '操作失败，请重试')
    return Promise.reject(new Error(msg || '业务逻辑错误'))
  },
  (error) => {
    const authStore = useAuthStore()
    const router = useRouter()
    const errorResponse = error.response

    // token失效处理（401状态码）
    if (errorResponse?.status === 401) {
      ElMessage.error('登录已过期或无权限，请重新登录')
      authStore.clearAuthInfo()
      router.push('/login')
    } else if (errorResponse?.status === 500) {
      ElMessage.error('服务器异常，请联系管理员')
    } else if (errorResponse?.status === 404) {
      ElMessage.error('请求的接口不存在')
    } else {
      ElMessage.error('网络异常，请检查后重试')
    }

    return Promise.reject(error)
  }
)

export default request