<template>
  <div class="admin-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar-container bg-white shadow-md">
      
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
      >
        <el-sub-menu index="1">
          <template #title>
            <span>用户管理</span>
          </template>
          <el-menu-item index="1-1">个人信息</el-menu-item>
          <el-menu-item index="1-2">用户列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <span>正高级职称投票</span>
          </template>
          <el-menu-item index="2-1">投票管理</el-menu-item>
          <el-menu-item index="2-2">信息统计</el-menu-item>
          <el-menu-item index="2-3">候选人管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <span>拟引进优秀人才投票</span>
          </template>
          <el-menu-item index="3-1">投票管理</el-menu-item>
          <el-menu-item index="3-2">信息统计</el-menu-item>
          <el-menu-item index="3-3">候选人管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <span>客座教授引进意见投票</span>
          </template>
          <el-menu-item index="4-1">投票管理</el-menu-item>
          <el-menu-item index="4-2">信息统计</el-menu-item>
          <el-menu-item index="4-3">候选人管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <div class="main-content flex-1 flex flex-col">
      <el-main class="main p-6 overflow-auto">
        <!-- 内容根据选择的菜单动态加载 -->
        <component :is="currentComponent" />
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/store/authStore.js";

// 导入各功能模块组件
import UserInfo from "@/components/UserInfo.vue";
import UserList from "@/components/UserList.vue";
import SeniorVoteManagement from "@/components/SeniorVoteManagement.vue";
import TalentVoteManagement from "@/components/TalentVoteManagement.vue";
import GuestProfessorVoteManagement from "@/components/GuestProfessorVoteManagement.vue";
import SeniorStaffList from "@/components/SeniorStaffList.vue";
import TalentStaffList from "@/components/TalentStaffList.vue";
import GuestStaffList from "@/components/GuestStaffList.vue";
import SeniorMsg from "@/components/SeniorMsg.vue";
import TalentMsg from "@/components/TalentMsg.vue";
import GuestMsg from "@/components/GuestMsg.vue";
import ActivityConfig from "@/components/ActivityConfig.vue";

const router = useRouter();
const authStore = useAuthStore();

// 当前激活的菜单
const activeMenu = ref("1-1");
// 当前显示的组件
const currentComponent = ref(UserInfo);
// 用户名
const username = computed(() => authStore.username || "管理员");

// 处理菜单选择
const handleMenuSelect = (index) => {
  activeMenu.value = index;
  switch (index) {
    case "1-1":
      currentComponent.value = UserInfo;
      break;
    case "1-2":
      currentComponent.value = UserList;
      break;
    case "2-1":
      currentComponent.value = SeniorVoteManagement;
      break;
    case "2-2":
      currentComponent.value = SeniorMsg;
      break;
    case "2-3":
      currentComponent.value = SeniorStaffList;
      break;
    case "3-1":
      currentComponent.value = TalentVoteManagement;
      break;
    case "3-2":
      currentComponent.value = TalentMsg;
      break;
    case "3-3":
      currentComponent.value = TalentStaffList;
      break;
    case "4-1":
      currentComponent.value = GuestProfessorVoteManagement;
      break;
    case "4-2":
      currentComponent.value = GuestMsg;
      break;
    case "4-3":
      currentComponent.value = GuestStaffList;
      break;
    default:
      currentComponent.value = UserInfo;
  }
};

// 初始化
onMounted(() => {
  // 检查是否登录
  if (!authStore.token) {
    router.push("/login");
  }
  
  // 监听自定义菜单切换事件
  window.addEventListener('menu-select', (event) => {
    const menuIndex = event.detail;
    handleMenuSelect(menuIndex);
  });
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('menu-select', (event) => {
    const menuIndex = event.detail;
    handleMenuSelect(menuIndex);
  });
});
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar-container {
  height: 100%;
}

.main-content {
  height: 100%;
}



.main {
  flex: 1;
  background-color: #f5f7fa;
}

.logo-container {
  background-color: #f8f9fa;
}

/* 调整菜单样式以匹配vue-element-admin风格 */
.el-menu {
  border-right: none;
}

.el-menu-item {
  padding-left: 45px !important;
}

.el-sub-menu__title {
  padding-left: 45px !important;
}
</style>
