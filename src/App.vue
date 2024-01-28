<template>
  <header style="position: absolute">
    <!-- Top right corner burger menu that opens a dropdown over body -->
    <button id="burger-button" class="fixed top-0 right-0 material-symbols-outlined hover:text-orange-main transition-all duration-200
    text-white-main p-4 select-none bg-gray-main" @click="burgerActivate = !burgerActivate" :class="{'rotate-90': burgerActivate}">
        {{ burgerActivate ? 'close' : 'menu' }}
    </button>

    <!-- Navbar menu that goes over body -->
    <nav class="flex flex-col justify-center items-center gap-8 fixed top-0 left-0 w-full h-full bg-gray-main flex justify-center items-center z-10" v-if="burgerActivate">
      <div class="flex flex-row justify-center items-center gap-2">
        <img :src="'./src/assets/logo.png'" alt="logo" class="w-32 h-32">
        <p class="text-6xl text-orange-main satisfont select-none">atisCraftory</p>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <a href="" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">home</span>
          Home
        </a>

        <a href="/recipes" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">skillet</span>
          Recipes
        </a>

        <a href="/" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">joystick</span>
          Playground
        </a>

        <a v-if="!authentication.isAuthenticated" href="/login" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">login</span>
          Login
        </a>
        
        <a v-if="authentication.isAuthenticated" @click="authentication.deconnexion" class="flex flex-row items-center gap-3 text-4xl text-white-main satisfont select-none transition-all duration-200">
          <span class="material-symbols-outlined text-4xl text-orange-main">logout</span>
          Logout
        </a>
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

const authentication = authenticationStore()

const burgerActivate = ref(false)
</script>

<style>
#burger-button {
  z-index: 11;
}
</style>