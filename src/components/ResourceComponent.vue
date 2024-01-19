<template>
    <div>
        <div>
            <img :src="resource.logoPath" :alt="iconName" />
        </div>
        <div>
            <h3>{{resource.name}}</h3>
            <p>{{taux}}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// TODO: avoir un truc du style "quantité souhaitée qui indique le nombre d'extracteur 
//       selon le niveau du gisement + celui de l'extracteur"
import type {Resource} from '@/types'
const props = defineProps<{
    resource: Resource,
    taux: number
}>()

const iconName = `icon: ${props.resource.name}`

</script>