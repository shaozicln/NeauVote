<template>
  <!-- 极简风格登录表单 -->
  <div class="flex justify-center items-center min-h-screen bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
      <h2 class="text-2xl font-light text-center text-gray-800 mb-8">
        投票系统登录
      </h2>
      <!-- 用户名输入框 -->
      <div class="mb-6">
        <input
          v-model="loginForm.username"
          type="text"
          placeholder="请输入用户名"
          class="w-full px-4 py-2 border-b border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
      <!-- 密码输入框 -->
      <div class="mb-8">
        <input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          class="w-full px-4 py-2 border-b border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
      <!-- 登录按钮 -->
      <button
        @click="handleLogin"
        class="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { login } from "@/api/auth";
import { ElMessage } from "element-plus";

// 登录表单数据
const loginForm = ref({
  username: "",
  password: "",
});

const router = useRouter();
const authStore = useAuthStore();

// 登录按钮点击事件
const handleLogin = async () => {
  try {
    // 验证表单
    if (!loginForm.value.username || !loginForm.value.password) {
      ElMessage.warning("请输入用户名和密码");
      return;
    }

    // 调用登录接口
    const loginRes = await login(loginForm.value);
    authStore.setAuthInfo(loginRes);
    ElMessage.success("登录成功");
    
    // 触发登录成功事件，通知App.vue更新状态
    if (window.eventBus) {
      console.log('登录成功，触发loginSuccess事件')
      window.eventBus.emit('loginSuccess')
    }
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    
    if (redirect && redirect !== '/login') {
      router.push(redirect);
    } 
    else if (authStore.position === "管理员") {
      router.push("/");
    } else {
      router.push("/");
    }
  } catch (error) {
    console.error("登录失败：", error.message);
  }
};
</script>
