<template>
  <div class="guest-msg-container">
    <h2 class="title">客座教授引进意见投票信息统计</h2>

    <div class="filter-container">
      <el-form :inline="true">
        <!-- 当前活动名称显示 -->
        <el-form-item>
          <div class="current-activity-name">{{ currentActivityName || '未选择活动' }}</div>
        </el-form-item>
        <!-- 活动筛选 -->
        <el-form-item label="选择活动：">
          <el-select
            v-model="selectedActivityId"
            placeholder="请选择活动"
            style="width: 200px"
            @change="handleActivityChange"
          >
            <el-option
              v-for="activity in activities"
              :key="activity.activityId"
              :label="activity.activityName"
              :value="activity.activityId"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 投票数据表格 -->
    <div class="data-container">
      <el-table
        :data="processedVoteData"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="rank" label="排名" width="60">
          <template #default="scope">
            <div class="rank-number">{{ scope.row.rank }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="候选人姓名" width="120" />
        <el-table-column prop="voteNum" label="获得票数" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.voteNum }}</div>
          </template>
        </el-table-column>
        <el-table-column label="支持率" width="200">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.supportRate"
              :color="progressColors[Math.floor(Math.random() * progressColors.length)]"
              :format="(percentage) => `${percentage}%`"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 无数据提示 -->
      <div
        v-if="!loading && processedVoteData.length === 0"
        class="empty-container"
      >
        <div class="no-vote">暂无投票数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getTbEmp2VoteShows } from '@/api/voteShow'
import { getActivityEmp2s } from '@/api/activityEmp2.js'
import { getAllEmp2 } from '@/api/tbEmp2'

// 状态管理
const loading = ref(false)
const voteData = ref({})
const activities = ref([])
const selectedActivityId = ref(1) // 默认选中活动ID 1
const currentActivityName = ref('')
const tbEmp2List = ref([])
const tbEmp2Map = ref({}) // ID到姓名的映射

// 进度条颜色
const progressColors = [
  "#f56c6c",
  "#e6a23c",
  "#5cb87a",
  "#1989fa",
  "#6f7ad3",
  "#909399",
];

// 处理投票数据，转换为表格所需格式
const processedVoteData = computed(() => {
  const result = []
  // 添加数据日志用于调试
  console.log('voteData:', voteData.value);
  console.log('tbEmp2Map:', tbEmp2Map.value);
  
  // 处理API返回的标准格式数据
  let idList = [];
  let voteNumList = [];
  
  // 检查是否存在empList和voteNumList字段（客座教授API格式）
  if (voteData.value && voteData.value.empList && voteData.value.voteNumList) {
    idList = voteData.value.empList || [];
    voteNumList = voteData.value.voteNumList || [];
  }
  
  // 确保两个数组都有效且长度相同
  if (Array.isArray(idList) && Array.isArray(voteNumList) && 
      idList.length === voteNumList.length && idList.length > 0) {
    
    // 组合数据并排序
    const combined = idList.map((id, index) => ({
      id: String(id), // 确保ID是字符串格式以便在映射中查找
      name: tbEmp2Map.value[String(id)] || String(id), // 尝试从映射中获取姓名
      voteNum: Number(voteNumList[index]) || 0 // 确保票数是数字
    }))
    
    // 按票数降序排序
    combined.sort((a, b) => b.voteNum - a.voteNum)
    
    // 计算总票数
    const totalVotes = combined.reduce((sum, item) => sum + (item.voteNum || 0), 0)
    
    // 添加排名和支持率
    result.push(...combined.map((item, index) => ({
      ...item,
      rank: index + 1,
      supportRate: totalVotes > 0 ? Math.round((item.voteNum / totalVotes) * 100) : 0
    })))
  }
  
  return result.filter(item => item && item.name); // 过滤掉无效数据
})

// 加载活动列表
const loadActivities = async () => {
  try {
    loading.value = true;
    const response = await getActivityEmp2s();
    activities.value = Array.isArray(response) ? response : [];
    
    // 根据selectedActivityId找到对应的活动名称
    const defaultActivity = activities.value.find(act => act.activityId === selectedActivityId.value);
    if (defaultActivity) {
      currentActivityName.value = defaultActivity.activityName;
    }
  } catch (error) {
    console.error("加载活动列表失败:", error);
    activities.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载候选人信息列表
const loadTbEmp2List = async () => {
  try {
    const data = await getAllEmp2();
    // 处理标准API响应格式 {code, msg, data}
    const empData = data && data.code === 1 && data.data ? data.data : data;
    
    tbEmp2List.value = Array.isArray(empData) ? empData : [];
    // 创建ID到姓名的映射
    tbEmp2Map.value = {};
    tbEmp2List.value.forEach(item => {
      if (item && item.id !== undefined) {
        tbEmp2Map.value[String(item.id)] = item.name || String(item.id);
      }
    });
    console.log('候选人信息加载成功:', tbEmp2Map.value);
  } catch (error) {
    ElMessage.error('获取候选人信息失败');
    console.error('获取候选人信息失败:', error);
  }
};

// 加载投票数据
const loadVoteData = async (activityId = 1) => {
  if (!activityId) {
    voteData.value = {};
    return;
  }

  try {
    loading.value = true;
    // 确保候选人信息已加载
    if (Object.keys(tbEmp2Map.value).length === 0) {
      await loadTbEmp2List();
    }
    
    const response = await getTbEmp2VoteShows(activityId);
    console.log("获取到的投票数据:", response);
    
    // 处理标准API响应格式 {code, msg, data}
    if (response && response.code === 1 && response.data) {
      voteData.value = response.data || {};
    } else {
      // 兼容其他格式的响应
      voteData.value = response || {};
    }
  } catch (error) {
    console.error("加载投票数据失败:", error);
    voteData.value = {};
    ElMessage.error("获取投票数据失败");
  } finally {
    loading.value = false;
  }
};

// 处理活动选择变化
const handleActivityChange = async (activityId) => {
  selectedActivityId.value = activityId;
  const activity = activities.value.find(act => act.activityId === activityId);
  if (activity) {
    currentActivityName.value = activity.activityName;
  }
  await loadVoteData(activityId);
};

onMounted(async () => {
  // 先加载活动列表
  await loadActivities();
  // 再加载候选人信息
  await loadTbEmp2List();
  // 最后加载默认活动的投票数据
  await loadVoteData(selectedActivityId.value);
});
</script>

<style scoped>
.guest-msg-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.title {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

.filter-container {
  background-color: white;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.data-container {
  background-color: white;
  padding: 16px;
  border-radius: 4px;
}

.rank-number {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
  text-align: center;
}

.score-value1 {
  color: #409eff;
  font-weight: bold;
}

.no-vote {
  color: #909399;
  font-size: 14px;
  text-align: center;
  padding: 40px 0;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.current-activity-name {
  font-weight: bold;
  color: #409eff;
  margin-right: 20px;
}
</style>