
<template>
    <div>
        <ResourceDetail v-for="resource in resources" :resource="resource">
        </ResourceDetail>
    </div>
    <div style="width 200px; height: 400px; background-color: lightcyan;">
        <ItemReceipeVue></ItemReceipeVue>
    </div>
</template>


<script setup lang="ts">
import ItemReceipeVue from '@/components/ItemReceipe.vue';
import ResourceDetail from '@/components/ResourceDetail.vue';
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