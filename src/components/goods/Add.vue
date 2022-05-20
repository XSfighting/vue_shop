<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>添加商品</el-breadcrumb-item>
  </el-breadcrumb>
<!--  卡片视图区域-->
  <el-card>
<!--    提示区域-->
    <el-alert show-icon title="添加商品信息" center type="info" :closable="false"></el-alert>
<!--    步骤条区域-->
    <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
<!--    Tab栏区域-->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
    <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
      <el-tab-pane label="基本信息" name="0" >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price" type="number">
          <el-input v-model="addForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="addForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="addForm.goods_number"></el-input>
        </el-form-item>

        <el-form-item label="商品分类" prop="goods_cat" >
          <el-cascader v-model="addForm.goods_cat"
              :options="cateList" :props="cateProps"
              @change="handleChange"></el-cascader>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品参数" name="1">
<!--        渲染表单的item项-->
        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
          <el-checkbox-group v-model="item.attr_vals">
            <el-checkbox label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>

          </el-checkbox-group>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品属性" name="2">角色管理</el-tab-pane>
      <el-tab-pane label="商品图片" name="3">
        <el-upload action="https://lianghj.top:8888/api/private/v1/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture" :headers="headersObj"
        :on-success="handleSuccess">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-tab-pane>
      <el-tab-pane label="商品内容" name="4">
<!--        富文本编辑器组件-->
        <quill-editor v-model="addForm.goods_introduce">
        </quill-editor>
        <el-button type="primary" class = "btnAdd" @click="add">添加商品</el-button>
      </el-tab-pane>
      <el-tab-pane label="完成" name="5">定时任务补偿</el-tab-pane>
    </el-tabs>
    </el-form>
  </el-card>

  <el-dialog
      title="提示"
      :visible.sync="previewVisible"
      width="50%">
    <img :src="previePath" alt="" class="previewImg">

  </el-dialog>
</div>
</template>

<script>
import _ from 'lodash'
export default {
  name: "Add",
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_weight: '0',
        goods_number: '0',
        // 商品所属的分类数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
            {required: true, message: '请输入商品的名称', trigger: 'blur'}
        ],
        goods_price: [
            {required: true, message: '请输入商品的价格', trigger: 'blur'}
        ],
        goods_weight: [
            {required: true, message: '请输入商品的重量', trigger: 'blur'}
        ],
        goods_number: [
            {required: true, message: '请输入商品的数量', trigger: 'blur'}
        ],
        goods_cat: [
            {required: true, message: '请选择商品的分类', trigger: 'blur'}
        ],
      },
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      manyTableData: [],
      onlyTableData: [],
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previePath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
   async getCateList() {
    const {data: res} = await this.$http.get('categories')
     if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
     this.cateList = res.data
     console.log(this.cateList);
   },
    // 级联选择器选中项变化会触发
    handleChange() {
      if (this.addForm.goods_cat.length !==3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName,oldActivename) {
      if (oldActivename === '0' && this.addForm.goods_cat.length !== 3 ) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
   async tabClicked() {
     // 证明访问的是动态参数面板
     if (this.activeIndex === '1') {
     const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
         params: { sel: 'many'}
       })
       if (res.meta.status !==200) return this.$message.error('获取数据失败！')
       res.data.forEach(item=> {
         item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
       })
       this.manyTableData = res.data
     }
    },
    handlePreview(file) {
      console.log(file);
      this.previePath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove(file) {
      console.log(file);
     const filePath = file.response.data.tmp_path
     const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath)
      this.addForm.pics.splice(i,1)
      console.log(this.addForm);
    },
    handleSuccess(response) {
     const picInfo = response.data.tmp_path
      this.addForm.pics.push(picInfo)
      console.log(this.addForm);
    },
   async add() {
     this.$refs.addFormRef.validate(async valid=> {
       if (!valid) return this.$message.error('请填写必要的表单项目!')
      const form = _.cloneDeep(this.addForm)
     form.goods_cat = form.goods_cat.join(',')
       this.manyTableData.forEach(item=> {
         const newInfo = {attr_id: item.attr_id,
         attr_value: item.attr_vals.join(' ')}
         this.addForm.attrs.push(newInfo)
       })
       this.onlyTableData.forEach(item => {
         const newInfo = {attr_id: item.attr_id,
           attr_value: item.attr_vals}
         this.addForm.attrs.push(newInfo)
       })
       form.attrs = this.addForm.attrs
      const {data: res} = await this.$http.post('goods',form)
       if (res.meta.status!==201) return this.$message.error('添加商品失败')
       this.$message.error('添加商品成功')
       this.$router.push('/goods')
     })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped>
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>