<template>
    <div class="inventoryItem">
        <p>{{ item.name }}</p>
        <div class="inventoryQuantity">
          <p>{{ quantity }}</p>
        </div>
        <img :src="item.logoPath">
      </div>
</template>

<script setup lang="ts">
import type { Item } from '@/types';

const test = defineProps<{item: Item, quantity: number}>()

</script>

<style>
.inventoryItem {
  position: relative;
  width: 120px;
  margin: 3px;
  padding: 3px;
  border-radius: 5px;
  background-color: #707070;
}

.inventoryItem > p {
  margin-bottom: 1px;
}

.inventoryQuantity {
  background-color: #707070;
  width: 32px;
  height: 32px;
  position: absolute;
  text-align: center;
  bottom: 0px;
  right: 0px;
}

.inventoryItem > img {
  width: 50px;
}
</style>