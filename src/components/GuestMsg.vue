<template>
  <div class="guest-msg-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客座教授引进意见投票信息统计</span>
        </div>
      </template>
      
      <div class="loading-container" v-if="loading">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else-if="processedVoteData.length > 0" class="vote-data-container">
        <el-table :data="processedVoteData" style="width: 100%" stripe fit>
          <el-table-column prop="rank" label="排名" min-width="60" type="index">
            <template #default="scope">
              <span class="rank-number">{{ scope.row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="候选人姓名" min-width="120" />
          <el-table-column prop="voteNum" label="获得票数" min-width="100">
            <template #default="scope">
              <div class="vote-count-container">
                <span class="vote-number">{{ scope.row.voteNum }}</span>
                <span class="vote-unit">票</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="支持率" min-width="200">
            <template #default="scope">
              <div class="progress-container">
                <el-progress 
                  :percentage="scope.row.supportRate" 
                  :color="getProgressColor(scope.row.voteNum)"
                  :format="(percentage) => `${percentage}%`"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div v-else class="empty-container">
        <el-empty description="暂无投票数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getTbEmp2VoteShows } from '@/api/voteShow'

// 状态管理
const loading = ref(false)
const voteData = ref({})
const totalVotes = ref(0)

// 处理投票数据，转换为表格所需格式
const processedVoteData = computed(() => {
  const result = []
  const { nameList = [], voteNumList = [] } = voteData.value
  
  // 计算总票数
  totalVotes.value = voteNumList.reduce((sum, num) => sum + num, 0)
  
  // 组合数据并排序
  if (nameList.length === voteNumList.length) {
    const combined = nameList.map((name, index) => ({
      name,
      voteNum: voteNumList[index] || 0
    }))
    
    // 按票数降序排序
    combined.sort((a, b) => b.voteNum - a.voteNum)
    
    // 添加排名和支持率
    result.push(...combined.map((item, index) => ({
      ...item,
      rank: index + 1,
      supportRate: totalVotes.value > 0 ? Math.round((item.voteNum / totalVotes.value) * 100) : 0
    })))
  }
  
  return result
})

// 根据票数获取进度条颜色
const getProgressColor = (voteNum) => {
  if (voteNum === 0) return '#909399'
  if (voteNum > 10) return '#67c23a' // 高票数绿色
  if (voteNum > 5) return '#409eff'  // 中等票数蓝色
  return '#e6a23c'                    // 低票数橙色
}

// 加载投票数据
const loadVoteData = async () => {
  loading.value = true
  try {
    const data = await getTbEmp2VoteShows()
    voteData.value = data || {}
    console.log('加载投票数据成功:', data)
  } catch (error) {
    ElMessage.error('获取投票数据失败')
    console.error('获取投票数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadVoteData()
})
</script>

<style scoped>
.guest-msg-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  padding: 20px 0;
}

.vote-data-container {
  padding: 10px 0;
}

.rank-number {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.vote-count-container {
  text-align: left;
}

.vote-number {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

.vote-unit {
  font-size: 14px;
  color: #606266;
  margin-left: 2px;
}

.progress-container {
  padding: 0 20px;
}

.empty-container {
  padding: 40px 0;
  text-align: center;
}
</style>