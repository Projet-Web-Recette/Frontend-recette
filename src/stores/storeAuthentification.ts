import {reactive} from 'vue'
import {jwtDecode} from "jwt-decode";
import { sendRequest } from '@/helpers/api';
import { HttpErrors } from '@/types';

export const storeAuthentification = reactive({
    JWT: "",
    isAuthenticated: false,
    isPremium: false,
    isAdmin: false,

    async login(login: string, password: string, fail: () => void): Promise<void> {
        //fait le fetch et change le JWT si succès
        //return true/false en fonction du succès de l'authentification
        
        try {
            const response = await sendRequest('auth', 'POST', {login, password})

            if(!response || response.status !== HttpErrors.SUCCESS){
                fail()
                return
            }
            
            this.JWT = response.content.token? response.content.token : ""

            this.isAuthenticated = true;
            const jwtJSON = jwtDecode<{adresseEmail: String, exp: Number, iat: Number, id: Number, roles: String[], username: string}>(this.JWT);

            this.isAdmin = jwtJSON.roles.includes('ROLE_ADMIN');

            this.isPremium = false; //METTRE LA VALEUR CONTENUE DANS LE JWT
        } catch(e) {
            console.error(e)
            fail()
        }
    },
    async register(login: string, password: string, email: string, fail: () => void): Promise<void> {
        try {
            const response = await sendRequest('utilisateurs', 'POST', {login, plainPassword: password, adresseEmail: email})

            if(!response || response.status !== HttpErrors.CREATED){
                fail()
                return
            }
        } catch (e) {
            console.error(e)
            fail()
        }
    },

    deconnexion(action: () => void) {
        if (this.isAuthenticated) {
            this.JWT = '';
            this.isAuthenticated = false;
            action()
        }
    }
});