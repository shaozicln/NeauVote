<template>
  <div class="user-info-container">
    <el-card class="user-info-card">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-medium">个人信息</span>
        </div>
      </template>
      
      <div class="user-info-content">
        <el-form ref="userForm" :model="userFormData" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="userFormData.username" placeholder="请输入用户名" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="职位">
            <el-input v-model="userFormData.position" placeholder="请输入职位" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="当前密码" v-if="isEditing">
            <el-input v-model="userFormData.currentPassword" type="password" placeholder="请输入当前密码" />
          </el-form-item>
          
          <el-form-item label="新密码" v-if="isEditing">
            <el-input v-model="userFormData.newPassword" type="password" placeholder="请输入新密码" />
          </el-form-item>
          
          <el-form-item label="确认新密码" v-if="isEditing">
            <el-input v-model="userFormData.confirmPassword" type="password" placeholder="请确认新密码" />
          </el-form-item>
        </el-form>
        
        <div class="action-buttons mt-4 flex justify-end">
          <el-button v-if="!isEditing" type="primary" @click="handleEdit">
            <el-icon><Edit /></el-icon>
            编辑信息
          </el-button>
          
          <el-button v-if="isEditing" type="danger" @click="handleCancel" class="mr-2">
            取消
          </el-button>
          
          <el-button v-if="isEditing" type="primary" @click="handleSave">
            保存修改
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/authStore.js'
import { Edit } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const userForm = ref(null)
const isEditing = ref(false)

// 用户表单数据
const userFormData = reactive({
  username: '',
  position: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 初始化用户信息
onMounted(() => {
  loadUserInfo()
})

// 加载用户信息
const loadUserInfo = () => {
  // 从authStore获取用户信息
  userFormData.username = authStore.username || ''
  userFormData.position = authStore.position || ''
  
  // 实际项目中可以从API获取更详细的用户信息
  // 这里使用模拟数据
  if (!userFormData.username) {
    userFormData.username = 'admin'
    userFormData.position = '管理员'
  }
}

// 处理编辑
const handleEdit = () => {
  isEditing.value = true
}

// 处理取消
const handleCancel = () => {
  isEditing.value = false
  // 清空密码相关字段
  userFormData.currentPassword = ''
  userFormData.newPassword = ''
  userFormData.confirmPassword = ''
}

// 处理保存
const handleSave = () => {
  // 表单验证
  if (userForm.value) {
    userForm.value.validate((valid) => {
      if (valid) {
        // 验证密码是否一致
        if (userFormData.newPassword && userFormData.newPassword !== userFormData.confirmPassword) {
          ElMessage.error('两次输入的新密码不一致')
          return
        }
        
        // 模拟保存操作
        setTimeout(() => {
          // 更新authStore中的用户信息
          authStore.setAuthInfo({
            token: authStore.token,
            username: userFormData.username,
            position: userFormData.position
          })
          
          isEditing.value = false
          // 清空密码相关字段
          userFormData.currentPassword = ''
          userFormData.newPassword = ''
          userFormData.confirmPassword = ''
          
          ElMessage.success('用户信息更新成功')
        }, 500)
      }
    })
  }
}
</script>

<style scoped>
.user-info-container {
  width: 100%;
}

.user-info-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info-content {
  padding: 20px 0;
}

.action-buttons {
  margin-top: 20px;
}
</style>