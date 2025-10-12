import request from './request'

// 条件分页查询
export function getEmpPage(empQueryParam) {
  return request({
    url: '/emps/page',
    method: 'get',
    params: empQueryParam
  })
}

// 查询所有教职工
export function getEmps() {
  return request({
    url: '/emps/list',
    method: 'get'
  })
}

// 添加教职工
export function addEmp(emp) {
  return request({
    url: '/emps',
    method: 'post',
    data: emp
  })
}

// 批量导入教职工
export function addEmps(emps) {
  return request({
    url: '/emps/list',
    method: 'post',
    data: emps
  })
}

// 根据ID查询教职工
export function getEmpById(id) {
  return request({
    url: `/emps/${id}`,
    method: 'get'
  })
}

// 更新教职工
export function updateEmp(emp) {
  return request({
    url: '/emps',
    method: 'put',
    data: emp
  })
}

// 批量删除教职工
export function deleteEmp(ids) {
  return request({
    url: '/emps',
    method: 'delete',
    params: { ids }
  })
}