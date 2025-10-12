import request from './request'

// 获取所有用户
export function getUsers() {
  return request({
    url: '/users',
    method: 'get'
  })
}

// 添加用户
export function addUsers(users) {
  return request({
    url: '/users',
    method: 'post',
    data: users
  })
}

// 根据ID查询用户
export function getUsersById(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

// 更新用户
export function updateUsers(users) {
  return request({
    url: '/users',
    method: 'put',
    data: users
  })
}

// 删除用户
export function deleteUsers(id) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}