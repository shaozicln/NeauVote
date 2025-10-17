<template>
  <div class="container mx-auto p-4 max-w-5xl">
    <!-- 页面标题 -->
    <div class="mb-6">
      <!-- 返回按钮和个人信息 -->
      <div class="mb-4 flex justify-between items-center">
        <button 
          @click="goBack"
          class="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm flex items-center"
        >
          <i class="mr-1">←</i> 返回列表
        </button>
        <!-- 个人信息按钮 - 仅在记名投票时显示 -->
        <button
          v-if="activity.isName === 1"
          @click="userModalVisible = true"
          class="px-4 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center"
        >
          <i class="mr-1">👤</i> 个人信息
        </button>
      </div>
      <h1 class="text-2xl font-bold text-blue-800 text-center">{{ activity.activityName }}</h1>
      <h2 class="text-lg text-blue-600 text-center mt-2">(名额：{{ activity.maxVoteNum }}名)</h2>
      <div class="flex items-center justify-center mt-4 text-gray-500 text-sm">
        <span class="mr-4">投票状态：
          <span :class="activity.activityStatus === 1 ? 'text-green-600' : 'text-gray-400'">
            {{ activity.activityStatus === 1 ? '进行中' : '已结束' }}
          </span>
        </span>
        <span>已选人数：{{ selectedCount }}人</span>
        <span class="ml-4">可投人数：{{ activity.maxVoteNum }}人</span>
      </div>
    </div>

    <!-- 投票说明卡片 - 可折叠 -->
    <div class="mb-6 bg-white shadow-sm rounded-lg overflow-hidden">
      <div 
        class="bg-blue-50 p-4 cursor-pointer" 
        @click="toggleRules"
      >
        <h3 class="font-medium text-blue-800 flex justify-between items-center">
          <span class="flex items-center">
            <i class="mr-2 text-blue-600">📋</i> 投票规则
          </span>
          <i class="transform transition-transform duration-300" :class="rulesVisible ? 'rotate-180' : ''">↓</i>
        </h3>
      </div>
      <div v-if="rulesVisible" class="p-4 bg-blue-50/50">
        <p class="mb-2 text-sm text-gray-700"><i class="text-blue-600 mr-2">➤</i> 请从候选人中选择您认为适合引进的客座教授</p>
        <p class="mb-2 text-sm text-gray-700"><i class="text-blue-600 mr-2">➤</i> 每人最多可选择{{ activity.maxVoteNum }}位候选人</p>
        <p class="text-sm text-gray-700"><i class="text-blue-600 mr-2">➤</i> 投票结果将作为引进决策的重要参考依据</p>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex flex-wrap gap-4 items-end justify-center">
        <div class="flex flex-col flex-1 min-w-[200px]">
          <label for="empName" class="text-sm text-gray-600 mb-1 font-medium">教师姓名</label>
          <input 
            type="text" 
            id="empName" 
            v-model="empName" 
            placeholder="请输入教师姓名" 
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
        </div>
        <div class="flex space-x-3">
          <button 
            @click="handleSearch" 
            class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            查询
          </button>
          <button 
            @click="handleReset" 
            class="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 分页控制 -->
    <div class="mb-4 flex justify-between items-center px-2">
      <div class="flex items-center space-x-2 bg-white px-3 py-2 rounded-md shadow-sm">
        <label for="pageSize" class="text-sm text-gray-600">每页显示：</label>
        <select 
          id="pageSize" 
          v-model="pageSize" 
          @change="handlePageSizeChange" 
          class="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
      
      <div class="text-sm text-blue-700 font-medium">
        共 {{ total }} 位候选人
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-16 bg-white rounded-lg shadow-sm">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
      <p class="text-gray-500 font-medium">加载候选人列表中...</p>
    </div>

    <!-- 教师列表表格 -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">序号</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">姓名</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">职称</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">当前票数</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">评审意见</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(teacher, index) in teachers" :key="teacher.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ teacher.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ teacher.proTitle }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ teacher.voteNum }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex space-x-2 justify-center">
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="getVoteGrade(teacher.id) === '1' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="setVoteGrade(teacher.id, '1')"
                >同意</el-button>
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="getVoteGrade(teacher.id) === '0' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="setVoteGrade(teacher.id, '0')"
                >不同意</el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页导航 -->
    <div class="flex justify-center mt-8 mb-4">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentPageChange"
        background
        popper-class="pagination-popper"
      />
    </div>

    <!-- 投票按钮 -->
    <div class="mt-8 text-center mb-10">
      <button 
        @click="submitVote"
        :disabled="!canVote || selectedCount === 0 || selectedCount > activity.maxVoteNum"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300"
      >
        确认投票
      </button>
    </div>
  </div>
  
  <!-- 个人信息弹窗 -->
  <UserModal 
    v-if="activity.isName === 1"
    v-model:visible="userModalVisible"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPageEmp2 } from '@/api/tbEmp2'
import { addVoteLogEmp2 } from '@/api/voteLogEmp2'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/authStore'
import UserModal from '@/components/user.vue'

const authStore = useAuthStore();

const route = useRoute()
const router = useRouter()
const activityId = route.query.activityId

// 活动信息
const activity = ref({
  activityName: '',
  maxVoteNum: 0,
  activityStatus: 1,
  isName: 0 // 0: 不记名, 1: 记名
})

// 个人信息弹窗
const userModalVisible = ref(false);

// 分页数据
const teachers = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 投票规则可见性
const rulesVisible = ref(true)

// 切换投票规则显示/隐藏
const toggleRules = () => {
  rulesVisible.value = !rulesVisible.value
}

// 查询条件
const empName = ref('')

// 投票数据 - 存储每位教师的投票结果 {teacherId: voteGrade}
const voteGrades = ref({})

// 计算属性：是否可以投票
const canVote = computed(() => {
  return activity.value.activityStatus === 1
})

// 计算属性：已选择的教师数量（已选择了"同意"的教师数量）
const selectedCount = computed(() => {
  return Object.values(voteGrades.value).filter(vote => vote === '1').length
})

// 获取某位教师的投票结果
const getVoteGrade = (teacherId) => {
  return voteGrades.value[teacherId] || ''
}

// 设置某位教师的投票结果
const setVoteGrade = (teacherId, grade) => {
  // 如果选择"同意"，检查是否超过最大可选数量
  if (grade === '1' && selectedCount.value >= activity.value.maxVoteNum && getVoteGrade(teacherId) !== '1') {
    ElMessage.warning(`最多只能选择${activity.value.maxVoteNum}人同意`)
    return
  }
  voteGrades.value[teacherId] = grade
}

// 加载教师列表
const loadTeachers = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      empName: empName.value || ''
    }
    const response = await getPageEmp2(params)
    // 根据实际API响应结构，正确提取数据
    if (response && response.rows) {
      teachers.value = response.rows || []
      total.value = response.total || 0
    } else if (Array.isArray(response)) {
      teachers.value = response
      total.value = response.length
    } else {
      teachers.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载教师列表失败：', error)
    ElMessage.error('加载教师列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  loadTeachers()
}



// 处理页码变化
const handleCurrentPageChange = (val) => {
  currentPage.value = val
  loadTeachers()
}

// 处理每页显示数量变化
const handlePageSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadTeachers()
}

// 处理重置
const handleReset = () => {
  empName.value = ''
  voteGrades.value = {}
  currentPage.value = 1
  loadTeachers()
}

// 提交投票
const submitVote = async () => {
  // 检查是否有已投票项
  const hasVoted = Object.keys(voteGrades.value).length > 0
  
  if (!hasVoted) {
    ElMessage.warning('请至少对一位教师进行投票')
    return
  }
  
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      `确定要提交您的投票结果吗？已选择${selectedCount.value}人同意`,
      '确认投票',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 准备投票数据 - 转换为要求的数据结构
    const voteDataArray = Object.entries(voteGrades.value).map(([empId, voteGrade]) => {
      return {
        userId: parseInt(localStorage.getItem('userId') || ''),
        activityId: parseInt(activityId),
        empId: parseInt(empId),
        voteGrade: parseInt(voteGrade)
      }
    })

    await addVoteLogEmp2(voteDataArray)
    ElMessage.success('投票成功')
    
    // 禁用投票功能
    activity.value.activityStatus = 2
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    console.error('投票失败：', error)
    ElMessage.error('投票失败，请重试')
  }
}

// 返回按钮处理函数
const goBack = () => {
  // 存储当前活动的ID，以便返回首页时定位到正确的选项卡
  localStorage.setItem('lastVisitedActivity', JSON.stringify({
    type: 'guest',
    activityId: activityId
  }))
  router.push('/')
}

defineExpose({
  goBack
})

// 初始化页面
onMounted(() => {
  // 获取活动信息
  activity.value = {
    activityName: route.query.activityName || '客座教授引进意见投票',
    maxVoteNum: parseInt(route.query.maxVoteNum) || 5,
    activityStatus: parseInt(route.query.activityStatus) || 1,
    isName: parseInt(route.query.isName) || 0
  }
  
  // 加载教师列表
  loadTeachers()
  
  
})
</script>
