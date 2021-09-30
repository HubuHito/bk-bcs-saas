/**
 * @file router 配置
 */

import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import http from '@/api'
import resourceRoutes from '@/router/resource'
import nodeRoutes from '@/router/node'
import mcRoutes from '@/router/mc'
import depotRoutes from './depot'
import metricRoutes from './metric'
import clusterRoutes from './cluster'
import appRoutes from './app'
import configurationRoutes from './configuration'
import networkRoutes from './network'
import helmRoutes from './helm'
import HPARoutes from './hpa'
import crdController from './crdcontroller.js'
import storageRoutes from './storage'
import dashboardRoutes from './dashboard'
// import menuConfig from '@/store/menu'

Vue.use(VueRouter)

const Entry = () => import(/* webpackChunkName: entry */'@/views/index')
const NotFound = () => import(/* webpackChunkName: 'none' */'@/components/exception')
const ProjectManage = () => import(/* webpackChunkName: 'projectmanage' */'@/views/project/project.vue')

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: `${SITE_URL}`,
            name: 'entry',
            component: Entry,
            children: [
                ...clusterRoutes,
                ...nodeRoutes,
                ...appRoutes,
                ...configurationRoutes,
                ...networkRoutes,
                ...resourceRoutes,
                ...depotRoutes,
                ...metricRoutes,
                ...mcRoutes,
                ...helmRoutes,
                ...HPARoutes,
                ...crdController,
                ...storageRoutes,
                ...dashboardRoutes
            ]
        },
        {
            path: '/',
            name: 'projectManage',
            component: ProjectManage
        },
        // 404
        {
            path: '*',
            name: '404',
            component: NotFound
        }
    ]
})

const cancelRequest = async () => {
    const allRequest = http.queue.get()
    const requestQueue = allRequest.filter(request => request.cancelWhenRouteChange)
    await http.cancel(requestQueue.map(request => request.requestId))
}

router.beforeEach(async (to, from, next) => {
    if (!to.params.projectId && store.state.curProjectId) {
        to.params.projectId = store.state.curProjectId
    }
    if (!to.params.projectCode && store.state.curProjectCode) {
        to.params.projectCode = store.state.curProjectCode
    }
    console.log(to)
    // const menuList = to.path.indexOf('dashboard') > -1 ? menuConfig.dashboardMenuList : menuConfig.k8sMenuList
    // const activeMenuId = menuList.find()
    // store.commit('updateCurMenuId', activeMenuId)
    await cancelRequest()
    next()
})

let containerEle = null
router.afterEach((to, from) => {
    if (!containerEle) {
        containerEle = document.getElementsByClassName('container-content')
    }
    if (containerEle && containerEle[0] && containerEle[0].scrollTop !== 0) {
        containerEle[0].scrollTop = 0
    }
})

export default router
