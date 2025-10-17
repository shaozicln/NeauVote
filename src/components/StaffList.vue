<template>
  <div class="staff-list-container">
    <el-card>
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-medium">教职员工信息管理</span>
          <el-button type="primary" @click="handleAddStaff">
            <el-icon><Plus /></el-icon>
            添加教职员工
          </el-button>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-filter mb-4">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索用户名或ID" 
          style="width: 300px; margin-right: 10px;"
          prefix-icon="Search"
        />
        <el-select 
          v-model="positionFilter" 
          placeholder="筛选职位" 
          style="width: 120px; margin-right: 10px;"
        >
          <el-option label="全部" value="" />
          <el-option label="教授" value="教授" />
          <el-option label="副教授" value="副教授" />
          <el-option label="讲师" value="讲师" />
          <el-option label="助教" value="助教" />
        </el-select>
      </div>
      
      <!-- 教职员工列表 -->
      <el-table :data="filteredStaff" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="position" label="职位" width="120">
          <template #default="scope">
            <el-tag>
              {{ scope.row.position }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
        <el-table-column prop="phone" label="电话" show-overflow-tooltip />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.isActive" @change="handleToggleStatus(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditStaff(scope.row)" class="mr-1">
              编辑
            </el-button>
            <el-button type="primary" size="small" @click="handleResetPassword(scope.row)" class="mr-1">
              重置密码
            </el-button>
            <el-button type="primary" size="small" @click="handleSetVoteActivity(scope.row)" class="mr-1">
              设置投票
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteStaff(scope.row.id)">
              删除
            </el-button>
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
          :total="filteredStaff.length"
        />
      </div>
    </el-card>
    
    <!-- 编辑教职员工弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑教职员工" width="600px">
      <el-form ref="editStaffForm" :model="editStaffFormData" label-width="120px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editStaffFormData.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="ID" prop="id" v-if="editStaffFormData.id">
          <el-input v-model="editStaffFormData.id" placeholder="请输入ID" disabled />
        </el-form-item>
        
        <el-form-item label="职位" prop="position">
          <el-select v-model="editStaffFormData.position" placeholder="请选择职位">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editStaffFormData.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editStaffFormData.phone" placeholder="请输入电话" />
        </el-form-item>
        
        <el-form-item label="部门" prop="department">
          <el-input v-model="editStaffFormData.department" placeholder="请输入部门" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch v-model="editStaffFormData.isActive" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelEdit">取消</el-button>
          <el-button type="primary" @click="handleSaveStaff">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 设置投票活动弹窗 -->
    <el-dialog v-model="voteActivityDialogVisible" title="设置投票活动" width="600px">
      <el-form ref="voteActivityForm" :model="voteActivityFormData" label-width="120px">
        <el-form-item label="参与投票活动">
          <el-checkbox-group v-model="voteActivityFormData.activeVotes">
            <el-checkbox v-for="vote in availableVotes" :key="vote.id" :label="vote.id">
              {{ vote.title }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input v-model="voteActivityFormData.description" type="textarea" placeholder="请输入描述" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelVoteActivity">取消</el-button>
          <el-button type="primary" @click="handleSaveVoteActivity">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

// 搜索查询
const searchQuery = ref('')
// 职位筛选
const positionFilter = ref('')
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)

// 模拟教职员工数据
const staff = ref([
  {
    id: 1001,
    username: 'zhang_wei',
    password: 'encrypted_123', // 实际项目中应为加密存储
    position: '教授',
    email: 'zhang_wei@example.com',
    phone: '13800138001',
    department: '计算机科学与技术学院',
    isActive: true,
    activeVotes: [1, 3], // 参与的投票活动ID
    createdAt: '2022-01-10'
  },
  {
    id: 1002,
    username: 'li_ming',
    password: 'encrypted_456',
    position: '副教授',
    email: 'li_ming@example.com',
    phone: '13800138002',
    department: '电子工程学院',
    isActive: true,
    activeVotes: [1, 2],
    createdAt: '2022-02-15'
  },
  {
    id: 1003,
    username: 'wang_hong',
    password: 'encrypted_789',
    position: '讲师',
    email: 'wang_hong@example.com',
    phone: '13800138003',
    department: '数学学院',
    isActive: true,
    activeVotes: [2, 3],
    createdAt: '2022-03-20'
  },
  {
    id: 1004,
    username: 'zhao_yang',
    password: 'encrypted_101',
    position: '助教',
    email: 'zhao_yang@example.com',
    phone: '13800138004',
    department: '物理学院',
    isActive: false,
    activeVotes: [],
    createdAt: '2022-04-25'
  }
])

// 可用的投票活动（模拟数据）
const availableVotes = ref([
  { id: 1, title: '2023年度优秀教师评选' },
  { id: 2, title: '2023年度教学成果评选' },
  { id: 3, title: '2024年教学计划建议' }
])

// 编辑对话框显示状态
const editDialogVisible = ref(false)
const voteActivityDialogVisible = ref(false)

// 编辑表单数据
const editStaffForm = ref(null)
const editStaffFormData = reactive({
  id: '',
  username: '',
  password: '',
  position: '',
  email: '',
  phone: '',
  department: '',
  isActive: true
})

// 投票活动表单数据
const voteActivityForm = ref(null)
const voteActivityFormData = reactive({
  staffId: '',
  activeVotes: [],
  description: ''
})

// 过滤后的教职员工列表
const filteredStaff = computed(() => {
  return staff.value.filter(s => {
    // 搜索过滤
    const matchesSearch = s.username.includes(searchQuery.value) || 
                         s.id.toString().includes(searchQuery.value)
    // 职位过滤
    const matchesPosition = !positionFilter.value || s.position === positionFilter.value
    
    return matchesSearch && matchesPosition
  })
})

// 处理添加教职员工
const handleAddStaff = () => {
  // 清空表单数据
  Object.assign(editStaffFormData, {
    id: '',
    username: '',
    password: '123456', // 默认密码
    position: '',
    email: '',
    phone: '',
    department: '',
    isActive: true
  })
  
  editDialogVisible.value = true
}

// 处理编辑教职员工
const handleEditStaff = (staffItem) => {
  Object.assign(editStaffFormData, {
    id: staffItem.id,
    username: staffItem.username,
    password: '', // 编辑时不显示密码
    position: staffItem.position,
    email: staffItem.email,
    phone: staffItem.phone,
    department: staffItem.department,
    isActive: staffItem.isActive
  })
  
  editDialogVisible.value = true
}

// 处理保存教职员工
const handleSaveStaff = () => {
  // 验证表单
  if (editStaffForm.value) {
    editStaffForm.value.validate((valid) => {
      if (valid) {
        // 模拟保存操作
        setTimeout(() => {
          if (editStaffFormData.id) {
            // 编辑现有教职员工
            const index = staff.value.findIndex(s => s.id === editStaffFormData.id)
            if (index !== -1) {
              staff.value[index] = {
                ...staff.value[index],
                username: editStaffFormData.username,
                position: editStaffFormData.position,
                email: editStaffFormData.email,
                phone: editStaffFormData.phone,
                department: editStaffFormData.department,
                isActive: editStaffFormData.isActive
              }
              ElMessage.success('教职员工信息更新成功')
            }
          } else {
            // 添加新教职员工
            const newStaff = {
              id: Date.now() % 10000 + 1000, // 生成1000-9999之间的ID
              username: editStaffFormData.username,
              password: 'encrypted_' + editStaffFormData.password, // 模拟加密
              position: editStaffFormData.position,
              email: editStaffFormData.email,
              phone: editStaffFormData.phone,
              department: editStaffFormData.department,
              isActive: editStaffFormData.isActive,
              activeVotes: [],
              createdAt: new Date().toLocaleDateString('zh-CN')
            }
            staff.value.push(newStaff)
            ElMessage.success('教职员工添加成功')
          }
          
          editDialogVisible.value = false
        }, 500)
      }
    })
  }
}

// 处理取消编辑
const handleCancelEdit = () => {
  editDialogVisible.value = false
}

// 处理切换状态
const handleToggleStatus = (staffItem) => {
  // 模拟更新操作
  setTimeout(() => {
    ElMessage.success(`教职员工${staffItem.isActive ? '已启用' : '已禁用'}`)
  }, 300)
}

// 处理重置密码
const handleResetPassword = (staffItem) => {
  ElMessageBox.confirm(`确定要重置${staffItem.username}的密码吗？`, '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟重置密码操作
    setTimeout(() => {
      ElMessage.success(`已将${staffItem.username}的密码重置为默认密码`)
    }, 300)
  }).catch(() => {
    // 取消重置
  })
}

// 处理设置投票活动
const handleSetVoteActivity = (staffItem) => {
  Object.assign(voteActivityFormData, {
    staffId: staffItem.id,
    activeVotes: staffItem.activeVotes || [],
    description: ''
  })
  
  voteActivityDialogVisible.value = true
}

// 处理保存投票活动设置
const handleSaveVoteActivity = () => {
  // 模拟保存操作
  setTimeout(() => {
    const index = staff.value.findIndex(s => s.id === voteActivityFormData.staffId)
    if (index !== -1) {
      staff.value[index].activeVotes = voteActivityFormData.activeVotes
      ElMessage.success('投票活动设置成功')
    }
    
    voteActivityDialogVisible.value = false
  }, 500)
}

// 处理取消投票活动设置
const handleCancelVoteActivity = () => {
  voteActivityDialogVisible.value = false
}

// 处理删除教职员工
const handleDeleteStaff = (id) => {
  ElMessageBox.confirm('确定要删除该教职员工吗？删除后无法恢复。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    // 模拟删除操作
    setTimeout(() => {
      const index = staff.value.findIndex(s => s.id === id)
      if (index !== -1) {
        staff.value.splice(index, 1)
        ElMessage.success('教职员工删除成功')
      }
    }, 300)
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.staff-list-container {
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
</style>