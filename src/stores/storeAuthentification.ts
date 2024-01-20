import {reactive} from 'vue'
import {jwtDecode} from "jwt-decode";

export const storeAuthentification = reactive({
    JWT: "",
    estConnecte: false,
    isPremium: false,
    isAdmin: false,

    connexion(login: string, motDePasse: string, succes: () => void, echec: () => void): void {
        //fait le fetch et change le JWT si succès
        //return true/false en fonction du succès de l'authentification
        fetch("https://webinfo.iutmontp.univ-montp2.fr/~bordl/API-PLATFORM-main/API-PLATFORM/public/api/auth", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({login: login, password: motDePasse}),
        }).then(reponsehttp => {
            if (reponsehttp.status !== 200) {
                echec();
            } else {
                reponsehttp.json().then(token => {
                    this.JWT = token['token'];
                    this.estConnecte = true;
                    const jwtJSON = jwtDecode(this.JWT);

                    this.isAdmin = jwtJSON.roles.includes('ROLE_ADMIN');

                    this.isPremium = false; //METTRE LA VALEUR CONTENUE DANS LE JWT
                    succes();
                });
            }
        })

    },
    inscription(login: string, motDePasse: string, adresseEmail: string, succes: () => void, echec: () => void): void {
        fetch("https://webinfo.iutmontp.univ-montp2.fr/~bordl/API-PLATFORM-main/API-PLATFORM/public/api/utilisateurs", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({login: login, plainPassword: motDePasse, adresseEmail: adresseEmail}),
        }).then(reponsehttp => {
            if (reponsehttp.status !== 201) {
                echec()
            } else {
                succes()
            }
        })
    },

    deconnexion(action: () => void) {
        if (this.estConnecte) {
            this.JWT = '';
            this.estConnecte = false;
            action()
        }
    }
});