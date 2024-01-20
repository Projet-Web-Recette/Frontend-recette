<template>
  <router-view/>
</template>


<script setup lang="ts">
import {authenticationStore} from "@/stores/authenticationStore";
import {useRoute, useRouter} from "vue-router";


const router = useRouter();
const route = useRoute();

const authentication = authenticationStore()


if (!authentication.isAuthenticated) {
  router.push({path: "/login"})
}

</script>


