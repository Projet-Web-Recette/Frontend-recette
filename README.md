<h1 align="center">
    <img src="https://i.ibb.co/mJdbWwb/logo.png">
    atisCraftory
</h1>

---
## ⛓️ Liens
- #### [🎯 API]()
 
- #### [🌐 SatisCraftory]()
 
- #### [🙂 MyAvatar](https://webinfo.iutmontp.univ-montp2.fr/~cazauxl/MyAvatar/public/)

---
## 📚 Repository
Tout se trouve sur l'organisation `SatisCraftory` sur GitHub au travers 3 repositories différents.
- #### [🔧 SatisCraftory](https://github.com/Projet-Web-Recette)

---
## 📝 Thème choisi
Pour ce projet de site de recettes nous avons choisi le thème du jeu vidéo Satisfactory.

Ce jeu est un jeu de construction et de gestion de ressources. Le joueur doit construire une usine pour produire des ressources et des produits finis. Il doit donc gérer les ressources et les flux de production.

Ici nous avons donc utilisé le même système que le jeu (sans ajouter de règles / spécifités).

---
## 🎯 API

### 📋 Présentation
Blablabla

### 🛠️ Fonctionnalités
blablabla

---
## 🌐 SatisCraftory

### 📋 Présentation
Blablabla

### 🛠️ Fonctionnalités
blablabla

---
## 🙂 MyAvatar

### ⚙️ Fonctionnement
Pour récupérer l'image de profil d'un utilisateur il existe plusieurs moyens :
- **_(Pour les utilisateurs)_** <br> Sur la page `Avatars` disponible dans la barre de navigation, il suffira ensuite de rentrer l'email de la personne dont on veut l'image de profil. Si la personne cherchée n'a pas d'avatar une erreur sera affichée.
- **_(Pour les services externes)_** <br> En envoyant une requête à la route `/avatar/{email}` avec l'email haché en MD5 de la personne dont on veut l'image de profil. Si la personne cherchée n'a pas d'avatar un avatar par défaut sera renvoyé.

**La base de données utilisée pour MyAvatar est disponible sur la session de Loris C. sur le phpMyAdmin de l'IUT.**

### 🛠️ Fonctionnalités ajoutées
- Modification de l'avatar (avec l'ancien avatar disponible)
- Modification du mot de passe
- Page de consultation des avatars

---
## 🔬 Investissement de chaque membre
### Vincent
  - Mise en place de **l'API**, réalisation de la structure du patron composite pour les recettes (items et ressources)
  - Intégration de nombreux **systèmes** de l'API comme les event listener, le filter permettant de récupérer un certain type d'item, gestion des states processors de toutes les tables
  - Mise en place de la **sécurité** de l'API (création d'un **voter**, attributs security, etc...)
  - Intégration de la **structure** permettant de récupérer les quantités d'ingrédients pour les ingrédients d'une recette particulière
  - Réalisation du **serializer** offrant la possibilité d'enregistrer des images à l'aide des formulaires de type multipart pour l'API
  - Gestion du livre de recette (frontend & backend)
  - Réalisation d'un **algorithme** permettant d'afficher l'arbre de construction d'un item
  - Réalisation de la fonctionnalité permettant de **créer une recette** pour les utilisateurs premium (mise en place de récursivité pour le parcours de l'arbre)
  - Réalisation de **requêtes** et mise en place de **types** pour récupérer les informations depuis l'api
  - Filtrage des items de différentes façon (par rapport à la machine le construisant, son type, qu'est ce qui le compose, etc...)

### Loris B.
  - Mise en place de **l'API**, réfléxion pour la conception du patron composite
  - Intégration des **machines** (Foreuse, assembleuse, constructeur, fonderie) et routes associées
  - Intégration d'une **entité** permettant de stocker les quantités nécessaire pour un item donné
  - Intégration des **utilisateurs** dans l'api 
  - Participation à la création du **livre de recettes** 
  - Participation à la réalisation de **l'algorithme** permettant d'afficher l'arbre d'ingrédients d'un item
  - Participation à la réalisation du **mode de création d'item** pour les utilisateurs premium / **création personnalisé** d'items pour les admins
  - Réalisation de composants de style (sideBar, page de connexion etc.)

### Nathan
  - conception intégrale du mini jeu
  - - logique du jeu
  - - gestion des données (pas le backend mais l'intéraction avec le backend)
  - - style

### Loris C.
  - Implémentation complète de **MyAvatar** (backend & frontend).
  - Gestion du frontend de **SatisCraftory** (gestion des pages, navbar, images, fonts, couleurs, ...).
  - Rédaction d'une mini [documentation](https://docs.google.com/document/d/1wvHHz6K4X--f-7Gzr9sHnywHvXo2VBO10cKy_OfuU14/edit?usp=sharing) pour le style de SatisCraftory (pour que tout le monde utilise les mêmes couleurs, fonts, ...) + aide globale de tailwindcss.

---
## 🔐 Comptes

### 🌐 SatisCraftory

#### 👨‍💼️ Comptes utilisateurs
| Login       | Mot de passe    |
|-------------|-----------------|
| normalUser  | NormalUser1234  |
| premiumUser | premiumUser1234 |

#### 👨‍✈️ Comptes administrateurs
| Login       | Mot de passe    |
|-------------|-----------------|
| admin       | Admin1234       |

### 🙂 MyAvatar

#### ‍👨‍💼️ Comptes utilisateurs
| Login   | Mot de passe |
|---------|--------------|
| cazauxl | AAAAAAa8     |
| test    | AAAAAAa8     |
