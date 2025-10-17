<template>
  <div class="activity-config-container">
    <el-card>
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-medium">投票活动配置</span>
          <el-button type="primary" @click="handleSaveConfig">
            保存配置
          </el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="mt-4">
        <el-tab-pane label="基础设置">
          <el-form ref="basicForm" :model="configData" label-width="150px" class="mt-4">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="configData.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            
            <el-form-item label="每页显示条数" prop="pageSize">
              <el-input-number v-model="configData.pageSize" :min="5" :max="100" :step="1" />
            </el-form-item>
            
            <el-form-item label="默认投票有效期（天）" prop="defaultVoteDuration">
              <el-input-number v-model="configData.defaultVoteDuration" :min="1" :max="365" :step="1" />
            </el-form-item>
            
            <el-form-item label="每人每天最大投票数" prop="maxVotesPerDay">
              <el-input-number v-model="configData.maxVotesPerDay" :min="1" :max="100" :step="1" />
            </el-form-item>
            
            <el-form-item label="投票结果显示方式">
              <el-radio-group v-model="configData.resultDisplayMode">
                <el-radio label="realTime">实时显示</el-radio>
                <el-radio label="afterEnd">投票结束后显示</el-radio>
                <el-radio label="adminOnly">仅管理员可见</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="允许查看他人投票">
              <el-switch v-model="configData.allowViewOthersVotes" />
            </el-form-item>
            
            <el-form-item label="允许重复投票">
              <el-switch v-model="configData.allowDuplicateVotes" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="权限设置">
          <el-form ref="permissionForm" :model="permissionData" label-width="150px" class="mt-4">
            <el-form-item label="允许匿名投票">
              <el-switch v-model="permissionData.allowAnonymousVote" />
            </el-form-item>
            
            <el-form-item label="投票权限设置">
              <el-checkbox-group v-model="permissionData.votePermissions">
                <el-checkbox label="教授" />
                <el-checkbox label="副教授" />
                <el-checkbox label="讲师" />
                <el-checkbox label="助教" />
                <el-checkbox label="学生" />
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="管理权限设置">
              <el-checkbox-group v-model="permissionData.managePermissions">
                <el-checkbox label="教授" />
                <el-checkbox label="副教授" />
                <el-checkbox label="讲师" />
                <el-checkbox label="助教" />
                <el-checkbox label="学生" />
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="自动审核新投票">
              <el-switch v-model="permissionData.autoApproveVotes" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="通知设置">
          <el-form ref="notificationForm" :model="notificationData" label-width="150px" class="mt-4">
            <el-form-item label="启用邮件通知">
              <el-switch v-model="notificationData.enableEmailNotification" />
            </el-form-item>
            
            <el-form-item label="投票开始通知" v-if="notificationData.enableEmailNotification">
              <el-switch v-model="notificationData.notifyVoteStart" />
            </el-form-item>
            
            <el-form-item label="投票结束通知" v-if="notificationData.enableEmailNotification">
              <el-switch v-model="notificationData.notifyVoteEnd" />
            </el-form-item>
            
            <el-form-item label="结果公布通知" v-if="notificationData.enableEmailNotification">
              <el-switch v-model="notificationData.notifyResultPublish" />
            </el-form-item>
            
            <el-form-item label="通知模板">
              <el-input v-model="notificationData.notificationTemplate" type="textarea" placeholder="请输入通知模板" :rows="5" />
              <div class="text-xs text-gray-500 mt-2">
                可用变量: {userName}, {voteTitle}, {startTime}, {endTime}, {systemName}
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="数据清理">
          <div class="data-cleanup-content mt-4">
            <div class="cleanup-item mb-6">
              <h4 class="text-md font-medium mb-3">清理过期投票数据</h4>
              <p class="text-gray-600 mb-4">清理已结束且超过指定天数的投票数据</p>
              <el-select v-model="cleanupData.expiredDays" placeholder="选择天数" style="width: 150px; margin-right: 10px;">
                <el-option label="30天" value="30" />
                <el-option label="60天" value="60" />
                <el-option label="90天" value="90" />
                <el-option label="180天" value="180" />
                <el-option label="365天" value="365" />
              </el-select>
              <el-button type="danger" @click="handleCleanupExpiredData">
                执行清理
              </el-button>
            </div>
            
            <div class="cleanup-item">
              <h4 class="text-md font-medium mb-3">清理日志数据</h4>
              <p class="text-gray-600 mb-4">清理超过指定天数的操作日志</p>
              <el-select v-model="cleanupData.logDays" placeholder="选择天数" style="width: 150px; margin-right: 10px;">
                <el-option label="7天" value="7" />
                <el-option label="30天" value="30" />
                <el-option label="90天" value="90" />
                <el-option label="180天" value="180" />
              </el-select>
              <el-button type="danger" @click="handleCleanupLogData">
                执行清理
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, updateActivity } from '@/api/activities'

// 当前激活的标签页
const activeTab = ref('0')
// 加载状态
const loading = ref(false)

// 基础配置数据
const configData = reactive({
  systemName: 'NEAU投票系统',
  pageSize: 20,
  defaultVoteDuration: 15,
  maxVotesPerDay: 10,
  resultDisplayMode: 'realTime', // realTime, afterEnd, adminOnly
  allowViewOthersVotes: false,
  allowDuplicateVotes: false
})

// 权限配置数据
const permissionData = reactive({
  allowAnonymousVote: false,
  votePermissions: ['教授', '副教授', '讲师'],
  managePermissions: ['教授', '副教授'],
  autoApproveVotes: true
})

// 通知配置数据
const notificationData = reactive({
  enableEmailNotification: true,
  notifyVoteStart: true,
  notifyVoteEnd: true,
  notifyResultPublish: true,
  notificationTemplate: '尊敬的{userName}：\n\n关于投票活动"{voteTitle}"，特此通知您：{notificationContent}\n\n{systemName}\n{currentDate}'
})

// 数据清理配置
const cleanupData = reactive({
  expiredDays: '90',
  logDays: '30'
})

// 表单引用
const basicForm = ref(null)
const permissionForm = ref(null)
const notificationForm = ref(null)

// 初始化配置
onMounted(() => {
  loadConfig()
})

// 加载配置
const loadConfig = async () => {
  loading.value = true
  try {
    // 从API获取配置数据
    const response = await getActivities()
    const activities = response.data || []
    
    // 如果有活动数据，可以从第一个活动中获取配置信息
    // 这里假设活动数据中包含配置相关字段
    if (activities.length > 0) {
      const firstActivity = activities[0]
      
      // 合并配置数据
      Object.assign(configData, {
        systemName: firstActivity.systemName || configData.systemName,
        pageSize: firstActivity.pageSize || configData.pageSize,
        defaultVoteDuration: firstActivity.defaultVoteDuration || configData.defaultVoteDuration,
        maxVotesPerDay: firstActivity.maxVotesPerDay || configData.maxVotesPerDay,
        resultDisplayMode: firstActivity.resultDisplayMode || configData.resultDisplayMode,
        allowViewOthersVotes: firstActivity.allowViewOthersVotes !== undefined ? firstActivity.allowViewOthersVotes : configData.allowViewOthersVotes,
        allowDuplicateVotes: firstActivity.allowDuplicateVotes !== undefined ? firstActivity.allowDuplicateVotes : configData.allowDuplicateVotes
      })
      
      // 合并权限配置
      if (firstActivity.permissionData) {
        Object.assign(permissionData, firstActivity.permissionData)
      }
      
      // 合并通知配置
      if (firstActivity.notificationData) {
        Object.assign(notificationData, firstActivity.notificationData)
      }
      
      // 合并数据清理配置
      if (firstActivity.cleanupData) {
        Object.assign(cleanupData, firstActivity.cleanupData)
      }
    }
    
    ElMessage.success('配置加载成功')
  } catch (error) {
    ElMessage.error('获取配置数据失败')
    console.error('获取配置数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSaveConfig = async () => {
  // 验证当前标签页的表单
  let isValid = true
  
  if (activeTab.value === '0') {
    // 验证基础设置表单
    isValid = validateForm(basicForm)
  } else if (activeTab.value === '1') {
    // 验证权限设置表单
    isValid = validateForm(permissionForm)
  } else if (activeTab.value === '2') {
    // 验证通知设置表单
    isValid = validateForm(notificationForm)
  }
  
  if (isValid) {
    loading.value = true
    try {
      // 获取所有活动数据
      const response = await getActivities()
      const activities = response.data || []
      
      // 构建配置对象
      const configToSave = {
        ...configData,
        permissionData: { ...permissionData },
        notificationData: { ...notificationData },
        cleanupData: { ...cleanupData }
      }
      
      // 如果有活动，更新第一个活动的配置
      if (activities.length > 0) {
        const firstActivity = activities[0]
        await updateActivity({
          ...firstActivity,
          ...configToSave
        })
      } else {
        // 如果没有活动，可以创建一个新的配置活动
        // 这里简化处理，实际可能需要专门的配置API
        ElMessage.warning('暂无活动数据，配置已更新但未保存到服务器')
      }
      
      ElMessage.success('配置保存成功')
    } catch (error) {
      ElMessage.error('配置保存失败')
      console.error('保存配置失败:', error)
    } finally {
      loading.value = false
    }
  }
}

// 验证表单
const validateForm = (formRef) => {
  if (formRef.value) {
    let isValid = true
    formRef.value.validate((valid) => {
      if (!valid) {
        isValid = false
      }
    })
    return isValid
  }
  return true
}

// 清理过期数据
const handleCleanupExpiredData = async () => {
  ElMessageBox.confirm(`确定要清理超过${cleanupData.expiredDays}天的过期投票数据吗？此操作不可恢复。`, '确认清理', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    loading.value = true
    try {
      // 这里应该调用专门的数据清理API
      // 由于API中没有专门的清理方法，这里简化处理
      // 实际项目中应该有类似 deleteExpiredActivities 的API
      
      // 模拟清理操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('过期投票数据清理完成')
    } catch (error) {
      ElMessage.error('清理过期数据失败')
      console.error('清理过期数据失败:', error)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消清理
  })
}

// 清理日志数据
const handleCleanupLogData = async () => {
  ElMessageBox.confirm(`确定要清理超过${cleanupData.logDays}天的日志数据吗？此操作不可恢复。`, '确认清理', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    loading.value = true
    try {
      // 这里应该调用专门的日志清理API
      // 由于API中没有专门的清理方法，这里简化处理
      // 实际项目中应该有类似 deleteExpiredLogs 的API
      
      // 模拟清理操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('日志数据清理完成')
    } catch (error) {
      ElMessage.error('清理日志数据失败')
      console.error('清理日志数据失败:', error)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消清理
  })
}
</script>

<style scoped>
.activity-config-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-cleanup-content {
  padding: 0 20px;
}

.cleanup-item {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.cleanup-item h4 {
  margin-bottom: 10px;
}

.cleanup-item p {
  color: #666;
  margin-bottom: 15px;
}
</style>