
<template>
    <div v-if="itemReceipe" id="receipe">
        <ItemReceipeVue :item="itemReceipe"></ItemReceipeVue>
    </div>
</template>


<script setup lang="ts">
import ItemReceipeVue from '@/components/ItemReceipe.vue';
import { useMockStore } from '@/stores/mockStore';
import type { Item } from '@/types';
import { getItem } from '@/helpers/api';
import { onMounted, ref } from 'vue';


const items = ref<Item[]>([])
const itemReceipe = ref<Item>()

onMounted(async() => {
    /*
    const mock = useMockStore();
    items.value = mock.items
    if(items.value.length > 0){
        itemReceipe.value = items.value[0]
    }
    */
    // resources.value = await getResources()

    const item = await getItem(6);

    console.log(item)
    
    itemReceipe.value = item;

    
})
</script>

<style scoped>
#receipe {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%; 
    height: 100%;
    background-color: lightcyan;
}
</style>