<template>
    <div id="login">
        <form  @submit.prevent="register">
            <div>
                <label>Name</label>
                <input v-model="resource.name" >
            </div> 
            <div>
                <label>Image</label>
                <input type="input" v-model="resource.logoPath" > 
            </div> 
            <button type="submit">
                Register
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { sendRequest } from '@/helpers/api';
import { authenticationStore } from '@/stores/authenticationStore';
import {ref} from 'vue'; 
const resource = ref({
    name: "",
    quality:"",
    logoPath: ""
});


const authentication = authenticationStore()

async function register() {
    try {
        if(authentication.isAuthenticated){
            // registerResource
        }
    } catch(e) {
        console.error(e)
    }
}

</script>