<template>
	<view class="content">
		<!-- 顶部数据 -->
		<view class="tips">
			<text class="title">
				浏览量:<text>{{pageView}}</text>
			</text>
			<text class="title">
				报名人数:<text>{{enrollment}}</text>
			</text>
			<text class="title">
				分享:<text>{{share}}</text>
			</text>
		</view>
		<view class="contentTex">
			<!-- 海报 -->
			<view class="postImg">
				<image class="" src="../../static/haibao.PNG" mode="widthFix"></image>
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
				<image :class="!musicShow ? 'musicStyle' : ''" :src="
                musicShow
                  ? '../../static/music-off.png'
                  : '../../static/music-on.png'
              " mode="widthFix"></image>
			</view>
			<!-- 商品列表 -->
			<!-- <goodList></goodList> -->
		</view>
	</view>
</template>

<script>
	import Scroll from '../../components/scroll/index.vue'
	import lffBarrage from '../../components/lff-barrage/lff-barrage.vue'
	import goodList from '../../components/goodList/index.vue'
	const innerAudioContext = uni.createInnerAudioContext()
	const todo = uniCloud.importObject('todo')
	const db = uniCloud.database()
	export default {
		components: {
			Scroll,
			lffBarrage,
			goodList
		},
		data() {
			return {
				title: "",
				price: 0,
				startTime: new Date(),
				endTime: new Date(),
				postImgUrl: "",
				brandImgUrl: "",
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
			this.getDetail()
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
			//获取音乐
			async getMusicUrl() {
				const res = await todo.getData('music_data')
				if (res.code == 1) {
					const url = res.data[0].url
					this.initMusic(url)
				}
			},
			initMusic(url) {
				innerAudioContext.autoplay = false
				innerAudioContext.loop = true //循环播放
				innerAudioContext.src = url
				this.musicShow = false
			},
			async getData() {
				const res = await todo.getData('total_data')
				if (res.code == 1) {
					const {
						pageView = 0, enrollment = 0, share = 0
					} = res?.data[0]
					console.log()
					this.pageView = pageView
					this.enrollment = enrollment
					this.share = share
				}
			},
			async getDetail() {
				const res = await todo.getData('activity_data')
				if (res.code == 1) {
					const {
						title,
						price,
						startTime,
						endTime,
						postImgUrl,
						brandImgUrl
					} = res?.data[0]
					console.log("title,price,startTime,endTime,postImgUrl,brandImgUrl ", title, price, startTime,
						endTime, postImgUrl, brandImgUrl)
					this.title = title
					this.price = price
					this.startTime = startTime
					this.endTime = endTime
					this.postImgUrl = postImgUrl
					this.brandImgUrl = brandImgUrl
				}
			},
			// colrdo() {
			//   //插入一条弹幕
			//   this.$refs.lffBarrage.add({ item: '你好呀小伙子' })
			// },
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
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		font-size: 20rpx;
		z-index: 999;
	}

	.contentTex {
		margin-top: 50rpx;
		overflow: hidden;
		padding: 20rpx;
	}

	.order {
		position: fixed;
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
		animation: scale 1s alternate-reverse infinite;
	}

	.postImg img {
		height: 500rpx;
		width: 100%;
	}

	.bj_music {
		position: fixed;
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