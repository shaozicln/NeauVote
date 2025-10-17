<template>
  <div class="guest-msg-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客座教授引进意见投票信息统计</span>
        </div>
      </template>
      
      <div class="content-placeholder">
        <el-empty description="信息统计功能开发中（接口：voteLogEmp2.js）" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 导入接口 - 接口是 voteLogEmp2.js
// import { xxx } from '@/api/voteLogEmp2'

// 信息统计组件（待开发）
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

.content-placeholder {
  padding: 40px 0;
  text-align: center;
}
</style>