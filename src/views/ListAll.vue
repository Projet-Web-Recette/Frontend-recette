<template>
    <ul v-for="resource in resources" :key="resource.id">
        <li>
            <ResourceComponent :resource="resource" :taux="0.2"></ResourceComponent>
        </li>
    </ul>
</template>

<script setup lang="ts">
import { getResources } from '@/helpers/api';

import { onMounted, ref } from 'vue';
import type { Resource } from '@/types';
import ResourceComponent from '@/components/ResourceComponent.vue';

// const mockStore = useMockStore()

const resources = ref<Resource[]>([])
onMounted(async () => {
    resources.value = await getResources();
})
</script>