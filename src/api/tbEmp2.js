import request from './request'

// 获取所有TbEmp2
export function getAllEmp2() {
  return request({
    url: '/tbEmp2s',
    method: 'get'
  })
}

// 分页查询TbEmp2
export function getPageEmp2(tbEmp2QueryParam) {
  return request({
    url: '/tbEmp2s/page',
    method: 'get',
    params: tbEmp2QueryParam
  })
}

// 根据ID查询TbEmp2
export function getEmp2ById(id) {
  return request({
    url: `/tbEmp2s/${id}`,
    method: 'get'
  })
}

// 添加TbEmp2
export function addEmp2(tbEmp2) {
  return request({
    url: '/tbEmp2s',
    method: 'post',
    data: tbEmp2
  })
}

// 更新TbEmp2
export function updateEmp2(tbEmp2) {
  return request({
    url: '/tbEmp2s',
    method: 'put',
    data: tbEmp2
  })
}

// 批量删除TbEmp2
export function deleteEmp2(ids) {
  return request({
    url: '/tbEmp2s',
    method: 'delete',
    params: { ids }
  })
}