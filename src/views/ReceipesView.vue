
<template>
    <div>
        <ResourceDetail v-for="resource in resources" :resource="resource">
        </ResourceDetail>
    </div>
</template>


<script setup lang="ts">
import ResourceDetail from '@/components/ResourceDetail.vue';
import { getResources } from '@/helpers/api';
import { useMockStore } from '@/stores/mockStore';
import type { Resource } from '@/types';
import { onMounted, ref } from 'vue';


const resources = ref<Resource[]>([])

onMounted(async() => {
    const mock = useMockStore();
    resources.value = mock.resources
    // resources.value = await getResources()
})
</script>