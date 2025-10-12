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
    path: "/home",
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

// 本地没有token就跳到登录界面
router.beforeEach(async (to, from, next) => {
  // 登录页直接放行
  if (to.path === "/login") {
    next();
    return;
  }

  try {
    // 尝试获取authStore（异步）
    const authStore = await getAuthStore();
    const hasToken = authStore.token || localStorage.getItem('token');
    
    if (hasToken) {
      next();
    } else {
      // 强制跳转登录页并记录来源地址
      next(`/login?redirect=${to.fullPath}`);
    }
  } catch (error) {
    // 如果获取store失败，直接检查localStorage
    console.warn('获取authStore失败，使用localStorage检查token:', error);
    const hasToken = localStorage.getItem('token');
    
    if (hasToken) {
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`);
    }
  }
});
export default router;
