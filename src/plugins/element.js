import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'

import {Form,FormItem,Input,Button,Message} from 'element-ui'

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)

// $message是自定义属性，可以任意改名字，只要合法就行
Vue.prototype.$message = Message
