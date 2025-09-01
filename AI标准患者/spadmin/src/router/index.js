import {createRouter,createWebHashHistory} from 'vue-router'

import Layout from "../views/Main.vue"
import Login from "../views/login/index.vue"
import Intro from "../views/descri/intro/index.vue"
import Doc from "../views/descri/doc/index.vue"
import Free from "../views/chat/free/index.vue"
import Choose from "../views/chat/choose/index.vue"
import His from "../views/center/his/index.vue"
import Data from "../views/center/data/index.vue"
import Dashboard from "../views/dashboard/index.vue"

const routes = [
  {
    path: '/',
    component: Layout,
    name: 'main',
    children: [
      {
        path: 'descri',
        meta: { id: '1', name: '说明', icon: 'Platform' },
        children: [
          {
            path: '',
            alias: ['intro'],
            meta: { id: '1', name: '项目概述', icon: 'Message', path: '/descri/intro', describe: '项目概述' },
            component: Intro
          },
          {
            path: 'doc',
            meta: { id: '2', name: '使用说明', icon: 'Menu', path: '/descri/doc', describe: '项目使用说明' },
            component: Doc
          }
        ]
      },
      //   {path: 'dashboard',
      //     meta: { id: '1', name: '控制台', icon: 'Platform', path: '/dashboard', describe: '用于展示当前系统中的统计数据、统计报表及重要实时数据' },
      //     component: Dashboard
      //   },
      {
        path: 'chat',
        meta: { id: '2', name: '对话', icon: 'Grid' },
        children: [
          {
            path: '',
            alias: ['free'],
            meta: { id: '1', name: '自由对话', icon: 'ChatRound', path: '/chat/free', describe: '自由对话模式' },
            component: Free
          },
          {
            path: 'choose',
            meta: { id: '2', name: '案例选择', icon: 'Menu', path: '/chat/choose', describe: '进入案例库进行检索选择' },
            component: Choose
          }
        ]
      },
      {
        path: 'center',
        meta: { id: '3', name: '个人中心', icon: 'Avatar' },
        children: [
          {
            path: '',
            alias: ['his'],
            meta: { id: '1', name: '历史记录', icon: 'Checked', path: '/center/his', describe: '历史记录' },
            component: His
          },
          {
            path: 'data',
            meta: { id: '2', name: '数据统计', icon: 'List', path: '/center/data', describe: '个人数据统计' },
            component: Data
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    component: Login
  },
]

const router =createRouter({
    //路由数据
    routes,
    //路由匹配模式
    history:createWebHashHistory()
})
export default router
