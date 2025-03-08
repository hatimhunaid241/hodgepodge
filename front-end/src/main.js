import { createApp } from "vue";
import App from "./App.vue";
import "./assets/css/main.css";

import * as VueRouter from "vue-router";
import ShoppingCartPage from "./pages/ShoppingCartPage.vue";
import ProductsPage from "./pages/ProductsPage.vue";
import ProductDetailPage from "./pages/ProductDetailPage.vue";
import NotFoundPage from "./pages/NotFoundPage.vue";

import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyDuG7WYakYnPTCfcrEzMIk0cKq3x_eXtrg",
  authDomain: "hodgepodge-e31f9.firebaseapp.com",
  projectId: "hodgepodge-e31f9",
  storageBucket: "hodgepodge-e31f9.firebasestorage.app",
  messagingSenderId: "157238792780",
  appId: "1:157238792780:web:9292a873629e8fd0c55ae9",
  measurementId: "G-5556J623FS",
};

// Initialize Firebase
initializeApp(firebaseConfig);

createApp(App)
  .use(
    VueRouter.createRouter({
      history: VueRouter.createWebHistory(process.env.BASE_URL),
      routes: [
        {
          path: "/cart",
          component: ShoppingCartPage,
        },
        {
          path: "/products",
          component: ProductsPage,
        },
        {
          path: "/products/:productId",
          component: ProductDetailPage,
        },
        {
          path: "/",
          redirect: "/products",
        },
        {
          path: "/:pathMatch(.*)*",
          component: NotFoundPage,
        },
      ],
    })
  )
  .mount("#app");
