<script setup lang="ts">

</script>

<template>
  <main>
    <FlashMessage position="right top" time="3000" strategy="multiple" image="./assets/logo.png"/>
    <router-view/>
  </main>
</template>

<style scoped>
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
