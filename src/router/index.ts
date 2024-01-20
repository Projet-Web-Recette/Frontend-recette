import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import ProtectedRoute from "@/router/ProtectedRoute.vue"
import LoginView from "@/views/LoginView.vue";
import GameView from '@/views/GameView.vue';
import Account from '@/views/AccountView.vue';
import ReceipesView from '@/views/ReceipesView.vue'
import IngredientsList from '@/views/IngredientsList.vue'

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
    },
    {
        path: "/receipes",
        component: ReceipesView,
        name: 'receipes'
    },
    {
        path: "/listAll",
        component: IngredientsList,
        name: 'listAll'
    }
] as RouteRecordRaw[]

const router = createRouter({
    history: createWebHistory(''),
    routes: [
        ...routesSecure,
        ...routesNoSecure
    ]
});


export default router;