<template>
  <div class="senior-msg-container">
    <h2 class="title">投票结果信息统计</h2>

    <div class="filter-container">
      <el-form :inline="true" :model="filterForm">
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

        <!-- 轮次筛选 -->
        <el-form-item label="选择轮次：">
          <el-select
            v-model="selectedRound"
            placeholder="请选择轮次"
            style="width: 150px"
            @change="handleRoundChange"
            :disabled="!selectedActivityId"
          >
            <el-option
              v-for="round in availableRounds"
              :key="round"
              :label="`第${round}轮`"
              :value="round"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 投票数据表格 -->
    <div class="data-container">
      <el-table
        :data="filteredVoteData"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="empName" label="候选人姓名" width="120" />
        <el-table-column prop="totalVotes" label="总票数" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.totalVotes }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="aVotes" label="A票数" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.aVotes }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="bVotes" label="B票数" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.bVotes }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="cVotes" label="C票数" width="120">
          <template #default="scope">
            <div class="score-value1">{{ scope.row.cVotes }}</div>
          </template>
        </el-table-column>
        <el-table-column label="进度条" width="200">
          <template #default="scope">
            <el-progress
              :percentage="calculatePercentage(scope.row.totalVotes)"
              :color="
                progressColors[
                  Math.floor(Math.random() * progressColors.length)
                ]
              "
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 无数据提示 -->
      <div
        v-if="!loading && filteredVoteData.length === 0"
        class="empty-container"
      >
        <div class="no-vote">暂无投票数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { getActivities } from "@/api/activities";
import { getEmpVoteShows } from "@/api/voteShow";

// 响应式数据
const activities = ref([]);
const voteData = ref([]);
const selectedActivityId = ref("");
const selectedRound = ref("");
const loading = ref(false);
const filterForm = reactive({});

// 获取当前选中活动的名称
const currentActivityName = computed(() => {
  if (!selectedActivityId.value) return '';
  const activity = activities.value.find(act => act.activityId === selectedActivityId.value);
  return activity ? activity.activityName : '';
});

// 进度条颜色
const progressColors = [
  "#f56c6c",
  "#e6a23c",
  "#5cb87a",
  "#1989fa",
  "#6f7ad3",
  "#909399",
];

// 加载活动列表 - 从getActivities获取全部活动
const loadActivities = async () => {
  try {
    loading.value = true;
    const response = await getActivities();
    activities.value = Array.isArray(response) ? response : [];

    // 默认选择第一个活动
    if (activities.value.length > 0) {
      selectedActivityId.value = activities.value[0].activityId;
      await loadVoteData(selectedActivityId.value);
    }
  } catch (error) {
    console.error("加载活动列表失败:", error);
    activities.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载投票数据 - 根据选择的activityId调用/voteShows/emp/{activityId}
const loadVoteData = async (activityId) => {
  if (!activityId) {
    voteData.value = [];
    selectedRound.value = "";
    return;
  }

  try {
    loading.value = true;
    const response = await getEmpVoteShows(activityId);
    console.log("获取到的投票数据:", response);
    console.log("activityId", activityId);

    // 处理API返回的标准格式 {code, msg, data}
    voteData.value = response || [];
    console.log("获取到的投票数据:", voteData.value);

    // 重置轮次选择
    selectedRound.value = "";
  } catch (error) {
    console.error("加载投票数据失败:", error);
    voteData.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理活动变更
const handleActivityChange = async (activityId) => {
  await loadVoteData(activityId);
};

// 处理轮次变更
const handleRoundChange = () => {
  console.log("选择的轮次:", selectedRound.value);
  // 轮次筛选逻辑通过计算属性实现
};

// 计算当前活动下可用的所有轮次 - 通过当前activityId返回的数据中的所有voteRound种类
const availableRounds = computed(() => {
  if (!voteData.value || voteData.value.length === 0) {
    return [];
  }

  // 收集所有不同的轮次 - 处理嵌套对象数组格式
  const roundSet = new Set();
  voteData.value.forEach((item) => {
    // item是形如 {"候选人姓名": [{voteRound: 1, ...}, ...]} 的对象
    for (const empName in item) {
      const voteInfoArray = item[empName];
      if (Array.isArray(voteInfoArray)) {
        voteInfoArray.forEach((voteInfo) => {
          if (
            voteInfo &&
            voteInfo.voteRound !== undefined &&
            !isNaN(voteInfo.voteRound)
          ) {
            roundSet.add(Number(voteInfo.voteRound));
          }
        });
      }
    }
  });

  // 转换为数组并排序
  return Array.from(roundSet).sort((a, b) => a - b);
});

// 根据选择的轮次筛选投票数据 - 点击轮次只出现对应轮次的投票数据
const filteredVoteData = computed(() => {
  if (!voteData.value || voteData.value.length === 0) {
    return [];
  }

  const selectedRoundNum =
    selectedRound.value !== "" &&
    selectedRound.value !== null &&
    selectedRound.value !== undefined
      ? Number(selectedRound.value)
      : null;

  // 处理嵌套对象数组格式，显示所有候选人（即使票数为0）
  const result = [];

  voteData.value.forEach((item) => {
    // item是形如 {"候选人姓名": [{voteRound: 1, ...}, ...]} 的对象
    for (const empName in item) {
      const voteInfoArray = item[empName];
      let totalVotes = 0;
      let aVotes = 0;
      let bVotes = 0;
      let cVotes = 0;

      if (Array.isArray(voteInfoArray)) {
        if (selectedRoundNum !== null) {
          // 筛选指定轮次的数据
          const filteredVotes = voteInfoArray.filter(
            (vote) => Number(vote.voteRound) === selectedRoundNum
          );
          // 计算该轮次的总票数
          totalVotes = filteredVotes.reduce(
            (sum, vote) => sum + (Number(vote.totalVotes) || 0),
            0
          );
          aVotes = filteredVotes.reduce(
            (sum, vote) => sum + (Number(vote.aVotes) || 0),
            0
          );
          bVotes = filteredVotes.reduce(
            (sum, vote) => sum + (Number(vote.bVotes) || 0),
            0
          );
          cVotes = filteredVotes.reduce(
            (sum, vote) => sum + (Number(vote.cVotes) || 0),
            0
          );
        } else {
          // 没有选择轮次，计算所有轮次的总票数
          totalVotes = voteInfoArray.reduce(
            (sum, vote) => sum + (Number(vote.totalVotes) || 0),
            0
          );
          aVotes = voteInfoArray.reduce(
            (sum, vote) => sum + (Number(vote.aVotes) || 0),
            0
          );
          bVotes = voteInfoArray.reduce(
            (sum, vote) => sum + (Number(vote.bVotes) || 0),
            0
          );
          cVotes = voteInfoArray.reduce(
            (sum, vote) => sum + (Number(vote.cVotes) || 0),
            0
          );
        }
      }

      // 添加到结果数组 - 无论票数是否为0都显示
      result.push({
        empName: empName,
        empDepartment: "未知部门", // 数据中没有部门信息
        empRank: "未知职位", // 数据中没有职位信息
        totalVotes: totalVotes,
        aVotes: aVotes,
        bVotes: bVotes,
        cVotes: cVotes,
      });
    }
  });
  
  // 按总票数降序排序，如果总票数相同，则A票多的排在前面，若A同按B，若B同按C
  return result.sort((a, b) => {
    if (a.totalVotes === b.totalVotes) {
      if ((b.aVotes || 0) !== (a.aVotes || 0)) {
        return (b.aVotes || 0) - (a.aVotes || 0);
      } else if ((b.bVotes || 0) !== (a.bVotes || 0)) {
        return (b.bVotes || 0) - (a.bVotes || 0);
      } else {
        return (b.cVotes || 0) - (a.cVotes || 0);
      }
    }
    return b.totalVotes - a.totalVotes;
  });
});

// 计算百分比
const calculatePercentage = (votes) => {
  const allVotes = filteredVoteData.value.reduce(
    (sum, item) => sum + (Number(item.totalVotes) || 0),
    0
  );
  if (allVotes === 0) return 0;
  return Math.round((votes / allVotes) * 100);
};

// 组件挂载时加载数据
onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
.senior-msg-container {
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

.filter-form {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.filter-form .el-form-item {
  margin-right: 20px;
  margin-bottom: 0;
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
</style>
