<template>
  <h1>Shopping Cart</h1>
  <div v-if="cartItems.length">
    <ShoppingCartList @remove-from-cart="removeFromCart($event)" :products="cartItems" />
    <button class="checkout-button">Proceed to Checkout</button>
  </div>
  <div v-else>You have no items in your cart</div>
</template>

<script>
import axios from "axios";
import ShoppingCartList from "@/components/ShoppingCartList.vue";
export default {
  name: "ShoppingCartPage",
  props: ["user"],
  components: {
    ShoppingCartList,
  },
  data() {
    return {
      cartItems: [],
    };
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
    async removeFromCart(productId) {
      const response = await axios.delete(`/api/users/${this.user.uid}/cart/${productId}`);
      const cartItems = response.data;
      this.cartItems = cartItems;
    },
  },
  async created() {
    if (this.user) {
      const response = await axios.get(`/api/users/${this.user.uid}/cart`);
      const cartItems = response.data;
      this.cartItems = cartItems;
    }
  },
};
</script>
