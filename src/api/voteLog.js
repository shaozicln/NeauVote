import request from './request'

// 显示所有参与投票的教职工（分页）
export function getVoteLogsAll(empQueryParam) {
  return request({
    url: '/votes/page1',
    method: 'get',
    params: empQueryParam
  })
}

// 多轮投票判定（分页）
export function getVoteLogsNext(empQueryParam, id) {
  return request({
    url: '/votes/page2',
    method: 'get',
    params: { ...empQueryParam, id }
  })
}

// 添加投票记录
export function addVoteLog(voteLog) {
  return request({
    url: '/votes',
    method: 'post',
    data: voteLog
  })
}