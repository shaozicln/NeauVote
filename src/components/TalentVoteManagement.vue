<template>
  <div class="talent-vote-container">
    <el-card>
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-medium">拟引进优秀人才投票管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddVote" class="mr-2">
              <el-icon><Plus /></el-icon>
              添加投票
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-filter mb-4">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索投票标题" 
          style="width: 300px; margin-right: 10px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select 
          v-model="statusFilter" 
          placeholder="筛选状态" 
          style="width: 120px; margin-right: 10px;"
        >
          <el-option label="全部" value="" />
          <el-option label="进行中" :value="1" />
          <el-option label="未进行" :value="0" />
        </el-select>
        <!-- 日期筛选已移除 -->
      </div>
      
      <!-- 投票列表 -->
      <el-table :data="filteredVotes" style="width: 100%" v-loading="loading" fit>
        <el-table-column prop="activityId" label="投票ID" />
        <el-table-column prop="activityName" label="投票标题" min-width="250" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag
              :type="scope.row.activityStatus === 1 ? 'success' : 'warning'"
            >
              {{ scope.row.activityStatus === 1 ? "进行中" : "未进行" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maxVoteNum" label="最大投票数" />
        <el-table-column prop="recNum" label="推荐数" />
        <el-table-column label="是否记名">
          <template #default="scope">
            <el-tag :type="scope.row.isName === 1 ? 'success' : 'warning'">
              {{ scope.row.isName === 1 ? "记名" : "不记名" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="250">
          <template #default="scope">
            <div class="flex space-x-1">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetails(scope.row)"
              plain
            >
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleEditVote(scope.row)"
              plain
            >
              编辑
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleToggleStatus(scope.row)"
              class="mr-1"
              plain
            >
              {{ scope.row.activityStatus === 1 ? "暂停" : "激活" }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteVote(scope.row.activityId)"
              plain
            >
                删除
              </el-button>
            </div>
            </template>
          </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredVotes.length"
        />
      </div>
    </el-card>
    
    <!-- 编辑投票弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑投票" width="700px">
      <el-form ref="editVoteForm" :model="editVoteFormData" :rules="rules" label-width="120px">
        <el-form-item label="投票ID" prop="activityId">
          <el-input v-model="editVoteFormData.activityId" disabled placeholder="投票ID" />
        </el-form-item>
        
        <el-form-item label="投票标题" prop="activityName">
          <el-input v-model="editVoteFormData.activityName" placeholder="请输入投票标题" />
        </el-form-item>
        
        <el-form-item label="最大投票数" prop="maxVoteNum">
          <el-input v-model.number="editVoteFormData.maxVoteNum" type="number" placeholder="请输入最大投票数" />
        </el-form-item>
        
        <el-form-item label="状态" prop="activityStatus">
          <el-switch v-model="editVoteFormData.activityStatus" />
        </el-form-item>
        
        <el-form-item label="是否记名" prop="isName">
          <el-switch v-model="editVoteFormData.isName" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelEdit">取消</el-button>
          <el-button type="primary" @click="handleSaveVote">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getActivityEmp1s, addActivityEmp1, updateActivityEmp1, deleteActivityEmp1 } from '@/api/activityEmp1'

// 搜索查询
const searchQuery = ref('')
// 状态筛选
const statusFilter = ref('')
// 日期筛选
const dateFilter = ref([])
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)
// 加载状态
const loading = ref(false)

// 投票数据
const votes = ref([])

// 加载投票数据
const loadVotes = async () => {
  loading.value = true
  try {
    const data = await getActivityEmp1s()
    votes.value = data || []
    console.log('加载投票数据成功:', data)
  } catch (error) {
    ElMessage.error('获取投票数据失败')
    console.error('获取投票数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadVotes()
})

// 编辑对话框显示状态
const editDialogVisible = ref(false)
// 编辑投票表单数据
const editVoteForm = ref(null)
const editVoteFormData = reactive({
  activityId: '',
  activityName: '',
  maxVoteNum: 10,
  activityStatus: 0,
  isName: 1
})

// 表单验证规则
const rules = {
  activityName: [
    { required: true, message: '请输入投票标题', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  maxVoteNum: [
    { required: true, message: '请输入最大投票数', trigger: 'blur' },
    { type: 'number', min: 1, message: '最大投票数必须大于0', trigger: 'blur' }
  ]
}

// 监听状态筛选变化
watch(statusFilter, (newVal) => {
  console.log('状态筛选变化:', newVal, '类型:', typeof newVal)
})

// 过滤后的投票列表
const filteredVotes = computed(() => {
  console.log('执行筛选 - statusFilter:', statusFilter.value, '类型:', typeof statusFilter.value)
  
  let result = votes.value
  // 先应用搜索过滤
  if (searchQuery.value) {
    result = result.filter(vote => vote.activityName && vote.activityName.includes(searchQuery.value))
  }
  
  // 再应用状态过滤
  if (statusFilter.value !== '' && statusFilter.value !== null && statusFilter.value !== undefined) {
    console.log('应用状态筛选，值:', statusFilter.value)
    // 直接使用原始值比较
    result = result.filter(vote => {
      console.log(`比较: vote.activityStatus=${vote.activityStatus} (${typeof vote.activityStatus}) 和 statusFilter.value=${statusFilter.value} (${typeof statusFilter.value})`)
      return vote.activityStatus === statusFilter.value
    })
  }
  
  console.log('筛选结果数量:', result.length)
  return result
})

// 状态相关方法已在模板中直接实现

// 处理添加投票
const handleAddVote = () => {
  // 设置默认值：状态默认是进行中，是否记名默认是不记名
  Object.assign(editVoteFormData, {
    activityId: '',
    activityName: '',
    maxVoteNum: '',
    activityStatus: true, // true: 进行中 (switch组件使用布尔值)
    isName: false // false: 不记名 (switch组件使用布尔值)
  })
  
  editDialogVisible.value = true
}

// 处理编辑投票
const handleEditVote = (vote) => {
  Object.assign(editVoteFormData, {
    activityId: vote.activityId || vote.id,
    activityName: vote.activityName,
    maxVoteNum: vote.maxVoteNum || 10,
    activityStatus: Boolean(vote.activityStatus),
    isName: Boolean(vote.isName) 
  })
  
  editDialogVisible.value = true
}

// 选项相关方法已移除

// 处理保存投票
const handleSaveVote = async () => {
  // 验证表单
  if (!editVoteForm.value) return
  
  try {
    await editVoteForm.value.validate()
    
    loading.value = true
    const voteData = {
      ...editVoteFormData
    }
    
    // 确保数值类型正确
    voteData.maxVoteNum = Number(voteData.maxVoteNum)
    voteData.activityStatus = Number(voteData.activityStatus)
    voteData.isName = Number(voteData.isName)
    
    if (editVoteFormData.activityId) {
      // 编辑现有投票
      await updateActivityEmp1(voteData)
      ElMessage.success('投票编辑成功')
    } else {
      // 添加新投票
      await addActivityEmp1(voteData)
      ElMessage.success('投票添加成功')
    }
    
    // 重新加载数据
    await loadVotes()
    editDialogVisible.value = false
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error(editVoteFormData.activityId ? '编辑投票失败' : '添加投票失败')
      console.error('保存投票失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 处理取消编辑
const handleCancelEdit = () => {
  editDialogVisible.value = false
}

// 处理查看详情
const handleViewDetails = (vote) => {
  // 跳转到信息统计页面
  window.sessionStorage.setItem('currentVoteActivityId', vote.activityId || vote.id);
  // 触发父组件的菜单切换事件，跳转到TalentMsg页面
  const event = new CustomEvent('menu-select', { detail: '3-2' });
  window.dispatchEvent(event);
}

// 处理切换状态
const handleToggleStatus = async (vote) => {
  const newStatus = vote.activityStatus === 1 ? 0 : 1
  ElMessageBox.confirm(`确定要${newStatus === 1 ? '激活' : '暂停'}该投票吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      await updateActivityEmp1({
        ...vote,
        activityStatus: newStatus
      })
      ElMessage.success(`投票${newStatus === 1 ? '激活' : '暂停'}成功`)
      // 重新加载数据
      await loadVotes()
    } catch (error) {
      ElMessage.error(`投票${newStatus === 1 ? '激活' : '暂停'}失败`)
      console.error('更新投票状态失败:', error)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消操作
  })
}

// 处理删除投票
const handleDeleteVote = async (id) => {
  const voteToDelete = votes.value.find(v => v.id === id || v.activityId === id);
  ElMessageBox.confirm(`确定要删除投票「${voteToDelete?.activityName || id}」吗？删除后无法恢复。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(async () => {
    loading.value = true
    try {
      await deleteActivityEmp1(id)
      ElMessage.success('投票删除成功')
      // 重新加载数据
      await loadVotes()
    } catch (error) {
      ElMessage.error('删除投票失败')
      console.error('删除投票失败:', error)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理刷新
const handleRefresh = async () => {
  await loadVotes()
  ElMessage.success('数据刷新成功')
}
</script>

<style scoped>
.talent-vote-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 20px;
}

.option-item {
  display: flex;
  align-items: center;
}

.flex {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.space-x-1 > * + * {
  margin-left: 8px;
}
</style>