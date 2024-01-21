<template>
    <div class="horizontal">
        <div>
            <ResourceDetail v-for="resource in resources" :resource="resource" />
        </div>
        <div>
            <ItemDetail v-for="item in items" :item="item" />
        </div>
    </div>
</template>

<script setup lang="ts">
import ResourceDetail from '@/components/ResourceDetail.vue';
import ItemDetail from '@/components/itemDetail.vue';

import { useMockStore } from '@/stores/mockStore';
import type { Item, Resource } from '@/types';
import { onMounted, ref } from 'vue';

const resources = ref<Resource[]>([])
const items = ref<Item[]>([])

onMounted(async() => {
    const mock = useMockStore();
    resources.value = mock.resources
    items.value = mock.items
    // resources.value = await getResources()
})
</script>


<style scoped>
.horizontal {
    display: flex;
    flex-direction: row;
}

.horizontal > *:nth-child(2n) {
    margin-left: 10px;
}
</style>