<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <!-- 返回按钮和个人信息 -->
      <div class="mb-4 flex justify-between items-center">
        <button
          @click="goBack"
          class="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm flex items-center"
        >
          <i class="mr-1">←</i> 返回列表
        </button>
        <!-- 个人信息按钮 - 仅在记名投票时显示 -->
        <button
          v-if="activity.isName === 1"
          @click="userModalVisible = true"
          class="px-4 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center"
        >
          <i class="mr-1">👤</i> 个人信息
        </button>
      </div>
      <h1 class="text-2xl font-bold text-blue-800 text-center">
        {{ activity.activityName }}
      </h1>
      <h2 class="text-lg text-blue-600 text-center mt-2">
        (名额：{{ activity.maxVoteNum }}名)
      </h2>
      <div class="flex items-center justify-center mt-4 text-gray-500 text-sm">
        <span class="mr-4"
          >投票状态：
          <span
            :class="
              activity.activityStatus === 1 ? 'text-green-600' : 'text-gray-400'
            "
          >
            {{ activity.activityStatus === 1 ? "进行中" : "已结束" }}
          </span>
        </span>
        <span>已选人数：{{ selectedCount }}人</span>
        <span class="ml-4">可投人数：{{ activity.maxVoteNum }}人</span>
      </div>
    </div>

    <!-- 投票规则说明 - 可折叠 -->
    <div class="mb-6">
      <div
        class="bg-blue-50 border border-blue-200 rounded-lg cursor-pointer overflow-hidden"
        @click="toggleRules"
      >
        <div class="flex justify-between items-center p-3 bg-blue-100">
          <h3 class="font-bold text-blue-800">投票规则说明</h3>
          <span class="text-blue-600">
            {{ rulesVisible ? "▼" : "▶" }}
          </span>
        </div>
        <div v-if="rulesVisible" class="p-4">
          <ul class="text-sm text-gray-700 list-disc pl-6 space-y-2">
            <li>
              请从推荐候选人中选择不超过{{
                activity.maxVoteNum
              }}名您认为符合优秀人才标准的教师
            </li>
            <li>优秀人才评选将结合投票结果和评审委员会意见综合确定最终人选</li>
            <li>投票结果将作为评审的重要参考依据之一</li>
            <li>
              每人限投一次，最多选择{{ activity.maxVoteNum }}人，超过{{
                activity.maxVoteNum
              }}人为无效票
            </li>
            <li>请在规定时间内完成投票，逾期视为弃权</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="mb-4 bg-gray-50 p-4 rounded-lg">
      <div class="flex flex-wrap gap-4 items-end justify-center">
        <div class="flex flex-col">
          <label for="name" class="text-sm text-gray-600 mb-1">教师姓名</label>
          <input
            type="text"
            id="name"
            v-model="name"
            placeholder="请输入教师姓名"
            class="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div class="flex space-x-2">
          <button
            @click="handleSearch"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            查询
          </button>
          <button
            @click="handleReset"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 分页控制 -->
    <div class="mb-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <label for="pageSize">每页显示：</label>
        <select
          id="pageSize"
          v-model="pageSize"
          @change="handlePageSizeChange"
          class="border rounded-md px-2 py-1 text-sm"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>


      <div class="text-sm text-gray-500">共 {{ total }} 条记录</div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"
      ></div>
      <p class="mt-4 text-gray-500">加载教师列表中...</p>
    </div>

    <!-- 教师列表 - 使用表格展示 -->
    <div v-else class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse w-full">
        <thead>
          <tr class="bg-blue-50">
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[60px]"
            >
              序号
            </th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[100px]"
            >
              姓名
            </th>
            <th
              colspan="2"
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800"
            >
              议项1. 人才层次
            </th>
            <th
              colspan="2"
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800"
            >
              议项2. 职称聘任
            </th>
            <th
              colspan="2"
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800"
            >
              议项3. 导师资格
            </th>
          </tr>
          <tr class="bg-blue-50">
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800"
            ></th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800"
            ></th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[100px]"
            >
              推荐层次
            </th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[100px]"
            >
              评审意见
            </th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[100px]"
            >
              拟聘职称
            </th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[100px]"
            >
              评审意见
            </th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[100px]"
            >
              拟任导师资格
            </th>
            <th
              class="border border-blue-200 px-4 py-2 text-sm text-blue-800 w-[100px]"
            >
              评审意见
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(teacher, index) in teachers"
            :key="teacher.id"
            class="hover:bg-blue-50"
          >
            <td
              class="border border-blue-200 px-4 py-2 text-sm text-gray-700 text-center"
            >
              {{ (currentPage - 1) * pageSize + index + 1 }}
            </td>
            <td
              class="border border-blue-200 px-4 py-2 text-sm text-gray-700 font-medium"
            >
              {{ teacher.name }}
            </td>
            <td class="border border-blue-200 px-4 py-2 text-sm text-gray-700">
              {{ teacher.talentLevel }}
            </td>
            <td
              class="border border-blue-200 px-4 py-2 text-sm text-gray-700 text-center"
            >
              <div class="flex space-x-2 justify-center">
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="createVoteGradeGetterSetter(teacher.id, 'voteGrade1').value === '1' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="createVoteGradeGetterSetter(teacher.id, 'voteGrade1').value = '1'"
                >同意</el-button>
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="createVoteGradeGetterSetter(teacher.id, 'voteGrade1').value === '0' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="createVoteGradeGetterSetter(teacher.id, 'voteGrade1').value = '0'"
                >不同意</el-button>
              </div>
            </td>
            <td class="border border-blue-200 px-4 py-2 text-sm text-gray-700">
              {{ teacher.proTitle }}
            </td>
            <td
              class="border border-blue-200 px-4 py-2 text-sm text-gray-700 text-center"
            >
              <div class="flex space-x-2 justify-center">
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="createVoteGradeGetterSetter(teacher.id, 'voteGrade2').value === '1' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="createVoteGradeGetterSetter(teacher.id, 'voteGrade2').value = '1'"
                >同意</el-button>
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="createVoteGradeGetterSetter(teacher.id, 'voteGrade2').value === '0' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="createVoteGradeGetterSetter(teacher.id, 'voteGrade2').value = '0'"
                >不同意</el-button>
              </div>
            </td>
            <td class="border border-blue-200 px-4 py-2 text-sm text-gray-700">
              {{ teacher.tutorQualify }}
            </td>
            <td
              class="border border-blue-200 px-4 py-2 text-sm text-gray-700 text-center"
            >
              <div class="flex space-x-2 justify-center">
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="createVoteGradeGetterSetter(teacher.id, 'voteGrade3').value === '1' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="createVoteGradeGetterSetter(teacher.id, 'voteGrade3').value = '1'"
                >同意</el-button>
                <el-button
                  :disabled="!canVote"
                  :type="''"
                  :class="createVoteGradeGetterSetter(teacher.id, 'voteGrade3').value === '0' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'"
                  size="small"
                  @click="createVoteGradeGetterSetter(teacher.id, 'voteGrade3').value = '0'"
                >不同意</el-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页导航 -->
    <div class="flex justify-center mt-6">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentPageChange"
      />
    </div>

    <!-- 投票按钮 -->
    <div class="mt-8 text-center">
      <button
        @click="submitVote"
        :disabled="
          selectedCount === 0 || selectedCount > activity.maxVoteNum
        "
        class="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 font-medium"
      >{{ hasVoted ? '点击修改投票' : '提交投票' }}
        </button>
      </div>
    </div>
  
  <!-- 个人信息弹窗 -->
  <UserModal
    v-if="activity.isName === 1"
    v-model:visible="userModalVisible"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTbEmp1Page } from "@/api/tbEmp1";
import { addVoteLogEmp1, getPageVoteLogEmp1 } from "@/api/voteLogEmp1";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from '@/store/authStore';
import UserModal from '@/components/user.vue';

const authStore = useAuthStore();

const route = useRoute();
const router = useRouter();
const activityId = route.query.activityId;

// 活动信息
const activity = ref({
  activityName: "",
  maxVoteNum: 0,
  activityStatus: 1,
  isName: 0 // 0: 不记名, 1: 记名
});

// 个人信息弹窗
const userModalVisible = ref(false);

// 投票规则可见性
const rulesVisible = ref(true);

// 切换投票规则显示/隐藏
const toggleRules = () => {
  rulesVisible.value = !rulesVisible.value;
};

// 分页数据
const teachers = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const hasVoted = ref(false); // 用户是否已经投过票

// 查询条件
const name = ref("");

// 投票数据
const voteGrades = ref({});

// 创建投票成绩的getter和setter计算属性
const createVoteGradeGetterSetter = (teacherId, gradeType) => {
  return computed({
    get() {
      // 确保教师ID对应的对象存在
      if (!voteGrades.value[teacherId]) {
        voteGrades.value[teacherId] = {};
      }
      // 返回对应的评分值，如果不存在则返回空字符串
      return voteGrades.value[teacherId][gradeType] || "";
    },
    set(value) {
      // 确保教师ID对应的对象存在
      if (!voteGrades.value[teacherId]) {
        voteGrades.value[teacherId] = {};
      }
      // 设置评分值
      voteGrades.value[teacherId][gradeType] = value;
    },
  });
};

// 计算属性：是否可以投票
const canVote = computed(() => {
  // 如果已经投过票，可以修改；否则检查活动状态
  return hasVoted.value || activity.value.activityStatus === 1;
});

// 计算属性：已完成投票的教师数量
const selectedCount = computed(() => {
  return Object.keys(voteGrades.value).filter((teacherId) => {
    const grades = voteGrades.value[teacherId];
    return (
      grades &&
      grades.voteGrade1 !== undefined &&
      grades.voteGrade1 !== "" &&
      grades.voteGrade2 !== undefined &&
      grades.voteGrade2 !== "" &&
      grades.voteGrade3 !== undefined &&
      grades.voteGrade3 !== ""
    );
  }).length;
});

// 加载教师列表
const loadTeachers = async () => {
  try {
    loading.value = true;
    const currentActivityId = parseInt(route.query.activityId) || 0;
    console.log('当前活动ID:', currentActivityId);
    
    // 方法1：直接在请求参数中包含activityId，让后端筛选（优先）
    if (currentActivityId > 0) {
      console.log('使用后端筛选：直接在请求参数中指定activityId');
      const params = {
        page: 1, // 重置为第一页
        pageSize: 100, // 适当增大页大小以获取更多数据
        name: name.value || "",
        activityId: currentActivityId // 直接传递活动ID给后端
      };
      
      const response = await getTbEmp1Page(params);
      console.log('获取到的教师列表响应:', response);
      
      // 确保正确获取数据部分
      const responseData = response?.data || response;
      
      if (responseData && responseData.list) {
        // 后端返回数据后，再进行前端二次筛选确保只显示当前活动的候选人
        let rawList = responseData.list || [];
        console.log('后端返回原始数据数量:', rawList.length);
        
        // 进行前端二次筛选
        const filteredList = rawList.filter(item => Number(item.activityId) === currentActivityId);
        console.log(`前端二次筛选后活动ID ${currentActivityId} 的候选人数量:`, filteredList.length);
        
        teachers.value = filteredList;
        total.value = filteredList.length;
        console.log('最终显示教师列表数量:', teachers.value.length);
      } else {
        teachers.value = [];
        total.value = 0;
      }
    } else {
      // 方法2：查询所有分页数据然后前端筛选（当activityId未指定时）
      let allTeachers = [];
      let currentPageNum = 1;
      let hasMoreData = true;
      
      while (hasMoreData) {
        const params = {
          page: currentPageNum,
          pageSize: pageSize.value,
          name: empName.value || ""
        };
        
        const response = await getTbEmp1Page(params);
        const responseData = response?.data || response;
        
        if (responseData && responseData.list) {
          const pageData = responseData.list || [];
          allTeachers = [...allTeachers, ...pageData];
          
          // 检查是否还有更多数据
          hasMoreData = pageData.length >= pageSize.value && currentPageNum < 10; // 限制最大页数防止无限循环
          currentPageNum++;
        } else {
          hasMoreData = false;
        }
      }
      
      console.log('获取的所有教师数据数量:', allTeachers.length);
      teachers.value = allTeachers;
      total.value = allTeachers.length;
    }
    console.log("加载教师列表完成");
  } catch (error) {
    console.error("加载教师列表失败：", error);
    ElMessage.error("加载教师列表失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 处理查询
const handleSearch = () => {
  currentPage.value = 1;
  loadTeachers();
};

// 处理重置
const handleReset = () => {
  name.value = "";
  voteGrades.value = {};
  currentPage.value = 1;
  loadTeachers();
};

// 处理页码变化
const handleCurrentPageChange = (val) => {
  currentPage.value = val;
  loadTeachers();
};

// 处理每页显示数量变化
const handlePageSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadTeachers();
};

// 提交投票
const submitVote = async () => {
  // 检查是否填写了全部教师的投票内容
  const completedVotes = Object.keys(voteGrades.value).filter((teacherId) => {
    const grades = voteGrades.value[teacherId];
    return (
      grades &&
      grades.voteGrade1 !== undefined &&
      grades.voteGrade1 !== "" &&
      grades.voteGrade2 !== undefined &&
      grades.voteGrade2 !== "" &&
      grades.voteGrade3 !== undefined &&
      grades.voteGrade3 !== ""
    );
  });

  if (completedVotes.length !== total.value) {
    ElMessage.warning("请填写全部投票内容");
    return;
  }

  try {
      // 确认对话框
      const confirmMessage = hasVoted.value
        ? `确定要修改您的投票吗？共完成了${completedVotes.length}位教师的评审意见`
        : `确定要提交您的投票吗？共完成了${completedVotes.length}位教师的评审意见`;
        
      await ElMessageBox.confirm(
        confirmMessage,
        "确认投票",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "info",
        }
      );

      // 准备投票数据
      const voteData = Object.keys(voteGrades.value)
        .map((teacherId) => {
          const grades = voteGrades.value[teacherId];
          if (
            grades &&
            grades.voteGrade1 !== undefined &&
            grades.voteGrade1 !== "" &&
            grades.voteGrade2 !== undefined &&
            grades.voteGrade2 !== "" &&
            grades.voteGrade3 !== undefined &&
            grades.voteGrade3 !== ""
          ) {
            return {
            userId: parseInt(localStorage.getItem("userId") || ""),
            activityId: parseInt(activityId),
            empId: parseInt(teacherId),
            voteGrade1: parseInt(grades.voteGrade1),
            voteGrade2: parseInt(grades.voteGrade2),
            voteGrade3: parseInt(grades.voteGrade3),
          };
          }
          return null;
        })
        .filter((item) => item !== null);

      console.log('开始发送投票请求');
      const response = await addVoteLogEmp1(voteData);
      console.log('投票请求响应:', response);
      ElMessage.success(hasVoted.value ? "投票修改成功" : "投票成功");
      hasVoted.value = true;

      // 注意：如果是修改投票，我们不应该禁用投票功能
    } catch (error) {
      if (error === "cancel") {
        // 用户取消操作
        return;
      }
      console.error('投票失败详情:', error);
      
      // 使用增强的错误上下文信息提供更详细的错误消息
        let errorMessage = '投票请求失败';
        
        if (error.responseData && error.responseData.msg) {
          errorMessage = `投票失败: ${error.responseData.msg}`;
        } else if (error.status) {
          switch (error.status) {
            case 401:
            case 403:
              errorMessage = '投票失败: 权限不足，请重新登录';
              break;
            case 404:
              errorMessage = '投票失败: 请求的投票接口不存在';
              break;
            case 500:
              errorMessage = '投票失败: 服务器内部错误，请稍后重试或联系管理员';
              break;
            default:
              errorMessage = `投票失败: ${error.message || '未知错误'}`;
          }
        } else if (!error.originalError || !error.originalError.response) {
          errorMessage = '投票失败: 网络连接异常，请检查网络后重试';
        }
      
      ElMessage.error(errorMessage);
    }
};

// 返回按钮处理函数
const goBack = () => {
  // 存储当前活动的ID，以便返回首页时定位到正确的选项卡
  localStorage.setItem(
    "lastVisitedActivity",
    JSON.stringify({
      type: "talent",
      activityId: activityId,
    })
  );
  router.push("/");
};

defineExpose({
  goBack,
});

// 检查用户是否已经投过票
const checkUserVoteHistory = async () => {
  try {
    const userId = authStore.userId;
    if (!userId) return;
    
    // 查询用户的投票记录
    const response = await getPageVoteLogEmp1(1, 100);
    if (response && response.data && response.data.list) {
      // 筛选出当前活动的投票记录
      const userActivityVotes = response.data.list.filter(
        record => record.userId === parseInt(userId) && record.activityId === parseInt(activityId)
      );
      
      if (userActivityVotes.length > 0) {
        hasVoted.value = true;
        // 加载用户之前的投票结果
        userActivityVotes.forEach(record => {
          if (record.empId) {
            voteGrades.value[record.empId] = {
              voteGrade1: record.voteGrade1?.toString() || "",
              voteGrade2: record.voteGrade2?.toString() || "",
              voteGrade3: record.voteGrade3?.toString() || ""
            };
          }
        });
      }
    }
  } catch (error) {
    console.error("检查投票历史失败：", error);
    // 失败时不影响正常使用
  }
};

// 初始化页面
onMounted(() => {
  // 获取活动信息
  activity.value = {
    activityName: route.query.activityName || "2024年优秀人才评审投票",
    maxVoteNum: parseInt(route.query.maxVoteNum) || 10,
    activityStatus: parseInt(route.query.activityStatus) || 1,
    isName: parseInt(route.query.isName) || 0
  };

  // 加载教师列表
  loadTeachers().then(() => {
    // 教师列表加载完成后，检查用户是否已经投过票
    checkUserVoteHistory();
  });
});
</script>
