<template>
  <div class="user-list-container">
    <el-card>
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-medium">用户管理</span>
          <div class="header-actions">
            <el-button @click="loadUsers" :loading="loading" class="mr-2">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" @click="handleAddUser">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-filter mb-4">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索用户名" 
          style="width: 300px; margin-right: 10px;"
          prefix-icon="Search"
        />
        <el-select 
          v-model="positionFilter" 
          placeholder="筛选职位" 
          style="width: 150px;"
        >
          <el-option label="全部" value="" />
          <el-option label="管理员" value="1" />
          <el-option label="普通用户" value="2" />
        </el-select>
      </div>
      
      <!-- 用户列表 -->
      <el-table :data="filteredUsers" style="width: 100%" :loading="loading">
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="position" label="职位">
          <template #default="scope">
            {{ scope.row.position === 1 ? '管理员' : '普通用户' }}
          </template>
        </el-table-column>
       
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)" class="mr-1">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row.userId)">
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
          :total="filteredUsers.length"
        />
      </div>
    </el-card>
    
    <!-- 编辑用户弹窗 -->
      <el-dialog v-model="editDialogVisible" :title="editUserFormData.userId ? '编辑用户' : '添加用户'" width="500px">
        <el-form ref="editUserForm" :model="editUserFormData" :rules="formRules" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editUserFormData.username" placeholder="请输入用户名" />
          </el-form-item>
          
          <el-form-item label="职位" prop="position">
            <el-select v-model="editUserFormData.position" placeholder="请选择职位">
              <el-option label="管理员" value="1" />
              <el-option label="普通用户" value="2" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input v-model="editUserFormData.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelEdit">取消</el-button>
          <el-button type="primary" @click="handleSaveUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getUsers, addUsers, updateUsers, deleteUsers } from '../api/users'

// 搜索查询
const searchQuery = ref('')
// 职位筛选
const positionFilter = ref('')
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)
// 加载状态
const loading = ref(false)

// 用户数据
const users = ref([])

// 编辑对话框显示状态
const editDialogVisible = ref(false)
// 编辑用户表单数据
const editUserForm = ref(null)
const editUserFormData = reactive({
  userId: '',
  username: '',
  position: '',
  password: ''
})

// 表单验证规则
const formRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  password: [
    { required: value => !editUserFormData.userId, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

// 过滤后的用户列表
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // 搜索过滤
    const matchesSearch = user.username.includes(searchQuery.value)
    // 职位过滤
    const matchesPosition = !positionFilter.value || user.position === Number(positionFilter.value)
    
    return matchesSearch && matchesPosition
  })
})

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await getUsers()
    if (Array.isArray(response)) {
      // API直接返回了用户数组
      users.value = response
      console.log('用户数据加载成功:', users.value)
    } else if (response && response.code === 1 && Array.isArray(response.data)) {
      users.value = response.data
      console.log('用户数据加载成功:', users.value)
    } else {
      users.value = []
      console.warn('API返回格式异常:', response)
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})

// 处理添加用户
const handleAddUser = () => {
  // 清空表单数据
  Object.assign(editUserFormData, {
    userId: '',
    username: '',
    position: '',
    password: ''
  })
  
  editDialogVisible.value = true
}

// 处理编辑用户
const handleEditUser = (user) => {
  Object.assign(editUserFormData, {
    userId: user.userId,
    username: user.username,
    position: String(user.position),
    password: user.password
  })
  
  editDialogVisible.value = true
}

// 处理保存用户
const handleSaveUser = async () => {
  // 验证表单
  if (editUserForm.value) {
    try {
      await editUserForm.value.validate()
      
      loading.value = true
      
      if (editUserFormData.userId) {
        // 编辑现有用户
        const updateData = {
          userId: editUserFormData.userId,
          username: editUserFormData.username,
          position: Number(editUserFormData.position)
        }
        
        // 只有当密码不为空时才包含密码
        if (editUserFormData.password) {
          updateData.password = editUserFormData.password
        }
        
        const updateResponse = await updateUsers(updateData)
        console.log('编辑用户响应:', updateResponse)
        ElMessage.success('用户编辑成功')
      } else {
        // 添加新用户
        const addData = {
          username: editUserFormData.username,
          password: editUserFormData.password,
          position: Number(editUserFormData.position)
        }
        
        const addResponse = await addUsers(addData)
        console.log('添加用户响应:', addResponse)
        ElMessage.success('用户添加成功')
      }
      
      editDialogVisible.value = false
      // 重新加载用户列表
      await loadUsers()
    } catch (error) {
      if (error !== false) { // 排除表单验证失败的情况
        ElMessage.error(editUserFormData.userId ? '编辑用户失败' : '添加用户失败')
        console.error('保存用户失败:', error)
      }
    } finally {
      loading.value = false
    }
  }
}

// 处理取消编辑
const handleCancelEdit = () => {
  editDialogVisible.value = false
}

// 处理删除用户
const handleDeleteUser = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    const deleteResponse = await deleteUsers(userId)
    console.log('删除用户响应:', deleteResponse)
    ElMessage.success('用户删除成功')
    // 重新加载用户列表
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') { // 排除用户取消操作的情况
      ElMessage.error('删除用户失败')
      console.error('删除用户失败:', error)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-list-container {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.form-hint {
  color: #909399;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}

.search-filter {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
}
</style>