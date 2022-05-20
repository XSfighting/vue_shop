<template>
<div class="login">
  <div class="login_box">
<!--    头像区域-->
    <div class="avatar_box">
      <img src="../assets/img/logo.svg" alt="">
    </div>
<!--表单区区域-->
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
      <!-- 用户名区域-->
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
      </el-form-item>
      <!-- 密码区域-->
      <el-form-item prop="password">
        <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-lock" ></el-input>
      </el-form-item>
      <!-- 按钮区域-->
      <el-form-item class="btns">
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm()" >重置</el-button>
      </el-form-item>

    </el-form>

  </div>
</div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      //这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // valid参数是布尔值
      this.$refs.loginFormRef.validate(async valid=>{
        // false:直接return，不发起请求；true:发起请求
        if (!valid) return;
       const {data: res} = await this.$http.post('login',this.loginForm);
        if(res.meta.status !== 200) {
          this.$message.error('登录失败!');
        } else {
          this.$message.success('登录成功！')
        }
        // console.log(res);
        window.sessionStorage.setItem('token',res.data.token)
        this.$router.push('/home');
      })
    }
  }
}
</script>

<style scoped>
.login {
  /*flex弹性布局水平垂直居中,一般用于移动端*/
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  /*定位水平居中*/
  position: absolute;
  top: 50%;
  left: 50%;
  /*margin-top: -150px;*/
  /*margin-left: -225px;*/
  transform: translate(-50%,-50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
}
.avatar_box {
  position: absolute;
  left: 50%;
  padding: 10px;
  transform: translate(-50%,-50%);
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(100,100,100,.1);
  background-color: #fff;
}
.avatar_box img {
  width: 100%;
  height: 100%;
  background-color: #eee;
  border-radius: 50%;
}
.login_form {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%);
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}

</style>