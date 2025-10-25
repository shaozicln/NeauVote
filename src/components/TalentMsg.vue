<template>
  <div class="talent-msg-container">
    <h2 class="title">拟引进优秀人才投票信息统计</h2>

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
        <el-table-column prop="name" label="候选人姓名" width="120" />
        <el-table-column prop="talentLevelNum" label="人才层次" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.talentLevelNum }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="proTitleNum" label="职称聘任" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.proTitleNum }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="tutorQualifyNum" label="导师资格" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.tutorQualifyNum }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="综合评分" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.totalScore }}</div>
          </template>
        </el-table-column>
        <el-table-column label="进度条" width="200">
          <template #default="scope">
            <el-progress
              :percentage="calculatePercentage(scope.row.totalScore)"
              :color="progressColors[Math.floor(Math.random() * progressColors.length)]"
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
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { getTbEmp1VoteShows } from "@/api/voteShow";
import { getActivityEmp1s } from "@/api/activityEmp1.js";
import { getAllTbEmp1 } from "@/api/tbEmp1";

// 状态管理
const loading = ref(false);
const voteData = ref([]);
const activities = ref([]);
const selectedActivityId = ref(7); // 默认选中活动ID 7
const currentActivityName = ref('');
const tbEmp1List = ref([]);
const tbEmp1Map = ref({}); // ID到姓名的映射

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
  // 添加数据日志用于调试
  console.log('voteData:', voteData.value);
  console.log('tbEmp1Map:', tbEmp1Map.value);
  
  // 确保voteData是数组
  const dataArray = Array.isArray(voteData.value) ? voteData.value : [];
  
  const result = dataArray.map((item) => {
    // 处理 {id: {stats}} 的形式
    const id = Object.keys(item)[0];
    if (!id) return null;
    
    // 尝试从映射中获取姓名，如果没有则使用ID
    const name = tbEmp1Map.value[id] || id;
    
    const stats = item[id] || {
      talentLevelNum: 0,
      tutorQualifyNum: 0,
      proTitleNum: 0,
    };

    // 计算综合评分（简单相加）
    const totalScore = 
      (stats.talentLevelNum || 0) + (stats.tutorQualifyNum || 0) + (stats.proTitleNum || 0);

    return {
      name,
      talentLevelNum: stats.talentLevelNum || 0,
      tutorQualifyNum: stats.tutorQualifyNum || 0,
      proTitleNum: stats.proTitleNum || 0,
      totalScore,
    };
  }).filter(item => item && item.name); // 过滤掉无效数据
  
  // 按综合评分降序排序
  return result.sort((a, b) => b.totalScore - a.totalScore);
});

// 计算百分比
const calculatePercentage = (score) => {
  if (processedVoteData.value.length === 0) return 0;
  const maxScore = Math.max(...processedVoteData.value.map(item => item.totalScore));
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

// 加载活动列表
const loadActivities = async () => {
  try {
    loading.value = true;
    const response = await getActivityEmp1s();
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
const loadTbEmp1List = async () => {
  try {
    const data = await getAllTbEmp1();
    // 处理标准API响应格式 {code, msg, data}
    const empData = data && data.code === 1 && data.data ? data.data : data;
    
    tbEmp1List.value = Array.isArray(empData) ? empData : [];
    // 创建ID到姓名的映射
    tbEmp1Map.value = {};
    tbEmp1List.value.forEach(item => {
      if (item && item.id !== undefined) {
        tbEmp1Map.value[item.id] = item.name || String(item.id);
      }
    });
    console.log('候选人信息加载成功:', tbEmp1Map.value);
  } catch (error) {
    ElMessage.error('获取候选人信息失败');
    console.error('获取候选人信息失败:', error);
  }
};

// 加载投票数据
const loadVoteData = async (activityId = 7) => {
  if (!activityId) {
    voteData.value = [];
    return;
  }

  try {
    loading.value = true;
    // 确保候选人信息已加载
    if (Object.keys(tbEmp1Map.value).length === 0) {
      await loadTbEmp1List();
    }
    
    const response = await getTbEmp1VoteShows(activityId);
    console.log("获取到的投票数据:", response);
    
    // 处理标准API响应格式 {code, msg, data}
    if (response && response.code === 1 && response.data) {
      voteData.value = response.data || [];
    } else {
      // 兼容其他格式的响应
      voteData.value = Array.isArray(response) ? response : [];
    }
  } catch (error) {
    console.error("加载投票数据失败:", error);
    voteData.value = [];
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
  await loadTbEmp1List();
  // 最后加载默认活动的投票数据
  await loadVoteData(selectedActivityId.value);
});
</script>

<style scoped>
.talent-msg-container {
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