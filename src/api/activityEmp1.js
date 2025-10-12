import request from './request'

// 获取所有ActivityEmp1
export function getActivityEmp1s() {
  return request({
    url: '/activityEmp1s',
    method: 'get'
  })
}

// 根据ID查询ActivityEmp1
export function getActivityEmp1(id) {
  return request({
    url: `/activityEmp1s/${id}`,
    method: 'get'
  })
}

// 添加ActivityEmp1
export function addActivityEmp1(activityEmp1) {
  return request({
    url: '/activityEmp1s',
    method: 'post',
    data: activityEmp1
  })
}

// 更新ActivityEmp1
export function updateActivityEmp1(activityEmp1) {
  return request({
    url: '/activityEmp1s',
    method: 'put',
    data: activityEmp1
  })
}

// 删除ActivityEmp1
export function deleteActivityEmp1(id) {
  return request({
    url: `/activityEmp1s/${id}`,
    method: 'delete'
  })
}