<template>
  <div class="senior-staff-list-container">
    <el-card>
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-medium">正高级职称候选人管理</span>
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
          v-model="collegeFilter"
          placeholder="选择学院"
          style="width: 150px; margin-right: 10px"
        >
          <el-option 
            v-for="option in collegeOptions" 
            :key="option.value" 
            :label="option.label" 
            :value="option.value" 
          />
        </el-select>

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
        <el-table-column prop="empId" label="候选人ID" />
        <el-table-column prop="empName" label="候选人姓名" />
        <el-table-column prop="empPrePosition" label="拟晋职称" />
        <el-table-column prop="empCollege" label="所在单位" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
         <el-table-column label="删除状态">
          <template #default="scope">
            <el-tag
              :type="scope.row.isDelete === 1 ? 'danger' : 'success'"
            >
              {{ scope.row.isDelete === 1 ? "删除" : "正常" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="voteNum" label="同意票数" />
        <el-table-column prop="avoteNum" label="A票数" />
        <el-table-column prop="score" label="总分数" />
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
              @click="handleDeleteStaff(scope.row.empId)"
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
      title="编辑候选人信息"
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
          <el-input v-model="editForm.empId" placeholder="自动生成" />
        </el-form-item>
        
        <el-form-item label="候选人姓名">
          <el-input v-model="editForm.empName" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="拟晋职称">
          <el-input v-model="editForm.empPrePosition" placeholder="请输入职称" />
        </el-form-item>
        
        <el-form-item label="所在单位">
          <el-input v-model="editForm.empCollege" placeholder="请输入单位" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="待参投" :value="0" />
            <el-option label="有效候选人" :value="1" />
            <el-option label="拟推荐人" :value="2" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="删除状态">
          <el-select v-model="editForm.isDelete" placeholder="请选择状态">
            <el-option label="正常" :value="0" />
            <el-option label="删除" :value="1" />
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
import { getEmpPage, addEmp, updateEmp, deleteEmp } from "../api/emp";

// 响应式数据
const searchQuery = ref("");
const statusFilter = ref("");
const collegeFilter = ref(""); // 添加学院筛选变量
const loading = ref(false);
const staffList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 编辑弹窗相关
const editDialogVisible = ref(false);
const editFormRef = ref();
const editForm = reactive({
  empId: '',
  empName: '',
  empPrePosition: '',
  empCollege: '',
  status: 0,
  isDelete: 0,
  voteNum: 0,
  avoteNum: 0,
  score: 0
});

// 学院选项列表
// const collegeOptions = ref([
//   { label: '全部学院', value: '' },
//   { label: '计算机学院', value: '计算机学院' },
//   { label: '电子工程学院', value: '电子工程学院' },
//   { label: '自动化学院', value: '自动化学院' },
//   { label: '数学学院', value: '数学学院' },
//   { label: '物理学院', value: '物理学院' },
//   { label: '化学学院', value: '化学学院' },
//   { label: '生物学院', value: '生物学院' },
//   { label: '文学院', value: '文学院' },
//   { label: '商学院', value: '商学院' },
//   { label: '法学院', value: '法学院' }
// ]);

// 计算属性 - 筛选后的候选人列表
const filteredStaffs = computed(() => {
  let result = staffList.value;
  
  // 应用搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(staff => 
      staff.empName.toLowerCase().includes(query)
    );
  }
  
  // 应用学院筛选
  if (collegeFilter.value) {
    result = result.filter(staff => 
      staff.empCollege === collegeFilter.value
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

// 监听状态筛选变化
watch(statusFilter, () => {
  currentPage.value = 1;
  loadStaffList();
});

// 监听学院筛选变化
watch(collegeFilter, () => {
  currentPage.value = 1;
  loadStaffList();
});

// 加载候选人列表
const loadStaffList = async () => {
  loading.value = true;
  try {
        const params = {
          page: currentPage.value,
          pageSize: pageSize.value, // 修正参数名称
          empName: searchQuery.value,
          empCollege: collegeFilter.value
          // 移除isDelete过滤条件，加载所有记录
        };
        
        const response = await getEmpPage(params);
        console.log('API响应:', response);
        
        // 根据实际API响应格式 {total: 39, rows: Array(10)} 处理数据
        let data = response.rows || [];
        total.value = response.total || data.length;
        
        // 确保isDelete字段存在并为数字类型
        data = data.map(item => ({
          ...item,
          isDelete: typeof item.isDelete === 'undefined' ? 0 : Number(item.isDelete),
          status: typeof item.status === 'undefined' ? 0 : Number(item.status)
        }));
        
        // 排序：未删除记录(isDelete=0)排在前面，已删除记录(isDelete=1)排在后面
        staffList.value = data.sort((a, b) => a.isDelete - b.isDelete);
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
  // TODO: 实现添加候选人功能
  ElMessage.info("添加候选人功能开发中");
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
    empId: staff.empId,
    empName: staff.empName,
    empPrePosition: staff.empPrePosition,
    empCollege: staff.empCollege,
    status: Number(staff.status), // 确保为数字类型
    isDelete: Number(staff.isDelete || 0), // 确保为数字类型
    voteNum: Number(staff.voteNum || 0),
    avoteNum: Number(staff.avoteNum || 0),
    score: Number(staff.score || 0)
  });
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
    // 构造请求数据，正高级使用empId作为标识
    const updateData = {
      empId: editForm.empId,
      empName: editForm.empName,
      empPrePosition: editForm.empPrePosition,
      empCollege: editForm.empCollege,
      status: Number(editForm.status), // 确保为数字类型
      isDelete: Number(editForm.isDelete), // 确保为数字类型
      voteNum: Number(editForm.voteNum),
      avoteNum: Number(editForm.avoteNum),
      score: Number(editForm.score)
    };
    
    loading.value = true;
    // 调用更新接口
    await updateEmp(updateData);
    
    ElMessage.success("编辑成功");
    handleDialogClose();
    // 重新加载列表
    loadStaffList();
  } catch (error) {
    console.error("编辑候选人异常:", error);
    ElMessage.error("编辑失败");
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
      `确定要将候选人「${staff.empName}」状态修改为「${statusText}」吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    
    loading.value = true;
    // 调用更新接口
    await updateEmp({ ...staff, status: newStatus });
    
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

// 删除候选人（软删除实现）
const handleDeleteStaff = async (empId) => {
  try {
    await ElMessageBox.confirm(
      "确定要删除该候选人吗？此操作将标记为已删除",
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }
    );
    
    loading.value = true;
    // 找到要删除的候选人
    const staffToDelete = staffList.value.find(staff => staff.empId === empId);
    
    if (staffToDelete) {
      // 软删除：更新isDelete字段为1而不是真正删除（1表示已删除）
      await updateEmp({
        ...staffToDelete,
        isDelete: 1
      });
      
      // 更新本地列表
      staffList.value = staffList.value.filter(staff => staff.empId !== empId);
      total.value = staffList.value.length;
      ElMessage.success("删除成功");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除候选人异常:", error);
      ElMessage.error("删除失败");
    }
  } finally {
    loading.value = false;
  }
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
.senior-staff-list-container {
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