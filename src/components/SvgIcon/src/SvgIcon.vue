<template>
  <span :class="['custom-svg-icon', wrapperClass]" :style="computedStyle">
    <svg :class="svgClass" aria-hidden="true">
      <use :xlink:href="iconName" />
    </svg>
  </span>
</template>

<script>
  import { defineComponent, computed } from 'vue';

  // // eslint-disable-next-line no-undef
  const importAll = requireContext => requireContext.keys().forEach(requireContext);
  try {
    importAll(require.context('@/assets/svg-icons', true, /\.svg$/));
  } catch (error) {
    console.log('svgIcon error >>> ', error);
  }

  export default defineComponent({
    name: 'SvgIcon',
    props: {
      name: {
        type: String,
        required: true,
      },
      svgClass: {
        type: String,
        default: '',
      },
      wrapperClass: {
        type: String,
        default: '',
      },
      width: [String, Number],
      height: [String, Number],
      style: Object,
    },
    setup(props) {
      return {
        iconName: computed(() => `#custom-icon-${props.name}`),
        computedStyle: computed(() => {
          const { width, height, style = {} } = props;
          const base = {
            width: typeof width === 'number' ? width + 'px' : width,
            height: typeof height === 'number' ? width + 'px' : height,
          };
          if (width == null || height == null) {
            width ? (base.height = 'auto') : (base.width = 'auto');
          }
          return Object.assign({}, base, style);
        }),
      };
    },
  });
</script>

<style lang="scss">
  .custom-svg-icon {
    display: inline-block;
    color: inherit;
    font-style: normal;
    line-height: 0;
    text-align: center;
    text-transform: none;
    vertical-align: -0.125em;
    text-rendering: optimizeLegibility;
    width: 1em;
    height: 1em;

    svg {
      display: inline-block;
      overflow: hidden;
      width: inherit;
      height: inherit;
      fill: currentColor;
    }

    // &::after {
    //   position: absolute;
    //   top: 0;
    //   right: 0;
    //   bottom: 0;
    //   left: 0;
    //   z-index: 1;
    //   pointer-events: none;
    //   cursor: pointer;
    //   content: '';
    // }
  }
</style>
