import request from './request'

// 重置emps投票数据
export function resetEmpLoop() {
  return request({
    url: '/loops/emps',
    method: 'get'
  })
}

// 重置tbEmp1s投票数据
export function resetTbEmp1Loop() {
  return request({
    url: '/loops/tbEmp1s',
    method: 'get'
  })
}

// 重置tbEmp2s投票数据
export function resetTbEmp2Loop() {
  return request({
    url: '/loops/tbEmp2s',
    method: 'get'
  })
}