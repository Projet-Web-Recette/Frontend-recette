<template>
  <header style="position: absolute">
    <!-- Top right corner burger menu that opens a dropdown over body -->
    <div class="fixed top-0 right-0 material-symbols-outlined text-white-main p-4 select-none bg-gray-main z-[101]
      flex flex-col justify-center items-center gap-2 rounded-xl m-2" v-if="authentication.isAuthenticated">
      <button id="burger-button" class="transition-all duration-200 hover:text-orange-main" @click="burgerActivate = !burgerActivate" :class="{'rotate-90': burgerActivate}">
        {{ burgerActivate ? 'close' : 'menu' }}
      </button>
      <img :src="`https://webinfo.iutmontp.univ-montp2.fr/~cazauxl/MyAvatar/public/avatar/${email}`" class="rounded-full"
           width="20" height="20">
    </div>

    <!-- Navbar menu that goes over body -->
    <nav class="flex flex-col justify-center items-center gap-8 fixed top-0 left-0 w-full h-full bg-gray-main flex justify-center items-center z-[100]" v-if="burgerActivate">
      <div class="flex flex-row justify-center items-center gap-2">
        <img :src="'/src/assets/logo.png'" alt="logo" class="w-32 h-32">
        <p class="text-6xl text-orange-main satisfont select-none">atisCraftory</p>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <router-link :to="{name: 'recipes'}" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main" @click="hideMenu">skillet</span>
          Recipes
        </router-link>

        <a href="/" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">joystick</span>
          Playground
        </a>

        <a v-if="!authentication.isAuthenticated" href="/login" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">login</span>
          Login
        </a>
        
        <a v-if="authentication.isAuthenticated" @click="deconnexion" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">logout</span>
          Logout
        </a>

        <div v-if="authentication.isAuthenticated" class="mt-10 flex flex-col justify-center items-center text-white-main">
          <p>Pas d'image de profil ?</p>
          <a href="https://webinfo.iutmontp.univ-montp2.fr/~cazauxl/MyAvatar/public/" class="text-orange-main hover:underline hover:text-orange-main">Essayez MyAvatar</a>
        </div>
      </div>
    </nav>
  </header>

  <main>
    <FlashMessage position="right top" time="3000" strategy="multiple" image="./assets/logo.png"/>
    <router-view/>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authenticationStore } from './stores/authenticationStore';
import { flashMessage } from '@smartweb/vue-flash-message';
import router from './router';

const authentication = authenticationStore()

const burgerActivate = ref(false)

const email = ref<string>('');
if(authentication.hashedEmail === '') email.value = 'e';
else email.value = authentication.hashedEmail;

/**
 * @description disconnect the user and redirect to login
 */
function deconnexion(){
  authentication.deconnexion(() => {
    flashMessage.show({
        type: 'success',
        title: "",
        text: 'You have been successfully disconnected',
        image: '/src/assets/flash-messages-logo/success.svg',
      });
      burgerActivate.value = false;
      router.push('/login')
  })
}

function hideMenu(){
  console.log('ok')
  burgerActivate.value = false;
}

</script>