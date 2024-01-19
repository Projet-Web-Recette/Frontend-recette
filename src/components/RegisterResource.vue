<template>
    <form @submit.prevent="enregistrer">
        <label for="nom">Nom</label>
        <input type="text" id="nom" name="nom" v-model="resource.name" />

        <label for="logoChemin">Logo</label>
        <input type="text" id="logoChemin" name="logoChemin" v-model="resource.logoPath" />

        <label for="qualite">Qualité</label>
        <select id="qualite" name="qualite" v-model="resource.quality">
            <option value="impur">Impur</option>
            <option value="pur">Pur</option>
            <option value="tresPur">Très pur</option>
        </select>

        <button type="submit">Enregistrer</button>
    </form>
</template>

<script setup lang="ts">
import type { Resource } from '@/types';
import {registerResource} from '@/helpers/api'
import { ref } from 'vue';

const resource = ref<Resource>({
    name: '',
    logoPath: '',
    quality: 'impur',
})
const enregistrer = () => {
    registerResource(resource.value)
}

</script>
