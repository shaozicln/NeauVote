import request from './request'

// 获取所有emp的投票信息
export function getEmpVoteShows() {
  return request({
    url: '/voteShows/emp',
    method: 'get'
  })
}

// 获取所有tbEmp1的投票信息
export function getTbEmp1VoteShows() {
  return request({
    url: '/voteShows/tbEmp1',
    method: 'get'
  })
}

// 获取所有tbEmp2的投票信息
export function getTbEmp2VoteShows() {
  return request({
    url: '/voteShows/tbEmp2',
    method: 'get'
  })
}