import {jwtDecode} from "jwt-decode";
import { sendRequest } from '@/helpers/api';
import { HttpErrors } from '@/types';
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core"

export const authenticationStore = defineStore('authenticationStore', {
    state: () => ({ 
        JWT: useLocalStorage("JWT", ""),
        isPremium: false,
        isAdmin: false,
        //isAuthenticated: false
    }),

    getters: {
        isAuthenticated: (state) => state.JWT !== ""
    },

    actions: {
        async login(login: string, password: string, fail: () => void): Promise<void> {
            //fait le fetch et change le JWT si succès
            //return true/false en fonction du succès de l'authentification
            
            try {
                const response = await sendRequest('auth', 'POST', {login, password})
    
                if(!response || response.status !== HttpErrors.SUCCESS){
                    fail()
                    return
                }

                // isAuthenticated = true
                
                this.JWT = response.content.token? response.content.token : ""

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
                // this.isAuthenticated = false;
                action()
            }
        }
    }
})