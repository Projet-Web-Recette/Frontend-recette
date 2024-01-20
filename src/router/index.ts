import {createRouter, createWebHistory} from 'vue-router'
import ProtectedRoute from "@/router/ProtectedRoute.vue"
import LoginView from "@/LoginView.vue";
import GameView from '@/GameView.vue';
import Account from '@/AccountView.vue';

const routesSecure = [
    {
        path: "/",
        component: ProtectedRoute,
        name: "Accueil",
        children: [
            {
                path: '/',
                component: GameView
            },
            {
                path: '/account',
                name: 'Account',
                component: Account
            }
        ]
    },
]

const routesNoSecure = [
    {
        path: "/login",
        component: LoginView,
        name: "Login"
    }
]

const router = createRouter({
    history: createWebHistory(''),
    routes: [
        ...routesSecure,
        ...routesNoSecure
    ]
});


export default router;