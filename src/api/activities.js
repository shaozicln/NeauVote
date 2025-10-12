import request from './request'

// 获取所有活动
export function getActivities() {
  return request({
    url: '/activities',
    method: 'get'
  })
}

// 添加活动
export function addActivity(activity) {
  return request({
    url: '/activities',
    method: 'post',
    data: activity
  })
}

// 根据ID获取活动
export function getActivityById(id) {
  return request({
    url: `/activities/${id}`,
    method: 'get'
  })
}

// 更新活动（PUT操作）
export function updateActivity(activity) {
  return request({
    url: '/activities',
    method: 'put',
    data: activity
  })
}

// 删除活动
export function deleteActivity(id) {
  return request({
    url: `/activities/${id}`,
    method: 'delete'
  })
}