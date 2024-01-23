<template>
    <div class="draggable" @mousedown="dragMouseDown($event)" :style="{
      left: (left - width / 2) + 'px', 
      top: (top - height / 2) + 'px', 
      width: width + 'px',
      height: height + 'px'}"
    >
      <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const initPosition = defineProps<{left: number, top: number, width: number, height: number, disable: () => boolean | false}>()

const top = ref(initPosition.top)
const left = ref(initPosition.left)

let offsetX = 0
let offsetY = 0

let dropX = initPosition.left
let dropY = initPosition.top



const emit = defineEmits<{
  (e: 'updatePos', pos: {x: number, y:number}): void
}>()

function dragMouseDown(e: MouseEvent) {
  if(initPosition.disable()) return

  e.preventDefault();
  e.stopPropagation()
  // get the mouse cursor position at startup:
  document.onmouseup = closeDragElement;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag;

  offsetX = e.clientX
  offsetY = e.clientY
}

function elementDrag(e: MouseEvent) {
  e.preventDefault();

  top.value = dropY + e.clientY - offsetY
  left.value = dropX + e.clientX - offsetX

  
    emit("updatePos", {x: left.value, y: top.value})
//   elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
//   elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
}

function closeDragElement() {
  dropX = left.value
  dropY = top.value
  /* stop moving when mouse button is released:*/
  document.onmouseup = null;
  document.onmousemove = null;
}
</script>


<style>
.draggable {
    position: absolute;
}
</style>