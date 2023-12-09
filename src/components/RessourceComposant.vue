<template>
    <div>
        <div>
            <img :src="ressource.logoChemin" :alt="iconName" />
        </div>
        <div>
            <h3>{{ressource.nom}}</h3>
            <p>{{rate}}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// TODO: avoir un truc du style "quantité souhaitée qui indique le nombre d'extracteur 
//       selon le niveau du gisement + celui de l'extracteur"
import type {Ressource} from '@/types'
import { computed, onMounted } from 'vue';
const props = defineProps<{
    ressource: Ressource,
    rate: number
}>()

const iconName = `icon: ${props.ressource.nom}`

</script>