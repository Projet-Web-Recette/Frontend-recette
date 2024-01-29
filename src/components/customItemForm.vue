<template>
    <MDBModal id="showCustomNodeCreateModal" tabindex="-2" labelledby="showCustomNodeCreateModal"
        v-model="showCustomNodeCreateModal">
        <MDBModalHeader>
            <MDBModalTitle id="exampleModalLabel">Create a custom item node</MDBModalTitle>
        </MDBModalHeader>
        <MDBModalBody>
            <MDBInput
                label="Item name"
                v-model="itemName" />
            <MDBInput
                type="file"
                label="Item image"
                v-on:change="onFileChange"
                 />    
        </MDBModalBody>
        <MDBModalFooter>
            <MDBBtn @click="emits('confirmModal', {
                'name':itemName,
                'file': itemImage
            })" color="primary">Confirm</MDBBtn>
        </MDBModalFooter>
    </MDBModal>
</template>



<script setup lang="ts">
import {
    MDBModal,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBBtn,
    MDBInput
} from 'mdb-vue-ui-kit';

import {ref, defineProps, watch} from 'vue';

const props = defineProps<{show: boolean}>()

const emits = defineEmits(["confirmModal", "closeModal"]);

const showCustomNodeCreateModal = ref<boolean>(false);

const itemName = ref<string>('');
const itemImage = ref<any>();


watch(() => props.show, (show) => {
    showCustomNodeCreateModal.value = show;
});

watch(() => showCustomNodeCreateModal.value, (show) => {
    if (!show) emits("closeModal");
});

/**
 * @description retrieve the file when uploaded
 * @param e 
 */
function onFileChange(e:any) {
  let files = e.target.files || e.dataTransfer.files;
  if (!files.length)
    return;
  itemImage.value = files[0];
}


</script>
<style scoped>
    input{
        margin: 2px;
    }
</style>