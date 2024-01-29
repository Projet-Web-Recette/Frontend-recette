<template>
  <div class="relative flex flex-col justify-center min-h-screen overflow-hidden">
    <div class="w-full p-6 m-auto bg-white border-orange-600 border rounded-md shadow-lg shadow-orange-800/50 lg:max-w-md space-y-10">
      <div class="flex flex-row justify-center items-center gap-2">
        <img :src="'/src/assets/logo.png'" alt="logo" class="w-15 h-15">
        <p class="text-3xl text-orange-main satisfont select-none">atisCraftory</p>
      </div>

      <form class="space-y-8">
        <div>
          <label for="login" class="block text-sm text-gray-800">Login</label>
          <input type="login"
            class="block w-full px-4 py-2 mt-2 text-orange-700 bg-white border-2 rounded-md focus:border-orange-400 focus:ring-orange-300 focus:outline-none focus:ring focus:ring-opacity-40"
            v-model="form7LoginUsername">
        </div>

        <div>
          <label for="password" class="block text-sm text-gray-800">Password</label>
          <input type="password"
            class="block w-full px-4 py-2 mt-2 text-orange-700 bg-white border-2 rounded-md focus:border-orange-400 focus:ring-orange-300 focus:outline-none focus:ring focus:ring-opacity-40"
            v-model="form7LoginPassword">
        </div>

        <div v-if="isRegistering">
          <label for="email" class="block text-sm text-gray-800">Email address</label>
          <input type="email"
            class="block w-full px-4 py-2 mt-2 text-orange-700 bg-white border-2 rounded-md focus:border-orange-400 focus:ring-orange-300 focus:outline-none focus:ring focus:ring-opacity-40"
            v-model="form7RegisterEmail">
        </div>

        <div>
          <button type="button"
            class="mt-4 w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:bg-orange-600"
            @click="loginSubmit">
            {{ formButtonNameSubmit }}
          </button>
        </div>
      </form>
      <p class="text-xs font-light text-center text-gray-700"> {{ formSwitchFormName }} <a @click="switchForm"
          href="#" class="font-medium text-orange-600 hover:underline">{{ formSwitchFormLinkName }}</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMockStore } from '@/stores/mockStore'
import { authenticationStore } from "@/stores/authenticationStore";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { flashMessage } from '@smartweb/vue-flash-message';

const form7ActiveTab = ref("form7-login");

const form7LoginUsername = ref("");
const form7LoginPassword = ref("");


const form7RegisterUsername = ref("");
const form7RegisterEmail = ref<string>("");
const form7RegisterPassword = ref("");
const form7RegisterPasswordRepeat = ref("");

const formButtonNameSubmit = ref<string>("Login");
const formSwitchFormName = ref<string>("Don't have an account ?");
const formSwitchFormLinkName = ref<string>("Sign up");

const isRegistering = ref<boolean>(false);


const router = useRouter();


const mockStore = useMockStore()

async function loginSubmit() {
  const authentication = authenticationStore()
  if (form7LoginUsername.value !== "" && form7LoginPassword.value !== "") {
  
    let register = true;

    if (isRegistering.value){
      if (form7RegisterEmail.value === "") return;
    }

    console.log("ok")
      

    if (isRegistering.value) {
      await authentication.register(
        form7LoginUsername.value,
        form7LoginPassword.value,
        form7RegisterEmail.value,
        () => { 
          register = false;
          console.error('register not working'); 
        }
      )
    }

    if (!register) return;

    
    await authentication.login(form7LoginUsername.value, form7LoginPassword.value, () => {
      console.log('Echec');
    });

    if (authentication.isAuthenticated) {
      router.push({ path: '/' });
      flashMessage.show({
        type: 'success',
        title: "",
        text: 'You have been successfully connected',
        image: '/src/assets/flash-messages-logo/success.svg',
      });
    }
  }
}

async function registerSubmit() {
  const authentication = authenticationStore()

  if (form7RegisterPassword.value === form7RegisterPasswordRepeat.value) {

  }
}

function switchForm() {
  isRegistering.value = !isRegistering.value;

  formButtonNameSubmit.value = isRegistering.value ? "Register" : "Login";

  formSwitchFormName.value = isRegistering.value ? "Already have an account ?" : "Don't have an account ?";

  formSwitchFormLinkName.value = isRegistering.value ? "Log in" : "Sign up";
}

</script>