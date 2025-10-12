import request from './request'

// 获取所有VoteLogEmp2
export function getAllVoteLogEmp2() {
  return request({
    url: '/voteLogEmp2s',
    method: 'get'
  })
}

// 分页查询VoteLogEmp2
export function getAllVoteLogEmp2ByPage(page, pageSize) {
  return request({
    url: '/voteLogEmp2s/page',
    method: 'get',
    params: { page, pageSize }
  })
}

// 添加VoteLogEmp2
export function addVoteLogEmp2(voteLogEmp2) {
  return request({
    url: '/voteLogEmp2s',
    method: 'post',
    data: voteLogEmp2
  })
}

// 根据ID查询VoteLogEmp2
export function getVoteLogEmp2ById(id) {
  return request({
    url: `/voteLogEmp2s/${id}`,
    method: 'get'
  })
}

// 更新VoteLogEmp2
export function updateVoteLogEmp2(voteLogEmp2) {
  return request({
    url: '/voteLogEmp2s',
    method: 'put',
    data: voteLogEmp2
  })
}

// 批量删除VoteLogEmp2
export function deleteVoteLogEmp2(ids) {
  return request({
    url: '/voteLogEmp2s',
    method: 'delete',
    params: { ids }
  })
}