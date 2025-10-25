import { createRouter, createWebHistory } from "vue-router";
const Home = () => import("@/views/home/Home.vue");
const NotFound = () => import("@/views/NotFound.vue");
const Login = () => import("@/views/login/Login.vue");
const AdminIndex = () => import("@/views/admin/Index.vue");
const SeniorVote = () => import("@/views/vote/SeniorVote.vue");
const TalentVote = () => import("@/views/vote/TalentVote.vue");
const GuestProfessorVote = () => import("@/views/vote/GuestProfessorVote.vue");

// 动态导入authStore，避免循环依赖和浏览器环境中的require问题
let authStorePromise;
const getAuthStore = async () => {
  if (!authStorePromise) {
    authStorePromise = import("@/store/authStore.js").then(module => module.useAuthStore());
  }
  return authStorePromise;
};

const routes = [
  // { path: "/", name: "index", component: Index, meta: { requestAuth: false } },
  {
    path: "/",
    name: "home",
    component: Home,
    meta: { requestAuth: false },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requestAuth: false },
  },
  {
    path: "/:catchAll(.*)",
    component: NotFound,
    meta: { requestAuth: false },
  },
  {    
    path: "/adminIndex",
    name: "adminIndex",
    component: AdminIndex,
    meta: { requestAuth: true },
  },
  {
    path: "/senior-vote",
    name: "seniorVote",
    component: SeniorVote,
    meta: { requestAuth: true },
  },
  {
    path: "/talent-vote",
    name: "talentVote",
    component: TalentVote,
    meta: { requestAuth: true },
  },
  {
    path: "/guest-professor-vote",
    name: "guestProfessorVote",
    component: GuestProfessorVote,
    meta: { requestAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 增强的路由守卫：处理token验证和过期检查
router.beforeEach(async (to, from, next) => {
  // 检查是否需要认证
  const requiresAuth = to.matched.some(record => record.meta?.requestAuth !== false);
  
  // 登录页直接放行
  if (to.path === "/login") {
    next();
    return;
  }

  try {
    // 尝试获取authStore（异步）
    const authStore = await getAuthStore();
    const token = authStore.token || localStorage.getItem('token');
    
    // 检查token是否存在且格式合理
    const isValidToken = token && typeof token === 'string' && token.trim().length > 0;
    
    if (requiresAuth) {
      // 需要认证的路由
      if (isValidToken) {
        next();
      } else {
        // 没有有效token，强制跳转登录页并记录来源地址
        next(`/login?redirect=${to.fullPath}`);
      }
    } else {
      // 不需要认证的路由
      next();
    }
  } catch (error) {
    // 如果获取store失败，直接检查localStorage
    console.warn('获取authStore失败，使用localStorage检查token:', error);
    const token = localStorage.getItem('token');
    
    if (requiresAuth && (!token || typeof token !== 'string' || token.trim().length === 0)) {
      // 需要认证但没有有效token
      next(`/login?redirect=${to.fullPath}`);
    } else {
      // 继续导航
      next();
    }
  }
});
export default router;
