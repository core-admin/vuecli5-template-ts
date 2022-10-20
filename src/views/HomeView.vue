<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <a-button @click="hnadleNavigator"> 跳转到移动端页面 </a-button>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'HomeView',
    setup() {
      return {
        hnadleNavigator() {
          window.location.href = location.origin + '/mobile';
        },
      };
    },
  });
</script>
