import type { App } from 'vue';
// 将常用的ant-design-vue的组件注册成全局的
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Image,
  Layout,
  Modal,
  PageHeader,
  Pagination,
  Popconfirm,
  Popover,
  Radio,
  Row,
  Select,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Tooltip,
} from 'ant-design-vue';

function setupAntDesignVue(app: App) {
  [
    Avatar,
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Drawer,
    Dropdown,
    Empty,
    Form,
    Input,
    Image,
    Layout,
    Modal,
    PageHeader,
    Pagination,
    Popconfirm,
    Popover,
    Radio,
    Row,
    Select,
    Spin,
    Switch,
    Table,
    Tabs,
    Tag,
    TimePicker,
    Tooltip,
  ].forEach(comp => app.use(comp));
}

export const registerGlobalComponents = (app: App) => {
  setupAntDesignVue(app);
};
