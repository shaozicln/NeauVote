import axios from 'axios'
import { ElMessage } from 'element-plus'
// 导入路由实例而不是useRouter()
import router from '@/router'
// 导入authStore实例而不是useAuthStore()
import { useAuthStore } from '@/store/authStore'

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
    // 增强数据解析的健壮性
    if (!response || !response.data) {
      ElMessage.warning('无效的响应数据')
      return Promise.reject(new Error('无效的响应数据'))
    }
    
    const { code, msg, data } = response.data

    if (code === 1) {
      return data
    }

    // 记录业务错误日志以便调试
    console.warn('业务逻辑错误:', { code, msg })
    ElMessage.warning(msg || '操作失败，请重试')
    return Promise.reject(new Error(msg || '业务逻辑错误'))
  },
  (error) => {
    // 增强错误上下文信息
    const authStore = useAuthStore()
    const errorResponse = error.response
    const requestConfig = error.config || {}
    const url = requestConfig.url || '未知URL'
    const method = requestConfig.method?.toUpperCase() || '未知方法'

    // token失效处理（401状态码或其他token相关错误）
    const responseData = errorResponse?.data
    const isTokenExpired = 
      errorResponse?.status === 403 || 
      errorResponse?.status === 401 ||
      responseData?.code === 403 || 
      responseData?.code === 401 ||
      responseData?.msg?.includes('token') || 
      responseData?.msg?.includes('Token') || 
      responseData?.msg?.includes('未登录') || 
      responseData?.msg?.includes('权限')
    
    console.error(`API请求失败: ${method} ${url}`, {
      status: errorResponse?.status,
      responseData,
      error: error.message
    })
    
    if (isTokenExpired) {
      ElMessage.error('登录已过期或无权限，请重新登录')
      // 使用异步方式处理，确保在正确的上下文中执行
      setTimeout(() => {
        authStore.clearAuthInfo()
        router.push('/login')
      }, 500) // 稍微延迟，让用户看到提示
    } else if (errorResponse?.status === 500) {
      // 提供更具体的服务器错误信息
      const serverMsg = responseData?.msg || '服务器异常'
      const errorMsg = `${serverMsg},请联系管理员`
      ElMessage.error(errorMsg)
      // 确保错误消息反映真实的服务器错误，而不是被误解为网络错误
      error.message = errorMsg
    } else if (errorResponse?.status === 404) {
      ElMessage.error(`请求的接口不存在: ${url}`)
    } else {
      // 检查是否是网络错误
      if (!errorResponse) {
        ElMessage.error('网络异常，请检查网络连接后重试')
      } else {
        // 尝试显示后端返回的错误信息
        ElMessage.error(responseData?.msg || '请求失败，请重试')
      }
    }

    // 创建包含更多上下文信息的错误对象
    const enhancedError = new Error(error.message || '请求失败')
    enhancedError.url = url
    enhancedError.method = method
    enhancedError.status = errorResponse?.status
    enhancedError.responseData = responseData
    enhancedError.originalError = error
    
    return Promise.reject(enhancedError)
  }
)

export default request

