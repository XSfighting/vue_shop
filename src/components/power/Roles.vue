<template>
<div>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
      </el-col>
    </el-row>

    <el-table :data="rolesList" border stripe>
      <el-table-column type="expand">
        <template v-slot="scope">
          <el-row :class="['bdbottom',index1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
            <!--            渲染一级权限-->
            <el-col :span="5">
              <el-tag closable @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!--            渲染二级和三级权限-->
            <el-col :span="19">
              <el-row :class="[index2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2, index2) in item1.children"  :key="item2.id">
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRightsById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag type="warning" v-for="(item3,index3) in item2.children" closable
                  @close="removeRightsById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>

          </el-row>



<!--         <pre>{{scope.row}}</pre>-->
        </template>
      </el-table-column>
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="300px">
        <template v-slot="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRolesVisible = true">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.roleId)">删除</el-button>
          <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialogue(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
<!--  添加角色对话框-->
  <el-dialog title="修改角色" :visible.sync="addRolesVisible" width="35%"  @close="addRolesClosed">
    <!--    内容主体区-->
    <el-form :model="addRoles" :rules="editRolesRules" ref="addRolesRef" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="addRoles.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="addRoles.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <!--    底部区-->
    <span slot="footer" class="dialog-footer">
    <el-button @click="addRolesVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRolesInfo">确 定</el-button>
  </span>
  </el-dialog>
<!--修改角色对话框-->
  <el-dialog title="修改角色" :visible.sync="editRolesVisible" width="35%"  @close="editRolesClosed">
    <!--    内容主体区-->
    <el-form :model="editRoles" :rules="editRolesRules" ref="editRolesRef" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="editRoles.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="editRoles.roleDesc"></el-input>
      </el-form-item>
    </el-form>
    <!--    底部区-->
    <span slot="footer" class="dialog-footer">
    <el-button @click="editRolesVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRolesInfo">确 定</el-button>
  </span>
  </el-dialog>


<!--  分配权限对话框-->

  <el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree :data="rightsList" :props="treeProps"
               show-checkbox node-key="id" default-expand-all
               :default-checked-keys = 'defKeys' ref="treeRef"
      ></el-tree>


    <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
  </el-dialog>

</div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      rightsList: [],
      addRoles: {},
      addRolesVisible: false,
      editRoles: {},
      editRolesRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
          {min: 3, max: 10, message: '角色名称的长度在3~10个字符之间', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'},
          {min: 5, max: 20, message: '角色描述的长度在5~20个字符之间', trigger: 'blur'}
        ]
      },
      editRolesVisible: false,
      setRightDialogVisible: false,
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
   async getRolesList() {
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
     this.$message.success('获取角色列表成功！')
   },
    addRolesInfo() {
      this.$refs.addRolesRef.validate(async valid=> {
        if (!valid) return
        const {data: res} = await this.$http.post('roles',this.addRoles)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        }
        this.$message.success('添加角色成功！')
        this.addRolesVisible = false
        this.getRolesList()
      })

    },
    addRolesClosed() {
     this.$refs.addRolesRef.resetFields()
    },
    editRolesClosed() {
      this.$refs.editRolesRef.resetFields()
    },
    setRightDialogClosed() {
     this.defKeys = []
    },
    editRolesInfo() {
     this.$refs.editRolesRef.validate(async valid=> {
       if (!valid) return
       const {data: res} = await this.$http.put('roles/'+ this.editRoles.roleId,{
         roleName: this.editRoles.roleName,
         roleDesc: this.editRoles.roleDesc
       })
       if (res.meta.status !== 200) {
         return this.$message.error('修改角色信息失败！')
       }
       this.editRolesVisible = false
       this.getRolesList()
     })
    },
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=> err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    async removeRightsById(role,rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=> err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
   const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}` )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      role.children = res.data
    },
    async showSetRightDialogue(role) {
     this.roleId =role.id
      const {data: res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败！')
      }
      this.rightsList = res.data
      console.log(this.rightsList);
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true
    },
    getLeafKeys(node,arr) {
     if(!node.children) {
       return arr.push(node.id)
     }
     node.children.forEach(item=> {
       this.getLeafKeys(item,arr)
     })


    },
    async allotRights() {
     const keys = [
       ...this.$refs.treeRef.getCheckedKeys(),
       ...this.$refs.treeRef.getHalfCheckedKeys()
     ]
      console.log(keys);
     const idStr = keys.join(',')
      const {data: res} = await
      this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
     }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false

    }







  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>