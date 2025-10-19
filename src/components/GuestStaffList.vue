<template>
  <div class="guest-staff-list-container">
    <el-card>
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-medium">客座教授候选人管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddStaff" class="mr-2">
              <el-icon><Plus /></el-icon>
              添加候选人
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filter mb-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索候选人姓名"
          style="width: 300px; margin-right: 10px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="statusFilter"
          placeholder="筛选状态"
          style="width: 120px; margin-right: 10px"
        >
          <el-option label="全部" value="" />
          <el-option label="待参投" :value="0" />
          <el-option label="有效候选人" :value="1" />
          <el-option label="拟推荐人" :value="2" />
        </el-select>
      </div>

      <!-- 候选人列表 -->
      <el-table :data="filteredStaffs" style="width: 100%" v-loading="loading" fit>
        <el-table-column prop="id" label="候选人ID" />
        <el-table-column prop="name" label="候选人姓名" />
        <el-table-column prop="proTitle" label="聘任类型" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="voteNum" label="总投票数" />
        <el-table-column label="操作" min-width="250">
          <template #default="scope">
            <div class="flex space-x-1">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetails(scope.row)"
              class="mr-1"
              plain
            >
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleEditStaff(scope.row)"
              class="mr-1"
              plain
            >
              编辑
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleToggleStatus(scope.row)"
              class="mr-1"
              plain
            >
              切换状态
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteStaff(scope.row.id)"
              plain
            >
                  删除
                </el-button>
              </div>
              </template>
            </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container mt-4 flex justify-between items-center">
        <span class="text-sm">Total {{ total }}/page</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑候选人弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isEditMode ? '编辑候选人信息' : '添加候选人信息'"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="100px"
        class="mt-2"
      >
        <el-form-item label="候选人ID" disabled>
          <el-input v-model="editForm.id" disabled placeholder="候选人ID" />
        </el-form-item>
        
        <el-form-item label="候选人姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="聘任类型">
          <el-input v-model="editForm.proTitle" placeholder="请输入聘任类型" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="待参投" :value="0" />
            <el-option label="有效候选人" :value="1" />
            <el-option label="拟推荐人" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmitEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.space-x-1 > * + * {
  margin-left: 8px;
}
</style>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Plus } from "@element-plus/icons-vue";
import { getPageEmp2, updateEmp2, addEmp2, deleteEmp2 } from "../api/tbEmp2";

// 响应式数据
const searchQuery = ref("");
const statusFilter = ref("");
const loading = ref(false);
const staffList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 编辑弹窗相关
const editDialogVisible = ref(false);
const editFormRef = ref();
const isEditMode = ref(false);
const editForm = reactive({
  id: '',
  name: '',
  proTitle: '',
  status: 0,
  voteNum: 0
});

// 计算属性 - 筛选后的候选人列表
const filteredStaffs = computed(() => {
  let result = staffList.value;
  
  // 应用搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(staff => 
      staff.name.toLowerCase().includes(query)
    );
  }
  
  // 应用状态筛选
  if (statusFilter.value !== "") {
    result = result.filter(staff => 
      staff.status === parseInt(statusFilter.value)
    );
  }
  
  return result;
});

// 监听状态筛选变化
watch(statusFilter, () => {
  loadStaffList();
});

// 加载候选人列表
const loadStaffList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      empName: searchQuery.value
      // 加载所有记录，包括已标记删除的
    };
    
    const response = await getPageEmp2(params);
    console.log('API响应:', response);
    
    // 根据实际API响应格式处理并添加排序逻辑
    const data = response.rows || [];
    // 确保isDelete字段为数字类型并按isDelete排序（0在前，1在后）
    staffList.value = data.map(item => ({
      ...item,
      isDelete: typeof item.isDelete === 'undefined' ? 0 : Number(item.isDelete)
    })).sort((a, b) => a.isDelete - b.isDelete);
    total.value = response.total || staffList.value.length;
  } catch (error) {
    console.error("获取候选人列表异常:", error);
    ElMessage.error("获取候选人列表异常");
    staffList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 刷新列表
const handleRefresh = () => {
  currentPage.value = 1;
  loadStaffList();
};

// 添加候选人
const handleAddStaff = () => {
  // 重置编辑表单
  Object.assign(editForm, {
    id: '',
    name: '',
    position: '',
    college: '',
    status: 0,
    isDelete: 0,
    voteNum: 0,
    positionVoteNum: 0,
    collegeVoteNum: 0,
    score: 0,
  });
  isEditMode.value = false;
  editDialogVisible.value = true;
};

// 查看候选人详情
const handleViewDetails = (staff) => {
  // TODO: 实现查看候选人详情功能
  ElMessage.info("查看候选人详情功能开发中");
};

// 编辑候选人
const handleEditStaff = (staff) => {
  // 复制原数据到编辑表单，确保初始值为原值
  Object.assign(editForm, {
    id: staff.id,
    name: staff.name,
    proTitle: staff.proTitle,
    status: staff.status,
    voteNum: staff.voteNum || 0
  });
  isEditMode.value = true;
  editDialogVisible.value = true;
};

// 关闭编辑弹窗
const handleDialogClose = () => {
  editDialogVisible.value = false;
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
};

// 提交编辑
const handleSubmitEdit = async () => {
  try {
    // 构造请求数据
    const formData = {
      id: editForm.id,
      name: editForm.name,
      proTitle: editForm.proTitle,
      status: editForm.status,
      voteNum: editForm.voteNum
    };

    loading.value = true;
    
    if (isEditMode.value) {
      // 编辑模式：调用更新接口
      await updateEmp2(formData);
      ElMessage.success("编辑成功");
    } else {
      // 添加模式：调用添加接口
      await addEmp2(formData);
      ElMessage.success("添加成功");
    }

    handleDialogClose();
    // 重新加载列表
    loadStaffList();
  } catch (error) {
    console.error("操作候选人异常:", error);
    ElMessage.error(isEditMode.value ? "编辑失败" : "添加失败");
  } finally {
    loading.value = false;
  }
};

// 切换候选人状态
const handleToggleStatus = async (staff) => {
  // 确保状态在0、1、2之间循环切换
  const newStatus = (staff.status + 1) % 3;
  const statusText = getStatusText(newStatus);
  
  try {
    await ElMessageBox.confirm(
      `确定要将候选人「${staff.name}」状态修改为「${statusText}」吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    loading.value = true;
    // 调用更新接口
    await updateEmp2({ ...staff, status: newStatus });
    
    // 更新本地状态
    staff.status = newStatus;
    ElMessage.success(`状态修改为${statusText}成功`);
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(`状态修改失败`);
    }
  } finally {
    loading.value = false;
  }
};

// 删除候选人（直接调用删除接口）
const handleDeleteStaff = async (id) => {
  try {
    await ElMessageBox.confirm("确定要删除该候选人吗？此操作不可撤销", "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "error",
    });

    loading.value = true;
    
    // 直接调用删除接口
    await deleteEmp2([id]);
    
    // 更新本地列表
    staffList.value = staffList.value.filter((staff) => staff.id !== id);
    total.value = staffList.value.length;
    
    ElMessage.success("删除成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除候选人异常:", error);
      ElMessage.error("删除失败");
    }
  } finally {
    loading.value = false;
  }
};

// 状态文本映射函数
const getStatusText = (status) => {
  const statusMap = {
    0: '待参投',
    1: '有效候选人',
    2: '拟推荐人'
  };
  return statusMap[status] || '未知状态';
};
// 状态标签类型映射函数
const getStatusType = (status) => {
  const typeMap = {
    0: 'info',      // 待参投 - 信息蓝
    1: 'success',   // 有效候选人 - 成功绿
    2: 'warning'    // 拟推荐人 - 警告黄
  };
  return typeMap[status] || 'default';
};
// 分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  loadStaffList();
};

const handleCurrentChange = (newCurrent) => {
  currentPage.value = newCurrent;
  loadStaffList();
};

// 组件挂载时加载数据
onMounted(() => {
  loadStaffList();
});
</script>

<style scoped>
.guest-staff-list-container {
  padding: 20px;
}

.search-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-button--small) {
  margin-right: 5px;
}
</style>