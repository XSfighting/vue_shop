<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--  搜索与添加区-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goodsDialogVisible = true">添加商品</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table :data="goodsList" style="width: 100%" stripe border>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="600px"></el-table-column>
        <el-table-column label="价格(元)" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="180px" ></el-table-column>
        <el-table-column label="操作" width="180px" >
          <template v-slot="scope">
            <el-tooltip  effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip  effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--    分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[10, 50, 100]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total= 'total'>
      </el-pagination>
    </el-card>


    <el-dialog title="添加商品" :visible.sync="goodsDialogVisible" width="50%" @close="goodsDialogClosed">
      <!--    内容主体区-->
      dkv
      <!--    底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="goodsDialogVisible = false">取 消</el-button>
    <el-button type="primary" goodsDialogVisible = false>确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "List",
  data() {
    return {
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0,
      goodsDialogVisible: false,
      goodsForm: [],

    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods',{
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(res);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagenum = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    goodsDialogClosed() {
      this.$refs.goodsFormRef.resetFields()
    },
    // addGoods() {
    //
    // }





  },
}
</script>

<style scoped>

</style>