import request from './request'

// 获取所有TbEmp1
export function getAllTbEmp1() {
  return request({
    url: '/tbEmp1s',
    method: 'get'
  })
}

// 根据ID查询TbEmp1
export function getTbEmp1ById(id) {
  return request({
    url: `/tbEmp1s/${id}`,
    method: 'get'
  })
}

// 分页查询TbEmp1
export function getTbEmp1Page(tbEmp1QueryParam) {
  return request({
    url: '/tbEmp1s/page',
    method: 'get',
    params: tbEmp1QueryParam
  })
}

// 添加TbEmp1
export function addTbEmp1(tbEmp1) {
  return request({
    url: '/tbEmp1s',
    method: 'post',
    data: tbEmp1
  })
}

// 更新TbEmp1
export function updateTbEmp1(tbEmp1) {
  return request({
    url: '/tbEmp1s',
    method: 'put',
    data: tbEmp1
  })
}

// 批量删除TbEmp1
export function deleteTbEmp1ByIds(list) {
  return request({
    url: '/tbEmp1s',
    method: 'delete',
    params: { list }
  })
}