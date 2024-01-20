<script setup lang="ts">
import {storeAuthentification} from "@/stores/storeAuthentification";

console.log(storeAuthentification.isAdmin);

</script>

<template>
  <main>
    <div>JEU DE L'ANNEE !</div>
  </main>
</template>

<style>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
}


</style>
