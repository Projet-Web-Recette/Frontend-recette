<template>
    <div class="draggable" @mousedown="dragMouseDown($event)" :style="{
      left: (left - width / 2) + 'px', 
      top: (top - height / 2) + 'px', 
      width: width !== 0 ? width + 'px' : 'fit-content',
      height: height + 'px'}"
    >
      <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const initPosition = defineProps<{
  left: number,
  top: number, 
  width: number, 
  height: number, 
  disable: () => boolean | false
}>()

let offsetX = 0
let offsetY = 0

let dropX = initPosition.left
let dropY = initPosition.top

let x = 0
let y = 0


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
  
  let x = dropX + e.clientX - offsetX
  let y = dropY + e.clientY - offsetY

  emit("updatePos", {x, y})
  
  //   elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
  //   elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
}

function closeDragElement() {
  dropX = x
  dropY = y
  
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