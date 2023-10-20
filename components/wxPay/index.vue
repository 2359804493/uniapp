<template>
  <view class="app">
    <view>
      <view class="label">支付单号：</view>
      <view><input v-model="out_trade_no" /></view>
    </view>
    <view>
      <view class="label">支付金额（单位分，100=1元）：</view>
      <view><input v-model.number="total_fee" /></view>
    </view>
    <button @click="open()">打开收银台（弹窗模式）</button>
    <!-- <view class="tips">支付前，让用户自己选择微信还是支付宝</view> -->
    <!-- #ifdef APP || H5 -->
    <view v-if="!isPcCom">
      <button @click="toPayDesk">打开收银台（新页面模式）</button>
      <!-- <view class="tips">支付前，让用户自己选择微信还是支付宝</view> -->
    </view>

    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN || H5 || APP -->
    <button @click="createOrder('wxpay')">直接发起支付（微信）</button>
    <!-- #endif -->
    <!-- #ifdef MP-ALIPAY || H5 || APP -->
    <button @click="createOrder('alipay')">直接发起支付（支付宝）</button>
    <!-- #endif -->

    <!-- <button @click="createQRcode('wxpay')">生成独立支付二维码</button>
		<view class="tips">用于把生成的二维码放到自己写的页面中（组件不会弹窗，请从日志中查看二维码base64值）</view> -->

    <button @click="getOrderPopup(true)">查询支付状态</button>
    <!-- 查询支付的弹窗 -->
    <uni-popup ref="getOrderPopup" type="bottom" :safe-area="false">
      <view class="get-order-popup">
        <view class="label">第三方交易单号：</view>
        <view class="mt20">
          <input class="pd2030" v-model="transaction_id" placeholder="请输入" />
          <view class="tips"
            >可从支付宝账单（订单号）、微信账单（交易单号）中复制</view
          >
        </view>
        <view class="mt20">
          <button @click="getOrder">查询支付状态</button>
        </view>
        <view class="mt20" v-if="getOrderRes.transaction_id">
          <table class="table">
            <tr>
              <td class="align-left">订单描述</td>
              <td class="align-right">{{ getOrderRes.description }}</td>
            </tr>
            <tr>
              <td class="align-left">支付金额</td>
              <td class="align-right">
                {{ (getOrderRes.total_fee / 100).toFixed(2) }}
              </td>
            </tr>
            <tr>
              <td class="align-left">付款时间</td>
              <td class="align-right">
                {{ timeFormat(getOrderRes.pay_date, 'yyyy-MM-dd hh:mm:ss') }}
              </td>
            </tr>
            <tr>
              <td class="align-left">支付方式</td>
              <td class="align-right">
                {{ providerFormat(getOrderRes.provider) }}
              </td>
            </tr>
            <tr>
              <td class="align-left">第三方交易单号</td>
              <td class="align-right">{{ getOrderRes.transaction_id }}</td>
            </tr>
            <tr>
              <td class="align-left">插件支付单号</td>
              <td class="align-right">{{ getOrderRes.out_trade_no }}</td>
            </tr>
            <tr>
              <td class="align-left">回调状态</td>
              <td class="align-right">
                {{ getOrderRes.user_order_success ? '成功' : '异常' }}
              </td>
            </tr>
          </table>
        </view>
      </view>
    </uni-popup>

    <!-- #ifdef APP -->
    <button v-if="isIosAppCom" @click="iosiap">测试苹果内购</button>
    <!-- #endif -->

    <!--
		<button @click="refund">发起退款</button>
		<view class="tips">发起退款需要admin权限，本示例未对接登录功能</view>
		<button @click="getRefund">查询退款状态</button>
		<button @click="closeOrder">关闭订单</button>
		-->
    <!-- #ifdef H5 -->
    <button
      v-if="h5Env === 'h5-weixin'"
      @click="getWeiXinJsCode('snsapi_base')"
    >
      公众号获取openid示例
    </button>
    <!-- #endif -->
    <!-- 统一支付组件，注意：vue3下ref不可以等于组件名，因此这里ref="pay" 而不能是 ref="uniPay" -->
    <uni-pay
      ref="pay"
      :adpid="adpid"
      height="70vh"
      return-url="/pages/order-detail/order-detail"
      logo="/static/logo.png"
      @success="onSuccess"
      @create="onCreate"
      @fail="onFail"
    ></uni-pay>
  </view>
</template>

<script>
export default {
  data() {
    return {
      total_fee: 1, // 支付金额，单位分 100 = 1元
      order_no: '', // 业务系统订单号（即你自己业务系统的订单表的订单号）
      out_trade_no: '', // 插件支付单号
      description: '测试订单', // 支付描述
      type: 'test', // 支付回调类型 如 recharge 代表余额充值 goods 代表商品订单（可自定义，任意英文单词都可以，只要你在 uni-pay-co/notify/目录下创建对应的 xxx.js文件进行编写对应的回调逻辑即可）
      //qr_code: true, // 是否强制使用扫码支付
      openid: '', // 微信公众号需要
      custom: {
        a: 'a',
        b: 1,
      },
      adpid: '1000000001', // uni-ad的广告位id

      transaction_id: '', // 查询订单接口的查询条件
      getOrderRes: {}, // 查询订单支付成功后的返回值
    }
  },
  onLoad(options = {}) {
    // #ifdef H5
    // 微信公众号特殊逻辑开始-----------------------------------------------------------
    // 以下代码仅为获取openid，正常你自己项目应该是登录后才能支付，登录后已经拿到openid，无需编写下面的代码
    if (this.h5Env === 'h5-weixin') {
      let openid = uni.getStorageSync('uni-pay-weixin-h5-openid')
      let code = uni.getStorageSync('uni-pay-weixin-h5-code')
      if (openid) {
        this.openid = openid
      }
      // 如果code和state有值，且此code没有被使用过，则执行获取微信公众号的openid
      if (options.code && options.state && code !== options.code) {
        // 获取微信公众号的openid
        setTimeout(() => {
          this.getOpenid({
            provider: 'wxpay',
            code: options.code,
          })
        }, 300)
      } else if (!openid) {
        // 如果openid为空，则执行微信公众号的网页授权登录逻辑
        setTimeout(() => {
          this.getWeiXinJsCode('snsapi_base')
        }, 300)
      }
    }
    // 微信公众号特殊逻辑结束-----------------------------------------------------------
    // #endif
  },
  methods: {
    /**
     * 发起支付（唤起收银台，如果只有一种支付方式，则收银台不会弹出来，会直接使用此支付方式）
     * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
     */
    open() {
      this.order_no = `test` + Date.now()
      this.out_trade_no = `${this.order_no}-1`
      // 打开支付收银台
      this.$refs.pay.open({
        total_fee: this.total_fee, // 支付金额，单位分 100 = 1元
        order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
        out_trade_no: this.out_trade_no, // 插件支付单号
        description: this.description, // 支付描述
        type: this.type, // 支付回调类型
        qr_code: this.qr_code, // 是否强制使用扫码支付
        openid: this.openid, // 微信公众号需要
        custom: this.custom, // 自定义数据
      })
    },
    /**
     * 发起支付（不唤起收银台，手动指定支付方式）
     * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
     */
    createOrder(provider) {
      this.order_no = `test` + Date.now()
      this.out_trade_no = `${this.order_no}-1`
      // 发起支付
      this.$refs.pay.createOrder({
        provider: provider, // 支付供应商
        total_fee: this.total_fee, // 支付金额，单位分 100 = 1元
        order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
        out_trade_no: this.out_trade_no, // 插件支付单号
        description: this.description, // 支付描述
        type: this.type, // 支付回调类型
        qr_code: this.qr_code, // 是否强制使用扫码支付
        openid: this.openid, // 微信公众号需要
        custom: this.custom, // 自定义数据
      })
    },
    /**
     * 生成支付独立二维码（只返回支付二维码）
     * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
     */
    createQRcode(provider) {
      this.order_no = `test` + Date.now()
      this.out_trade_no = `${this.order_no}-1`
      // 发起支付
      this.$refs.pay.createOrder({
        provider: provider, // 支付供应商
        total_fee: this.total_fee, // 支付金额，单位分 100 = 1元
        order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
        out_trade_no: this.out_trade_no, // 插件支付单号
        description: this.description, // 支付描述
        type: this.type, // 支付回调类型
        qr_code: true, // 是否强制使用扫码支付
        cancel_popup: true, // 配合qr_code:true使用，是否只生成支付二维码，没有二维码弹窗
        openid: this.openid, // 微信公众号需要
        custom: this.custom, // 自定义数据
      })
    },
    /**
     * 前往自定义收银台页面
     * 在调用此api前，你应该先创建自己的业务系统订单，并获得订单号 order_no，把order_no当参数传给此api，而示例中为了简化跟支付插件无关的代码，这里直接已时间戳生成了order_no
     */
    toPayDesk() {
      this.order_no = `test` + Date.now()
      this.out_trade_no = `${this.order_no}-1`
      let options = {
        total_fee: this.total_fee, // 支付金额，单位分 100 = 1元
        order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
        out_trade_no: this.out_trade_no, // 插件支付单号
        description: this.description, // 支付描述
        type: this.type, // 支付回调类型
        qr_code: this.qr_code, // 是否强制使用扫码支付
        openid: this.openid, // 微信公众号需要
        custom: this.custom, // 自定义数据
      }
      let optionsStr = encodeURI(JSON.stringify(options))
      uni.navigateTo({
        url: `/uni_modules/uni-pay/pages/pay-desk/pay-desk?options=${optionsStr}`,
      })
    },
    // 打开查询订单的弹窗
    getOrderPopup(key) {
      if (key) {
        this.$refs.getOrderPopup.open()
      } else {
        this.$refs.getOrderPopup.close()
      }
    },
    // 查询支付状态
    async getOrder() {
      this.getOrderRes = {}
      let res = await this.$refs.pay.getOrder({
        //out_trade_no: this.out_trade_no, // 插件支付单号 两者传1个即可
        transaction_id: this.transaction_id, // 第三方单号 两者传1个即可
        await_notify: true,
      })
      if (res) {
        this.getOrderRes = res.pay_order
        let obj = {
          '-1': '已关闭',
          1: '已支付',
          0: '未支付',
          2: '已部分退款',
          3: '已全额退款',
        }
        uni.showToast({
          title: obj[res.status] || res.errMsg,
          icon: 'none',
        })
      }
    },
    // 发起退款
    async refund() {
      let res = await this.$refs.pay.refund({
        out_trade_no: this.out_trade_no, // 插件支付单号
      })
      if (res) {
        uni.showToast({
          title: res.errMsg,
          icon: 'none',
        })
      }
    },
    // 查询退款状态
    async getRefund() {
      let res = await this.$refs.pay.getRefund({
        out_trade_no: this.out_trade_no, // 插件支付单号
      })
      if (res) {
        uni.showModal({
          content: res.errMsg,
          showCancel: false,
        })
      }
    },
    // 关闭订单
    async closeOrder() {
      let res = await this.$refs.pay.closeOrder({
        out_trade_no: this.out_trade_no, // 插件支付单号
      })
      if (res) {
        uni.showModal({
          content: res.errMsg,
          showCancel: false,
        })
      }
    },
    // 获取公众号code
    async getWeiXinJsCode(scope = 'snsapi_base') {
      let res = await this.$refs.pay.getProviderAppId({
        provider: 'wxpay',
        provider_pay_type: 'jsapi',
      })
      if (res.appid) {
        let appid = res.appid
        let redirect_uri = window.location.href.split('?')[0]
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`
        window.location.href = url
      }
    },
    // 获取公众号openid
    async getOpenid(data = {}) {
      let res = await this.$refs.pay.getOpenid(data)
      if (res) {
        this.openid = res.openid
        // 将openid缓存到本地
        uni.setStorageSync('uni-pay-weixin-h5-openid', this.openid)
        uni.setStorageSync('uni-pay-weixin-h5-code', data.code)
        uni.showToast({
          title: '已获取到openid，可以开始支付',
          icon: 'none',
        })
      }
    },
    // 监听事件 - 支付订单创建成功（此时用户还未支付）
    onCreate(res) {
      console.log('create: ', res)
      // 如果只是想生成支付二维码，不需要组件自带的弹窗，则在这里可以获取到支付二维码 qr_code_image
    },
    // 监听事件 - 支付成功
    onSuccess(res) {
      console.log('success: ', res)
      if (res.user_order_success) {
        // 代表用户已付款，且你自己写的回调成功并正确执行了
      } else {
        // 代表用户已付款，但你自己写的回调执行失败（通常是因为你的回调代码有问题）
      }
    },
    onFail(err) {
      console.log('err: ', err)
    },
    iosiap() {
      uni.navigateTo({
        url: '/pages/iosiap/iosiap',
      })
    },
    providerFormat(provider) {
      let providerObj = {
        wxpay: '微信支付',
        alipay: '支付宝支付',
        appleiap: 'ios内购',
      }
      let providerStr = providerObj[provider] || '未知'
      return providerStr
    },
    /**
     * 日期格式化
     * @params {Date || Number} date 需要格式化的时间
     * timeFormat(new Date(),"yyyy-MM-dd hh:mm:ss");
     */
    timeFormat(time, fmt = 'yyyy-MM-dd hh:mm:ss', targetTimezone = 8) {
      try {
        if (!time) {
          return ''
        }
        if (typeof time === 'string' && !isNaN(time)) time = Number(time)
        // 其他更多是格式化有如下:
        // yyyy-MM-dd hh:mm:ss|yyyy年MM月dd日 hh时MM分等,可自定义组合
        let date
        if (typeof time === 'number') {
          if (time.toString().length == 10) time *= 1000
          date = new Date(time)
        } else {
          date = time
        }

        const dif = date.getTimezoneOffset()
        const timeDif = dif * 60 * 1000 + targetTimezone * 60 * 60 * 1000
        const east8time = date.getTime() + timeDif

        date = new Date(east8time)
        let opt = {
          'M+': date.getMonth() + 1, //月份
          'd+': date.getDate(), //日
          'h+': date.getHours(), //小时
          'm+': date.getMinutes(), //分
          's+': date.getSeconds(), //秒
          'q+': Math.floor((date.getMonth() + 3) / 3), //季度
          S: date.getMilliseconds(), //毫秒
        }
        if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + '').substr(4 - RegExp.$1.length)
          )
        }
        for (let k in opt) {
          if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(
              RegExp.$1,
              RegExp.$1.length == 1
                ? opt[k]
                : ('00' + opt[k]).substr(('' + opt[k]).length)
            )
          }
        }
        return fmt
      } catch (err) {
        // 若格式错误,则原值显示
        return time
      }
    },
  },
  computed: {
    h5Env() {
      // #ifdef H5
      let ua = window.navigator.userAgent.toLowerCase()
      if (
        ua.match(/MicroMessenger/i) == 'micromessenger' &&
        ua.match(/miniprogram/i) == 'miniprogram'
      ) {
        // 微信小程序
        return 'mp-weixin'
      }
      if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        // 微信公众号
        return 'h5-weixin'
      }
      if (
        ua.match(/alipay/i) == 'alipay' &&
        ua.match(/miniprogram/i) == 'miniprogram'
      ) {
        return 'mp-alipay'
      }
      if (ua.match(/alipay/i) == 'alipay') {
        return 'h5-alipay'
      }
      // 外部 H5
      return 'h5'
      // #endif
    },
    // 计算当前是否是ios app
    isIosAppCom() {
      let info = uni.getSystemInfoSync()
      return info.uniPlatform === 'app' && info.osName === 'ios' ? true : false
    },
    // 计算当前是否是PC环境
    isPcCom() {
      // #ifdef H5
      let info = uni.getSystemInfoSync()
      return info.deviceType === 'pc' ? true : false
      // #endif
      return false
    },
  },
}
</script>

<style lang="scss" scoped>
.app {
  padding: 30rpx;
}
input {
  border: 1px solid #f3f3f3;
  padding: 10rpx;
  width: 100%;
  box-sizing: border-box;
  height: 80rpx;
}

button {
  margin-top: 20rpx;
}

.label {
  margin: 10rpx 0;
}

.tips {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #565656;
}

.get-order-popup {
  background-color: #ffffff;
  padding: 30rpx;
  height: 60vh;
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
}
.mt20 {
  margin-top: 20rpx;
}

.pd2030 {
  padding: 20rpx 30rpx;
}

.table {
  font-size: 24rpx;
}
.align-left {
  text-align: left;
  width: 50%;
}
.align-right {
  text-align: right;
  width: 50%;
}
</style>
