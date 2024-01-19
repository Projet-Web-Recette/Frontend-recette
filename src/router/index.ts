import { createRouter, createWebHistory } from 'vue-router'
import ListAllVue from '@/views/ListAll.vue'

const router = createRouter({
    history: createWebHistory(''),
    routes: [
        {
            path: '/',
            component: ListAllVue
        }
    ]
})

export default router