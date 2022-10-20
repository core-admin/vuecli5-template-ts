<template>
  <div>
    <h2 class="text-xl">AboutView.Page</h2>
    <button @click="hnadleNavigator"> 跳转到移动端页面 </button>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'AboutView',
    setup() {
      return {
        hnadleNavigator() {
          window.location.href = location.origin + '/about';
        },
      };
    },
  });
</script>
