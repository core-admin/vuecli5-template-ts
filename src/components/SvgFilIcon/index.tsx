import { defineComponent } from 'vue';
import { SvgIcon } from '../SvgIcon';

const importAll = (requireContext: any) => requireContext.keys().forEach(requireContext);
try {
  importAll((require as any).context('@/assets/icons/svg-fill-icons', true, /\.svg$/));
} catch (error) {
  console.log('svgFillIcon import error >>> ', error);
}

export const SvgFillIcon = defineComponent<InstanceType<typeof SvgIcon>['$props']>({
  setup(props) {
    return () => {
      return (
        <SvgIcon
          {...{
            ...props,
            prefixId: 'svg-fill-icon',
          }}
        />
      );
    };
  },
});

/**
 * https://www.5axxw.com/questions/content/68od8f
 * https://www.xiaoboy.com/topic/202203210830.html
 *
 * 描述：保持svg所有属性，不做属性特殊处理
 */
