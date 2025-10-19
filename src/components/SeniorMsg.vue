<template>
  <div class="senior-msg-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>正高级职称投票信息统计</span>
        </div>
      </template>
      
      <div class="loading-container" v-if="loading">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else-if="voteData.length > 0" class="vote-data-container">
        <el-table :data="processedVoteData" style="width: 100%" stripe fit>
          <el-table-column prop="name" label="候选人姓名" min-width="120" />
          <!-- 动态生成轮次列，轮次高的在左边 -->
          <template v-for="round in sortedRounds" :key="round">
            <el-table-column :label="`第${round}轮`" min-width="150">
              <template #default="scope">
                <div v-if="scope.row.roundVotes[round]" class="round-data">
                  <div><span class="vote-count1">总票:</span> <span class="vote-count">{{ scope.row.roundVotes[round].totalVotes }}</span> 票</div>
                  <div><span class="score-value1"> A票:</span> <span class="score-value">{{ scope.row.roundVotes[round].aVotes }}</span> 票</div>
                </div>
                <div v-else class="no-vote">-</div>
              </template>
            </el-table-column>
          </template>
          <el-table-column label="总票数" min-width="80">
            <template #default="scope">
                <span class="vote-count">{{ scope.row.totalVotes }}</span>
              </template>
          </el-table-column>
          <el-table-column label="总A票数" min-width="80">
            <template #default="scope">
                <span class="score-value">{{ scope.row.totalAVotes }}</span>
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
import { getEmpVoteShows } from '@/api/voteShow'

// 状态管理
const loading = ref(false)
const voteData = ref([])

// 获取所有轮次并按照从高到低排序
const sortedRounds = computed(() => {
  const rounds = new Set()
  voteData.value.forEach(item => {
    const name = Object.keys(item)[0]
    const voteInfo = item[name] || []
    voteInfo.forEach(vote => {
      rounds.add(vote.voteRound)
    })
  })
  return Array.from(rounds).sort((a, b) => b - a)
})

// 处理投票数据，转换为表格所需格式
const processedVoteData = computed(() => {
  return voteData.value.map(item => {
    const name = Object.keys(item)[0]
    const voteInfo = item[name] || []
    
    // 计算总票数和总A票数
    const totalVotes = voteInfo.reduce((sum, vote) => sum + vote.totalVotes, 0)
    const totalAVotes = voteInfo.reduce((sum, vote) => sum + vote.aVotes, 0)
    
    // 按轮次整理投票数据
    const roundVotes = {}
    voteInfo.forEach(vote => {
      roundVotes[vote.voteRound] = {
        totalVotes: vote.totalVotes,
        aVotes: vote.aVotes
      }
    })
    
    return {
      name,
      roundVotes,
      totalVotes,
      totalAVotes
    }
  })
})

// 加载投票数据
const loadVoteData = async () => {
  loading.value = true
  try {
    const data = await getEmpVoteShows()
    voteData.value = data || []
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
.senior-msg-container {
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

.round-data {
  font-size: 13px;
}

.vote-count {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.vote-count1 {
  font-size: 15px;
  font-weight: bold;
  color: #409eff;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

.score-value1 {
  font-size: 15px;
  font-weight: bold;
  color: #67c23a;
}


.no-vote {
  color: #909399;
  font-style: italic;
}

.empty-container {
  padding: 40px 0;
  text-align: center;
}
</style>