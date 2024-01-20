<template>
  <router-view/>
</template>


<script setup lang="ts">
import {storeAuthentification} from "@/stores/storeAuthentification";
import {useRoute, useRouter} from "vue-router";


const router = useRouter();
const route = useRoute();


if (!storeAuthentification.estConnecte) {
  router.push({path: "/login"})
}

</script>


