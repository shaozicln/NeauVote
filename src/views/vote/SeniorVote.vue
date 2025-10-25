<template>
  <div class="container mx-auto p-4">
    <!-- 页面标题 -->
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
      <!-- 特殊标题样式 -->
      <h1 class="text-2xl font-bold text-blue-800 text-center">
        {{ activity.activityName }}
      </h1>
      <h2 class="text-lg text-blue-600 text-center mt-2">
        (名额：{{ activity.maxVoteNum }}名)
      </h2>
      <div class="flex items-center mt-4 text-gray-500 text-sm justify-center">
        <span class="mr-4"
          >投票状态：
          <span
            :class="
              activity.activityStatus === 1 ? 'text-green-600' : 'text-gray-400'
            "
            >{{ activity.activityStatus === 1 ? "进行中" : "已结束" }}</span
          >
        </span>
        <span>A票已选：{{ selectedACount }}人</span>
        <span class="ml-4">B票已选：{{ selectedBCount }}人</span>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="mb-4 bg-gray-50 p-4 rounded-lg">
      <div class="flex flex-wrap gap-4 items-end justify-center">
        <div class="flex flex-col">
          <label for="empName" class="text-sm text-gray-600 mb-1"
            >教师姓名</label
          >
          <input
            type="text"
            id="empName"
            v-model="empName"
            placeholder="请输入教师姓名"
            class="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div class="flex flex-col">
          <label for="empCollege" class="text-sm text-gray-600 mb-1"
            >所属学院</label
          >
          <input
            type="text"
            id="empCollege"
            v-model="empCollege"
            placeholder="请输入学院名称"
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

    <!-- 投票规则说明 - 可折叠 -->
    <div class="mb-6 bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="bg-blue-50 p-4 cursor-pointer" @click="toggleRules">
        <h3 class="font-medium text-blue-800 flex justify-between items-center">
          <span class="flex items-center">
            <i class="mr-2 text-blue-600">📋</i> 投票规则
          </span>
          <i
            class="transform transition-transform duration-300"
            :class="rulesVisible ? 'rotate-180' : ''"
            >↓</i
          >
        </h3>
      </div>
      <div v-if="rulesVisible" class="p-4 bg-blue-50/50 border border-blue-100">
        <ul class="text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>
            投票结果分为"同意"和"不同意"两个类别，其中"同意"分为A和B两个等级
          </li>
          <li>
            A等级为优先推荐、计3分，B等级为普通推荐、计1分；"不同意"为C，计0分
          </li>
          <li>参评人员获得评委人数三分之二及以上"同意"票的为有效候选人</li>
          <li>A票限投4人，超过4人为无效票</li>
          <li>投票栏中A、B、C限投1项，划"○"，其他项划"—"</li>
        </ul>
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
    <div v-else class="overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              序号
            </th>
            <th class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              姓名
            </th>
            <th class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              拟晋职称
            </th>
            <th class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              所在单位
            </th>
            <th class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              同意
            </th>
            <th class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              不同意
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(teacher, index) in teachers"
            :key="teacher.empId"
            class="hover:bg-gray-50"
          >
            <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              {{ index + 1 }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              {{ teacher.empName }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              {{ teacher.empPrePosition }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              {{ teacher.empCollege }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              <div class="flex space-x-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    :name="'vote-' + teacher.empId"
                    :value="'A'"
                    v-model="voteSelections[teacher.empId]"
                    @change="handleVoteSelection(teacher.empId, 'A')"
                    :disabled="
                      !canVote ||
                      (voteSelections[teacher.empId] !== 'A' &&
                        selectedACount >= 4)
                    "
                    class="mr-1"
                  />
                  <span>A</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    :name="'vote-' + teacher.empId"
                    :value="'B'"
                    v-model="voteSelections[teacher.empId]"
                    @change="handleVoteSelection(teacher.empId, 'B')"
                    :disabled="!canVote"
                    class="mr-1"
                  />
                  <span>B</span>
                </label>
              </div>
            </td>
            <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  :name="'vote-' + teacher.empId"
                  :value="'C'"
                  v-model="voteSelections[teacher.empId]"
                  @change="handleVoteSelection(teacher.empId, 'C')"
                  :disabled="!canVote"
                  class="mr-1"
                />
                <span>C</span>
              </label>
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
          selectedACount + selectedBCount === 0 ||
          selectedACount > 4
        "
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300"
      >
        {{ hasVoted ? '点击修改投票' : '提交投票' }}
      </button>
    </div>
  </div>

  <!-- 个人信息弹窗 -->
  <UserModal v-if="activity.isName === 1" v-model:visible="userModalVisible" />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getEmpPage } from "@/api/emp";
import { addVoteLog, getVoteLogsAll } from "@/api/voteLog";
import { ElMessage, ElMessageBox } from "element-plus";
import { login } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import UserModal from "@/components/user.vue";

const authStore = useAuthStore();

const route = useRoute();
const router = useRouter();
const activityId = route.query.activityId;

// 活动信息
const activity = ref({
  activityName: "",
  maxVoteNum: 0,
  activityStatus: 1,
  isName: 0, // 0: 不记名, 1: 记名
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
const empName = ref("");
const empCollege = ref("");

// 投票数据 - 修改为支持A/B/C三种投票选项
const voteSelections = ref({});

// 计算属性：是否可以投票
const canVote = computed(() => {
  // 如果已经投过票，可以修改；否则检查活动状态
  return hasVoted.value || activity.value.activityStatus === 1;
});

// 计算属性：已选择A票的数量
const selectedACount = computed(() => {
  return Object.values(voteSelections.value).filter((vote) => vote === "A")
    .length;
});

// 计算属性：已选择B票的数量
const selectedBCount = computed(() => {
  return Object.values(voteSelections.value).filter((vote) => vote === "B")
    .length;
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
        empName: empName.value || "",
        empCollege: empCollege.value || "",
        activityId: currentActivityId // 直接传递活动ID给后端
      };
      
      const response = await getEmpPage(params);
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
          empName: empName.value || "",
          empCollege: empCollege.value || ""
        };
        
        const response = await getEmpPage(params);
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
  empName.value = "";
  empCollege.value = "";
  voteSelections.value = {};
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

// 处理投票选项选择
const handleVoteSelection = (teacherId, voteType) => {
  // 检查A票是否超过限制
  if (voteType === "A" && selectedACount.value > 4) {
    ElMessage.warning("A票最多只能选择4人");
    // 恢复之前的选择
    voteSelections.value[teacherId] = Object.keys(
      voteSelections.value
    ).includes(teacherId)
      ? voteSelections.value[teacherId]
      : "";
    return;
  }
};

// 提交投票
const submitVote = async () => {
  // 检查是否填写了全部教师的投票内容
  if (Object.keys(voteSelections.value).length !== total.value) {
    ElMessage.warning("请填写全部投票内容");
    return;
  }

  if (selectedACount.value > 4) {
    ElMessage.warning("A票最多只能选择4人");
    return;
  }

  try {
    // 确认对话框
    const confirmMessage = hasVoted.value 
      ? `您确定要修改您的投票吗？您已选择 ${selectedACount.value} 个A票和 ${selectedBCount.value} 个B票。`
      : `您已选择 ${selectedACount.value} 个A票和 ${selectedBCount.value} 个B票，确定要提交您的投票吗？`;
    
    await ElMessageBox.confirm(
      confirmMessage,
      "确认投票",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "info",
      }
    );

    // 准备投票数据 - 转换为要求的数据结构
    console.log('活动对象:', activity);
    console.log('活动对象是否包含voteRound属性:', 'voteRound' in activity);
    
    const voteDataArray = Object.keys(voteSelections.value).map((empId) => {
      // 将字母投票等级转换为数字值
      const gradeMap = {
        'A': 0,
        'B': 1,
        'C': 2
      };
      
      return {
        activityId: parseInt(activityId),
        userId: parseInt(localStorage.getItem("userId") || ""),
        empId: parseInt(empId),
        voteGrade: gradeMap[voteSelections.value[empId]] || 2, // 默认为2(C)
        voteRound: activity.voteRound || 1 // 从当前活动中获取投票轮次，如果不存在则默认为1
      };
    });
    
    console.log('提交的投票数据:', voteDataArray);

    try {
      console.log('开始发送投票请求');
      const response = await addVoteLog(voteDataArray);
      console.log('投票请求响应:', response);
      ElMessage.success(hasVoted.value ? "投票修改成功" : "投票成功");
      hasVoted.value = true;
    } catch (apiError) {
      console.error('API调用错误详情:', apiError);
      
      // 使用增强的错误上下文信息提供更详细的错误消息
        let errorMessage = '投票请求失败';
        
        if (apiError.responseData && apiError.responseData.msg) {
          // 使用后端返回的具体错误信息
          errorMessage = `投票失败: ${apiError.responseData.msg}`;
        } else if (apiError.status) {
          // 根据HTTP状态码提供更具体的错误信息
          switch (apiError.status) {
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
              errorMessage = `投票失败: ${apiError.message || '未知错误'}`;
          }
        } else if (!apiError.originalError || !apiError.originalError.response) {
          // 网络错误
          errorMessage = '投票失败: 网络连接异常，请检查网络后重试';
        }
      
      // 直接显示错误信息，不再抛出错误
      ElMessage.error(errorMessage);
      
      // 通过返回false表示投票失败
      return false;
    }

    // 只有在第一次投票成功后才禁用
    if (!hasVoted.value) {
      activity.value.activityStatus = 2;
    }
  } catch (error) {
    // 只处理用户取消操作的情况，其他错误已经在内部处理
    if (error === "cancel") {
      // 用户取消操作
      return;
    }
    // 记录其他未预期的错误，但不再显示通用错误消息
    console.error("投票过程中发生未预期的错误：", error);
  }
};

// 返回按钮处理函数
const goBack = () => {
  // 存储当前活动的ID，以便返回首页时定位到正确的选项卡
  localStorage.setItem(
    "lastVisitedActivity",
    JSON.stringify({
      type: "senior",
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
    
    const params = {
      page: 1,
      pageSize: 100, // 使用足够大的pageSize以获取所有投票记录
      userId: userId,
      activityId: activityId
    };
    
    const response = await getVoteLogsAll(params);
    if (response && response.data && response.data.list && response.data.list.length > 0) {
      hasVoted.value = true;
      // 加载用户之前的投票结果
      response.data.list.forEach(record => {
        if (record.empId && record.voteGrade) {
          voteSelections.value[record.empId] = record.voteGrade;
        }
      });
      
      // 如果已经投过票，即使活动状态是1，也可以修改投票
      if (activity.value.activityStatus === 1) {
        // 保持活动状态为1，允许修改
      }
    }
  } catch (error) {
    console.error("检查投票历史失败：", error);
    // 失败时不影响正常使用，继续显示为未投票状态
  }
};

// 初始化页面
onMounted(() => {
  // 获取活动信息
  activity.value = {
    activityName:
      route.query.activityName ||
      "2024年拟评正高级专业技术职务人员评审推荐投票",
    maxVoteNum: parseInt(route.query.maxVoteNum) || 4, // 默认A票最多4人
    activityStatus: parseInt(route.query.activityStatus) || 1,
    isName: parseInt(route.query.isName) || 0,
  };

  // 加载教师列表
  loadTeachers().then(() => {
    // 教师列表加载完成后，检查用户是否已经投过票
    checkUserVoteHistory();
  });
});
</script>
