<template>
  <div class="p-4 text-center">
    <h1 class="text-3xl text-fuchsia-500"> mobile端 App.Compoent</h1>

    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>

    <div class="m-4">
      <router-view />
    </div>
  </div>
</template>

<script setup></script>
