
<template>
  <div class="flex h-screen overflow-hidden relative">
    <!-- 侧边栏 -->
    <el-aside 
      :width="isSidebarOpen ? '200px' : '50px'" 
      class="h-full z-10 flex flex-col overflow-visible relative bg-white shadow-md transition-all duration-300 ease-in-out"
    >
      
      <!-- 折叠状态下的侧边栏展开按钮 -->
      <div 
        style="position: absolute; top: 40px; right: -15px; z-index: 2000; background-color: white; border: 1px solid #dcdfe6; width: 30px; height: 30px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; background-color: #f0f2f5; transition: all 0.3s ease;"
        @mouseenter="e => e.target.style.backgroundColor = '#e6f3ff'"
        @mouseleave="e => e.target.style.backgroundColor = '#f0f2f5'"
        @click="toggleSidebar"
        v-if="!isSidebarOpen"
      >
        <el-icon style="color: #409eff; font-size: 16px;">
          <ArrowRight />
        </el-icon>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="border-r-0 h-full mt-0"
        :class="{ 'pt-9': !isSidebarOpen }"
        @select="handleMenuSelect"
        :collapse="!isSidebarOpen"
        :collapse-transition="true"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><User /></el-icon>
            <span v-if="isSidebarOpen">用户管理</span>
          </template>
          <el-menu-item index="1-1">个人信息</el-menu-item>
          <el-menu-item index="1-2">用户列表</el-menu-item>
        </el-sub-menu>
        
        <!-- 侧边栏切换按钮 - 展开状态 -->
        <div 
          class="absolute right-5 top-5 z-15 w-[28px] h-[28px] rounded-md flex justify-center items-center cursor-pointer bg-gray-100 hover:bg-blue-50 transition-all duration-300"
          @click.stop="toggleSidebar"
          v-if="isSidebarOpen"
        >
          <el-icon class="text-[#409eff] text-[16px]">
            <ArrowLeft />
          </el-icon>
        </div>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Rank /></el-icon>
            <span v-if="isSidebarOpen">正/副高级职称投票</span>
          </template>
          <el-menu-item index="2-1">投票管理</el-menu-item>
          <el-menu-item index="2-2">信息统计</el-menu-item>
          <el-menu-item index="2-3">候选人管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Star /></el-icon>
            <span v-if="isSidebarOpen">拟引进优秀人才</span>
          </template>
          <el-menu-item index="3-1">投票管理</el-menu-item>
          <el-menu-item index="3-2">信息统计</el-menu-item>
          <el-menu-item index="3-3">候选人管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <el-icon><Briefcase /></el-icon>
            <span v-if="isSidebarOpen">客座教授引进意见</span>
          </template>
          <el-menu-item index="4-1">投票管理</el-menu-item>
          <el-menu-item index="4-2">信息统计</el-menu-item>
          <el-menu-item index="4-3">候选人管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <div 
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out h-full"
    >
      <el-main 
        class="flex-1 bg-[#f5f7fa] overflow-auto transition-all duration-300"
        :class="{ 'p-6': isSidebarOpen, 'p-10 w-full': !isSidebarOpen }"
      >
        <!-- 内容根据选择的菜单动态加载 -->
        <component :is="currentComponent" />
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { User, Rank, Star, Briefcase, ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
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
// 侧边栏展开/收起状态
const isSidebarOpen = ref(true);

// 切换侧边栏状态
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

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
/* 确保折叠状态下图标居中 */
.el-menu--collapse .el-menu-item,
.el-menu--collapse .el-sub-menu__title {
  padding: 0 !important;
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  height: 40px; /* 统一菜单项高度 */
  margin: 0;
}

/* 调整折叠状态下菜单的整体内边距 */
.el-menu--collapse {
  padding-top: 10px;
}
</style>