import request from './request'

// 获取所有emp的投票信息
export function getEmpVoteShows(id) {
  return request({
    url: `/voteShows/emp/${id}`,
    method: 'get'
  })
}

// 获取所有tbEmp1的投票信息
export function getTbEmp1VoteShows(id) {
  return request({
    url: `/voteShows/tbEmp1/${id}`,
    method: 'get'
  })
}

// 获取所有tbEmp2的投票信息
export function getTbEmp2VoteShows(id) {
  return request({
    url: `/voteShows/tbEmp2/${id}`,
    method: 'get'
  })
}
