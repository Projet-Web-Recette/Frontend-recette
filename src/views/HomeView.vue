<template>
    <ul v-for="ressource in mockStore.ressources" :key="ressource.id">
        <li>
            {{ressource.nom}}
        </li>
    </ul>
</template>

<script setup lang="ts">
import {useMockStore} from '@/stores/mockStore'


const mockStore = useMockStore()
// onMounted(() => {
// })

</script>