<template>
  <div class="talent-msg-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>拟引进优秀人才投票信息统计</span>
        </div>
      </template>

      <div class="loading-container" v-if="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else-if="voteData.length > 0" class="vote-data-container">
        <el-table :data="processedVoteData" style="width: 100%" stripe fit>
          <el-table-column prop="name" label="候选人姓名" min-width="120" />
          <el-table-column prop="talentLevelNum" label="人才层次" min-width="120">
            <template #default="scope">
              <div class="stat-item">
                <span class="vote-count">{{ scope.row.talentLevelNum }}</span>
                <span class="vote-unit">票</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="proTitleNum" label="职称聘任" min-width="120">
            <template #default="scope">
              <div class="stat-item">
                <span class="vote-count">{{ scope.row.proTitleNum }}</span>
                <span class="vote-unit">票</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="tutorQualifyNum" label="导师资格" min-width="120">
            <template #default="scope">
              <div class="stat-item">
                <span class="vote-count">{{ scope.row.tutorQualifyNum }}</span>
                <span class="vote-unit">票</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="综合评分" min-width="100">
            <template #default="scope">
              <div class="score-item">
                <span class="score-value">{{ scope.row.totalScore }}</span>
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
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { getTbEmp1VoteShows } from "@/api/voteShow";

// 状态管理
const loading = ref(false);
const voteData = ref([]);

// 处理投票数据，转换为表格所需格式
const processedVoteData = computed(() => {
  return voteData.value.map((item) => {
    const name = Object.keys(item)[0];
    const stats = item[name] || {
      talentLevelNum: 0,
      tutorQualifyNum: 0,
      proTitleNum: 0,
    };

    // 计算综合评分（简单相加）
    const totalScore =
      stats.talentLevelNum + stats.tutorQualifyNum + stats.proTitleNum;

    return {
      name,
      talentLevelNum: stats.talentLevelNum,
      tutorQualifyNum: stats.tutorQualifyNum,
      proTitleNum: stats.proTitleNum,
      totalScore,
    };
  });
});

// 加载投票数据
const loadVoteData = async () => {
  loading.value = true;
  try {
    const data = await getTbEmp1VoteShows();
    voteData.value = data || [];
    console.log("加载投票数据成功:", data);
  } catch (error) {
    ElMessage.error("获取投票数据失败");
    console.error("获取投票数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadVoteData();
});
</script>

<style scoped>
.talent-msg-container {
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

.stat-item {
  text-align: left;
}

.vote-count {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.vote-unit {
  font-size: 14px;
  color: #606266;
  margin-left: 2px;
}

.score-item {
  text-align: left;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

.empty-container {
  padding: 40px 0;
  text-align: center;
}
</style>