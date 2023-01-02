import SvgIcon from './src/SvgIcon.vue';

const importAll = (requireContext: any) => requireContext.keys().forEach(requireContext);
try {
  importAll((require as any).context('@/assets/icons/svg-icons', true, /\.svg$/));
} catch (error) {
  console.log('svgIcon import error >>> ', error);
}

export { SvgIcon };

/**
 * 描述：移除一些svg中包含的属性，比如：fill
 */
