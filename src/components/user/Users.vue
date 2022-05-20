<template>

<div>
<!--  面包屑导航区域-->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
<!-- 卡片视图区域 -->
  <el-card>
    <!--  搜索与添加区-->
    <el-row :gutter="20">
      <el-col :span="7">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
          <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>
<!--用户列表区域-->
    <el-table :data="userList" style="width: 100%" stripe border>
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="姓名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态" prop="mg_state">
        <template v-slot="scope">
          <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949"
          @change="userStateChanged(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template v-slot="scope">
          <el-tooltip  effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.id)"></el-button>
          </el-tooltip>
          <el-tooltip  effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
          </el-tooltip>
          <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini"
                       @click="setRole(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
<!--    分页区域-->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
  </el-card>

<!--添加用户的对话框-->
  <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
<!--    内容主体区-->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
      </el-form-item>
    </el-form>
<!--    底部区-->
    <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
  </el-dialog>

  <!--修改用户信息的对话框-->
  <el-dialog title="修改信息" :visible.sync="editDialogVisible" width="50%"  @close="editDialogClosed">
    <!--    内容主体区-->
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <!--    底部区-->
    <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
  </el-dialog>

<!--  分配角色的对话框-->
  <el-dialog title="分配角色" :visible.sync="allotRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
    <div>
      <p>当前的用户 : {{userInfo.username}}</p>
      <p>当前的角色 : {{userInfo.role_name}}</p>
      <p>分配新角色 :
        <el-select v-model="selectedRoleId" placeholder="请选择" >
          <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
          </el-option>
        </el-select>
      </p>
    </div>
    <span slot="footer" class="dialog-footer">
    <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
  </el-dialog>

</div>
</template>

<script>
export default {
  name: "User",
  data() {
    // 验证邮箱的规则
    var checkEmai = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法邮箱
        return cb()
      } else {
        cb(new Error('请输入合法的邮箱'))
      }
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      //返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      //  获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      allotRoleDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',

      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmai, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      editForm: [],
      editFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmai, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      userInfo: {},
      rolesList: [],
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const {data: res} = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error("获取用户列表失败!")
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败!')
      } else {
        this.$message.success('更新用户状态成功！')

      }
    },
    // 监听添加用户对话框的关闭事件的事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    setRoleDialogClosed() {
      this.selectedRoleId = '',
          this.userInfo = {}
    },
    // 点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('users', this.addForm)
        if (res.meta.state !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 点击按钮查询用户信息
    async showEditDialog(id) {
      const {data: res} = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
      this.$message.success('查询用户信息成功！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editUserInfo() {
     this.$refs.editFormRef.validate( async valid=> {
       if (!valid) return Error
       const {data: res} = await this.$http.put('users/' + this.editForm.id, {
         email: this.editForm.email,
         mobile: this.editForm.mobile
       })
       if (res.meta.status !== 200) {
         return this.$message.error('更新用户信息失败！')
       }
       // 关闭对话框
       this.editDialogVisible = false
       // 刷新数据列表
       this.getUserList()
       // 提示修改成功
       this.$message.success('更新用户信息成功!')

     })
    },
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=> err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
       const {data: res} = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    async setRole(userInfo) {
      console.log(userInfo);
      this.userInfo = userInfo
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败")
      }
      this.rolesList = res.data
      console.log(this.rolesList);
      this.allotRoleDialogVisible = true
    },
   async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId})
     if (res.meta.status !== 200) {
       return this.$message.error('更新角色列表失败！')
     }
     this.$message.success('更新角色列表成功')
     this.getUserList()
     this.allotRoleDialogVisible = false
    }
  }
}
</script>

<style scoped>

</style>