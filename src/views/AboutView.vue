<template>
  <div>
    <h1 class="font-bold text-2xl">About {{ count }}</h1>
    <a-button @click="handleAdd">+1</a-button>
  </div>
</template>

<script>
  export default {
    name: 'AboutView',
    data() {
      return {
        count: 1,
      };
    },
    watch: {
      count(value) {
        console.log(value);
        console.log(value + 2);
      },
    },
    methods: {
      handleAdd() {
        // eslint-disable-next-line no-debugger
        debugger;
        this.count++;
      },
    },
  };
</script>
