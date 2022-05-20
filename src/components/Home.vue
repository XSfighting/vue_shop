<template>
  <el-container>
    <el-header >
      <div>
        <img src="@/assets/img/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
<!--      侧边栏区域-->
      <el-aside :width="isCollapse? '64px' : '200px'" >
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff"
                 active-text-color="#409EFF" unique-opened :collapse="isCollapse"
                 :collapse-transition="false" :router="true" :default-active="activePath">
                    <!--一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                   <!--一级菜单模板区-->
            <template slot="title">
                    <!--图标-->
              <i :class="iconsObj[item.id]"></i>
                    <!--文本-->
              <span>{{item.authName}}</span>
            </template>

            <!--二级菜单-->
            <el-menu-item :index="'/' + subItem.path+''" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path+'')">
              <!--二级菜单模板区-->
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
            </el-submenu>
        </el-menu>
      </el-aside>


      <el-main>
    <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>


</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.menuList = res.data
    },
    // 点击按钮折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
     window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373D41;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header div span {
  margin-left: 15px;
}

.el-aside {
  background-color: #333744;
}
.el-menu {
  border-right: none;
}
.el-main {
  background-color: #FFF;
}
.iconfont {
  margin-right: 10px;
}
.toggle_button {
  background-color: #4A5064;
  text-align: center;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  letter-spacing: .2em;
  cursor: pointer;
}
</style>