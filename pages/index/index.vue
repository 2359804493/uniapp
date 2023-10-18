<template>
  <unicloud-db
    v-slot:default="{ data, loading, error, options }"
    collection="user_data"
    ref="udb"
  >
    <view v-if="error">{{ error.message }}</view>
    <view v-else>
      <view class="content">
        <view class="tips">
          <text class="title">
            浏览量:<text>{{ data[0].pageView }}</text>
          </text>
          <text class="title">
            报名人数:<text>{{ data[0].enrollment }}</text>
          </text>
          <text class="title">
            分享:<text>{{ data[0].share }}</text>
          </text>
        </view>
        <!-- 海报 -->
        <view class="contentTex">
          <view class="postImg">
            <image
              class=""
              src="../../static/haibao.PNG"
              mode="widthFix"
            ></image>
          </view>
          <!-- 横向滚动 -->
          <!-- <lff-barrage ref="lffBarrage"></lff-barrage> -->
          <!-- 标题区域 -->
          <view class="titleArea" @click="addPageView"> </view>
          <!-- 滚动区域 -->
          <Scroll></Scroll>
          <!-- 订单 -->
          <view class="order" @click="gotoOrderPage">我的订单</view>
          <!-- 背景音乐 -->
          <view class="bj_music" @click="bjMusicClick">
            <image
              :class="!musicShow ? 'musicStyle' : ''"
              :src="
                musicShow
                  ? '../../static/music-off.png'
                  : '../../static/music-on.png'
              "
              mode="widthFix"
            ></image>
          </view>
        </view>
      </view>
    </view>
  </unicloud-db>
</template>

<script>
import Scroll from '../../components/scroll/index.vue'
import lffBarrage from '../../components/lff-barrage/lff-barrage.vue'
const innerAudioContext = uni.createInnerAudioContext()
const todo = uniCloud.importObject('todo')
console.log("todo",todo.getUrl())
const db = uniCloud.database();
export default {
  components: { Scroll, lffBarrage },
  data() {
    return {
      title: 'Hello',
      pageView: 0,
      enrollment: 0,
      share: 0,
      musicShow: false,
    }
  },
  onLoad() {
    this.getMusicUrl()
    // this.colrdo()
	this.getData()
  },
  methods: {
    gotoOrderPage() {
      uni.navigateTo({
        url: '/pages/order/index',
      })
    },
    bjMusicClick() {
      if (this.musicShow) {
        console.log('播放')
        innerAudioContext.play()
      } else {
        console.log('暂停')
        innerAudioContext.pause()
      }
      this.musicShow = !this.musicShow
    },
    async getMusicUrl() {
		const res1= await db.collection("music_data").get()
      const res =  todo
      console.log("res",res,res1)
      // this.initMusic(url)
    },
    initMusic(url) {
      innerAudioContext.autoplay = false
      innerAudioContext.loop = true //循环播放
      innerAudioContext.src = url
      this.musicShow = false
    },
    colrdo() {
      //插入一条弹幕
      this.$refs.lffBarrage.add({ item: '你好呀小伙子' })
    },
    //数据库增
    addPageView() {
      const db = uniCloud.database()
      db.collection('scroll_data')
        .add({
          name: 'hhhhhhhhhhhhy',
          number: 34,
          imgUrl: '',
          statu: 0,
          time: '2023/10/05',
        })
        .then((res) => {
          console.log('e', res)
        })
    },
    //数据库删
    deletePageView() {
     this.$refs.udb.remove("652e3215bd0220d7633405d0")
    },
    //数据库改
    updataPageView() {
      const db = uniCloud.database()
      db.collection('scroll_data')
	  .doc("652e3215bd0220d7633405d0")
        .update({
          name: '22222222222222',
          number: 34,
          imgUrl: '',
          statu: 0,
          time: '2023/10/05',
        })
        .then((res) => {
          console.log('e', res)
        })
    },
	async getData(){
		const db = uniCloud.database();
		let res = await db.collection('user_data').get()
		const {pageView,enrollment,share} = res?.result?.data[0]
		console.log("pageView,enrollment,share",pageView,enrollment,share)
	}
  },
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  color: white;
}
.tips {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 10rpx;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  height: 30rpx;
  line-height: 30rpx;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 20rpx;
}
.contentTex {
  margin-top: 50rpx;
  overflow: hidden;
  padding: 20rpx;
}
.order {
  position: absolute;
  top: 45%;
  right: 0;
  background-color: blue;
  color: #fff;
  width: 40rpx;
  padding: 10rpx;
  font-size: 20rpx;
  border-radius: 6rpx 0 0 6rpx;
}
.postImg {
  width: 100%;
  height: 500rpx;
  overflow: hidden;
  text-align: center;
  animation: scale 3s alternate-reverse infinite;
}
.postImg img {
  height: 500rpx;
  width: 100%;
}
.bj_music {
  position: absolute;
  top: 10%;
  left: 30rpx;
}
.bj_music image {
  width: 72rpx;
  height: 72rpx;
}
@keyframes rotate {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}
@keyframes scale {
  from {
    transform: scale(1.05);
  }
  to {
    transform: scale(1);
  }
}
.bj_music .musicStyle {
  animation: rotate 3s linear infinite;
}
.titleArea {
  height: 100rpx;
  background-color: #fff;
  margin-top: 20rpx;
  border-radius: 10rpx;
}
</style>
