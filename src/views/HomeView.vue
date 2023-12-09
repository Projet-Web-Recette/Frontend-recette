<template>
    <ul v-for="ressource in mockStore.ressources" :key="ressource.id">
        <li>
            <RessourceComposant :ressource="ressource" :rate="0.2"></RessourceComposant>
        </li>
    </ul>
</template>

<script setup lang="ts">
import {useMockStore} from '@/stores/mockStore'
import RessourceComposant from '@/components/RessourceComposant.vue'


const mockStore = useMockStore()
// onMounted(() => {
// })

</script>