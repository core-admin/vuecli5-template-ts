<template>
  <div>
    <h1 class="font-bold text-2xl">{{ count }}</h1>
    <a-button @click="handleAdd">+1</a-button>
  </div>
</template>

<script lang="ts">
  export default { name: 'HomeView' };
</script>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  const count = ref(0);

  watch(count, value => {
    // eslint-disable-next-line no-debugger
    debugger;
    console.log(value);
  });

  function handleAdd() {
    count.value++;
  }
</script>
