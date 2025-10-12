import request from './request'

// 获取所有VoteLogEmp1
export function getAllVoteLogEmp1() {
  return request({
    url: '/voteLogEmp1s',
    method: 'get'
  })
}

// 分页查询VoteLogEmp1
export function getPageVoteLogEmp1(page, pageSize) {
  return request({
    url: '/voteLogEmp1s/page',
    method: 'get',
    params: { page, pageSize }
  })
}

// 根据ID查询VoteLogEmp1
export function getVoteLogEmp1(id) {
  return request({
    url: `/voteLogEmp1s/${id}`,
    method: 'get'
  })
}

// 更新VoteLogEmp1
export function updateVoteLogEmp1(voteLogEmp1) {
  return request({
    url: '/voteLogEmp1s',
    method: 'put',
    data: voteLogEmp1
  })
}

// 添加VoteLogEmp1
export function addVoteLogEmp1(voteLogEmp1) {
  return request({
    url: '/voteLogEmp1s',
    method: 'post',
    data: voteLogEmp1
  })
}

// 批量删除VoteLogEmp1
export function deleteVoteLogEmp1(ids) {
  return request({
    url: '/voteLogEmp1s',
    method: 'delete',
    params: { ids }
  })
}