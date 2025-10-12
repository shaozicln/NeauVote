import request from './request'

// 获取所有ActivityEmp2
export function getActivityEmp2s() {
  return request({
    url: '/activityEmp2s',
    method: 'get'
  })
}

// 根据ID查询ActivityEmp2
export function getActivityEmp2ById(id) {
  return request({
    url: `/activityEmp2s/${id}`,
    method: 'get'
  })
}

// 添加ActivityEmp2
export function addActivityEmp2(activityEmp2) {
  return request({
    url: '/activityEmp2s',
    method: 'post',
    data: activityEmp2
  })
}

// 更新ActivityEmp2
export function updateActivityEmp2(activityEmp2) {
  return request({
    url: '/activityEmp2s',
    method: 'put',
    data: activityEmp2
  })
}

// 删除ActivityEmp2
export function deleteActivityEmp2(id) {
  return request({
    url: `/activityEmp2s/${id}`,
    method: 'delete'
  })
}