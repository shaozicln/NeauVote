import request from './request'

export function login(loginData) {
  return request({
    url: '/login',
    method: 'post',
    data: loginData
  })
}
