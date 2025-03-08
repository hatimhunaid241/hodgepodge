<template>
  <div v-if="product">
    <div class="img-wrap">
      <img :src="product.imageUrl" />
    </div>
    <div class="product-details">
      <h1>{{ product.name }}</h1>
      <h3 class="price">{{ product.price }}</h3>
      <button class="add-to-cart" @click="addToCart" v-if="!itemIsInCart && user">
        Add to cart
      </button>
      <button class="grey-button" v-if="user && itemIsInCart">Item is already in cart</button>
      <button class="sign-in" @click="signIn" v-if="!user">Sign in to add to cart</button>
    </div>
  </div>
  <div v-else>
    <NotFoundPage />
  </div>
</template>

<script>
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import NotFoundPage from "./NotFoundPage.vue";
import axios from "axios";
export default {
  name: "ProductDetailPage",
  props: ["user"],
  components: {
    NotFoundPage,
  },
  data() {
    return {
      product: {},
      cartItems: [],
    };
  },
  computed: {
    itemIsInCart() {
      console.log(this.cartItems);
      return this.cartItems.some((item) => item.id === this.$route.params.productId);
    },
  },
  watch: {
    user(newUserValue) {
      if (newUserValue) {
        this.fetchCartItems(newUserValue.uid);
      }
    },
  },
  methods: {
    async fetchCartItems(userId) {
      try {
        const cartResponse = await axios.get(`/api/users/${userId}/cart`);
        this.cartItems = cartResponse.data;
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    },
    async addToCart() {
      await axios.post(`/api/users/${this.user.uid}/cart`, {
        id: this.$route.params.productId,
      });
      alert("Successfully added item to cart");
    },
    async signIn() {
      const email = prompt("Please enter you email to sign in:");
      const auth = getAuth();
      const actionCodeSettings = {
        url: `http://localhost:8080/products/${this.$route.params.productId}`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      alert("A login link was sent to the email you provided");
      window.localStorage.setItem("emailForSignIn", email);
    },
  },
  async created() {
    const auth = getAuth();
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem("emailForSignIn");
      const result = await signInWithEmailLink(auth, email, window.location.href);
      console.log("User signed in:", result.user);
      alert("Successfully signed in!");
      window.localStorage.removeItem("emailForSignIn");
    }
    const response = await axios.get(`/api/products/${this.$route.params.productId}`);
    const product = response.data;
    this.product = product;

    if (this.user) {
      const cartResponse = await axios.get(`/api/users/${this.user.uid}/cart`);
      const cartItems = cartResponse.data;
      this.cartItems = cartItems;
    }
  },
};
</script>
