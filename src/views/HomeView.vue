<template>
  <div class="loginFormContainer">
    <MDBTabs v-model="form7ActiveTab">
      <!-- Tabs navs -->
      <MDBTabNav pills justify tabsClasses="mb-3" class="buttonsLoginForm">
        <MDBTabItem tabId="form7-login" href="form7-login">Log in</MDBTabItem>
        <MDBTabItem tabId="form7-register" href="form7-register">Register</MDBTabItem>
      </MDBTabNav>
      <!-- Tabs navs -->
      <!-- Tabs content -->
      <MDBTabContent>
        <MDBTabPane tabId="form7-login">
          <form>

            <!-- Email input -->
            <MDBInput
                type="text"
                label="Username"
                id="form7LoginUsername"
                v-model="form7LoginUsername"
                wrapperClass="mb-4"
            />

            <!-- Password input -->
            <MDBInput
                type="password"
                label="Password"
                id="form7LoginPassword"
                v-model="form7LoginPassword"
                wrapperClass="mb-4"
            />

            <!-- 2 column grid layout for inline styling -->

            <!-- Submit button -->
            <MDBBtn color="primary" block class="mb-4" @click="loginSubmit"> Sign in</MDBBtn>

          </form>
        </MDBTabPane>
        <MDBTabPane tabId="form7-register">
          <form>

            <!-- Username input -->
            <MDBInput
                type="text"
                label="Username"
                id="form7RegisterUsername"
                v-model="form7RegisterUsername"
                wrapperClass="mb-4"
            />

            <!-- Email input -->
            <MDBInput
                type="email"
                label="Email"
                id="form7RegisterEmail"
                v-model="form7RegisterEmail"
                wrapperClass="mb-4"
            />

            <!-- Password input -->
            <MDBInput
                type="password"
                label="Password"
                id="form7RegisterPassword"
                v-model="form7RegisterPassword"
                wrapperClass="mb-4"
            />

            <!-- Repeat Password input -->
            <MDBInput
                type="password"
                label="Repeat password"
                id="form7RegisterPasswordRepeat"
                v-model="form7RegisterPasswordRepeat"
                wrapperClass="mb-4"
            />

            <!-- Submit button -->
            <MDBBtn color="primary" block class="mb-3" @click="registerSubmit">
              Sign in
            </MDBBtn>
          </form>
        </MDBTabPane>
      </MDBTabContent>
      <!-- Tabs content -->
    </MDBTabs>
  </div>
</template>

<script setup lang="ts">
import {useMockStore} from '@/stores/mockStore'
import {MDBBtn, MDBInput, MDBTabContent, MDBTabItem, MDBTabNav, MDBTabPane, MDBTabs,} from "mdb-vue-ui-kit";
import {storeAuthentification} from "@/stores/storeAuthentification";
import {ref} from "vue";
import {useRouter} from "vue-router";

const form7ActiveTab = ref("form7-login");

const form7LoginUsername = ref("");
const form7LoginPassword = ref("");

const form7RegisterUsername = ref("");
const form7RegisterEmail = ref("");
const form7RegisterPassword = ref("");
const form7RegisterPasswordRepeat = ref("");


const router = useRouter();


const mockStore = useMockStore()
// onMounted(() => {
// })

function loginSubmit() {
  if (form7LoginUsername.value !== "" && form7LoginPassword.value !== "") {
    storeAuthentification.connexion(form7LoginUsername.value, form7LoginPassword.value, () => {
      router.push({path:'/'});
    }, () => {
      console.log('Echec');
    });
  }
}

function registerSubmit() {

}

</script>