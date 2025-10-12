<template>
  <div class="container mx-auto p-4">
    <!-- 选项卡导航栏 -->
    <div class="mb-8 border-b border-gray-200">
      <div class="flex space-x-8 overflow-x-auto">
        <button
          :class="['pb-4 text-lg font-medium border-b-2 transition-colors duration-200', 
                   activeTab === 'senior' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          @click="activeTab = 'senior'"
        >
          正高级评审
        </button>
        <button
          :class="['pb-4 text-lg font-medium border-b-2 transition-colors duration-200', 
                   activeTab === 'talent' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          @click="activeTab = 'talent'"
        >
          拟引进优秀人才认定
        </button>
        <button
          :class="['pb-4 text-lg font-medium border-b-2 transition-colors duration-200', 
                   activeTab === 'guest' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          @click="activeTab = 'guest'"
        >
          客座教授引进意见
        </button>
      </div>
    </div>

    <!-- 选项卡内容 -->
    <!-- 正高级评审内容 -->
    <div v-if="activeTab === 'senior'">
      <!-- 活动列表：使用卡片展示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 加载状态 -->
        <div v-if="loading" class="col-span-full text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
          <p class="mt-4 text-gray-500">加载活动列表中...</p>
        </div>

        <!-- 无数据状态 -->
        <div v-else-if="activities.length === 0" class="col-span-full text-center py-12">
          <p class="text-gray-500">暂无投票活动</p>
        </div>

        <!-- 投票卡片列表 -->
        <div 
          v-for="activity in activities" 
          :key="activity.activityId"
          @click="goToSeniorVote(activity)"
          :class="['bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-shadow cursor-pointer', 
                  activity.activityStatus === 1 ? 'hover:shadow-md hover:border-blue-300' : 'opacity-70 cursor-not-allowed']"
          :style="{ pointerEvents: activity.activityStatus === 1 ? 'auto' : 'none' }"
        >
          <h3 class="text-xl font-medium text-gray-800 mb-2">{{ activity.activityName }}</h3>
          <div class="text-gray-500 text-sm space-y-1">
            <p>最大投票数：{{ activity.maxVoteNum }}</p>
            <p>投票状态：<span :class="activity.activityStatus === 1 ? 'text-green-600' : 'text-gray-400'">
              {{ activity.activityStatus === 1 ? '进行中' : '已结束' }}
            </span></p>
            <p>最大可选数：{{ activity.maxSelectNum }}</p>
          </div>
          <div v-if="activity.activityStatus === 1" class="mt-4 text-sm text-blue-600">
            点击进入投票 →
          </div>
        </div>
      </div>
    </div>

    <!-- 拟引进优秀人才认定内容 -->
    <div v-else-if="activeTab === 'talent'">
      <!-- 活动列表：使用卡片展示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 加载状态 -->
        <div v-if="loadingEmp1" class="col-span-full text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
          <p class="mt-4 text-gray-500">加载活动列表中...</p>
        </div>

        <!-- 无数据状态 -->
        <div v-else-if="activitiesEmp1.length === 0" class="col-span-full text-center py-12">
          <p class="text-gray-500">暂无投票活动</p>
        </div>

        <!-- 投票卡片列表 -->
        <div 
          v-for="activity in activitiesEmp1" 
          :key="activity.activityId"
          @click="goToTalentVote(activity)"
          :class="['bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-shadow cursor-pointer', 
                  activity.activityStatus === 1 ? 'hover:shadow-md hover:border-blue-300' : 'opacity-70 cursor-not-allowed']"
          :style="{ pointerEvents: activity.activityStatus === 1 ? 'auto' : 'none' }"
        >
          <h3 class="text-xl font-medium text-gray-800 mb-2">{{ activity.activityName }}</h3>
          <div class="text-gray-500 text-sm space-y-1">
            <p>最大投票数：{{ activity.maxVoteNum }}</p>
            <p>投票状态：<span :class="activity.activityStatus === 1 ? 'text-green-600' : 'text-gray-400'">
              {{ activity.activityStatus === 1 ? '进行中' : '已结束' }}
            </span></p>
            <p>最大可选数：{{ activity.maxSelectNum }}</p>
          </div>
          <div v-if="activity.activityStatus === 1" class="mt-4 text-sm text-blue-600">
            点击进入投票 →
          </div>
        </div>
      </div>
    </div>

    <!-- 客座教授引进意见内容 -->
    <div v-else-if="activeTab === 'guest'">
      <!-- 活动列表：使用卡片展示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 加载状态 -->
        <div v-if="loadingEmp2" class="col-span-full text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
          <p class="mt-4 text-gray-500">加载活动列表中...</p>
        </div>

        <!-- 无数据状态 -->
        <div v-else-if="activitiesEmp2.length === 0" class="col-span-full text-center py-12">
          <p class="text-gray-500">暂无投票活动</p>
        </div>

        <!-- 投票卡片列表 -->
        <div 
          v-for="activity in activitiesEmp2" 
          :key="activity.activityId"
          @click="goToGuestProfessorVote(activity)"
          :class="['bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-shadow cursor-pointer', 
                  activity.activityStatus === 1 ? 'hover:shadow-md hover:border-blue-300' : 'opacity-70 cursor-not-allowed']"
          :style="{ pointerEvents: activity.activityStatus === 1 ? 'auto' : 'none' }"
        >
          <h3 class="text-xl font-medium text-gray-800 mb-2">{{ activity.activityName }}</h3>
          <div class="text-gray-500 text-sm space-y-1">
            <p>最大投票数：{{ activity.maxVoteNum }}</p>
            <p>投票状态：<span :class="activity.activityStatus === 1 ? 'text-green-600' : 'text-gray-400'">
              {{ activity.activityStatus === 1 ? '进行中' : '已结束' }}
            </span></p>
            <p>最大可选数：{{ activity.maxSelectNum }}</p>
          </div>
          <div v-if="activity.activityStatus === 1" class="mt-4 text-sm text-blue-600">
            点击进入投票 →
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getActivities } from '@/api/activities'
import { getActivityEmp1s } from '@/api/activityEmp1'
import { getActivityEmp2s } from '@/api/activityEmp2'
import { ElMessage } from 'element-plus'

const activities = ref([])
const activitiesEmp1 = ref([])
const activitiesEmp2 = ref([])
const loading = ref(true)
const loadingEmp1 = ref(true)
const loadingEmp2 = ref(true)
const router = useRouter()
// 当前激活的选项卡，默认为正高级评审
const activeTab = ref('senior')

onMounted(async () => {
  // 检查是否有上次访问的活动信息
  const lastVisitedActivity = localStorage.getItem('lastVisitedActivity')
  if (lastVisitedActivity) {
    try {
      const activityInfo = JSON.parse(lastVisitedActivity)
      // 设置为上次访问的选项卡
      if (['senior', 'talent', 'guest'].includes(activityInfo.type)) {
        activeTab.value = activityInfo.type
      }
    } catch (error) {
      console.error('解析上次访问的活动信息失败：', error)
    }
    // 清除临时存储的活动信息
    localStorage.removeItem('lastVisitedActivity')
  }
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 并行获取所有三种类型的活动数据
  try {
    // 正高级评审数据
    const fetchActivities = async () => {
      try {
        loading.value = true
        const data = await getActivities()
        activities.value = data
      } catch (error) {
        console.error('获取正高级评审活动列表失败：', error.message)
        ElMessage.error('加载正高级评审活动失败，请重试')
      } finally {
        loading.value = false
      }
    }

    // 拟引进优秀人才认定数据
    const fetchActivitiesEmp1 = async () => {
      try {
        loadingEmp1.value = true
        const data = await getActivityEmp1s()
        activitiesEmp1.value = data
      } catch (error) {
        console.error('获取拟引进优秀人才认定活动列表失败：', error.message)
        ElMessage.error('加载拟引进优秀人才认定活动失败，请重试')
      } finally {
        loadingEmp1.value = false
      }
    }

    // 客座教授引进意见数据
    const fetchActivitiesEmp2 = async () => {
      try {
        loadingEmp2.value = true
        const data = await getActivityEmp2s()
        activitiesEmp2.value = data
      } catch (error) {
        console.error('获取客座教授引进意见活动列表失败：', error.message)
        ElMessage.error('加载客座教授引进意见活动失败，请重试')
      } finally {
        loadingEmp2.value = false
      }
    }

    // 并行执行三个数据获取操作
await Promise.all([
  fetchActivities(),
  fetchActivitiesEmp1(),
  fetchActivitiesEmp2()
])
  } catch (error) {
    console.error('获取活动数据时发生错误：', error)
    ElMessage.error('加载活动数据失败')
  }
})

// 跳转到正高级评审投票详情页
const goToSeniorVote = (activity) => {
  router.push({
    path: '/senior-vote',
    query: {
      activityId: activity.activityId,
      activityName: activity.activityName,
      maxVoteNum: activity.maxVoteNum,
      activityStatus: activity.activityStatus
    }
  })
}

// 跳转到拟引进优秀人才认定投票详情页
const goToTalentVote = (activity) => {
  router.push({
    path: '/talent-vote',
    query: {
      activityId: activity.activityId,
      activityName: activity.activityName,
      maxVoteNum: activity.maxVoteNum,
      activityStatus: activity.activityStatus
    }
  })
}

// 跳转到客座教授引进意见投票详情页
const goToGuestProfessorVote = (activity) => {
  router.push({
    path: '/guest-professor-vote',
    query: {
      activityId: activity.activityId,
      activityName: activity.activityName,
      maxVoteNum: activity.maxVoteNum,
      activityStatus: activity.activityStatus
    }
  })
}
</script>
