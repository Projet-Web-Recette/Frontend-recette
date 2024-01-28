import {jwtDecode} from "jwt-decode";
import { getUserAvatar, sendRequest } from '@/helpers/api';
import { HttpErrors } from '@/types';
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core"

export const authenticationStore = defineStore('authenticationStore', {
    state: () => ({ 
        JWT: useLocalStorage("JWT", ""),
        isPremium: useLocalStorage("isPremium", false),
        isAdmin: useLocalStorage("isAdmin", false),
        userId: useLocalStorage("userId", "")
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

                console.log(response)
    
                if(!response || response.status !== HttpErrors.SUCCESS){
                    fail()
                    return
                }
                
                this.JWT = response.content.token? response.content.token : ""
              
                const jwtJSON = jwtDecode<{adresseEmail: string, exp: Number, iat: Number, id: string, roles: String[], username: string, premium: boolean}>(this.JWT);

    
                this.isAdmin = jwtJSON.roles.includes('ROLE_ADMIN');
                this.userId = jwtJSON.id
    
                this.isPremium = jwtJSON.premium;

                getUserAvatar(jwtJSON.adresseEmail)

            } catch(e) {
                this.JWT = ""
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