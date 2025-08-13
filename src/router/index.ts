import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const Home = () => import('../views/Home.vue')
const BookDetail = () => import('../views/BookDetail.vue')
const Reader = () => import('../views/Reader.vue')
const Bookshelf = () => import('../views/Bookshelf.vue')
const Search = () => import('../views/Search.vue')

const routes: RouteRecordRaw[] = [
    { path: '/', component: Home },
    { path: '/book/:id', component: BookDetail, props: true },
    { path: '/reader/:id/:chapter?', component: Reader, props: true },
    { path: '/bookshelf', component: Bookshelf },
    { path: '/search', component: Search }
]

export default createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(){ return { top: 0 } }
})