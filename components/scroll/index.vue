<template>
	<view class="lists">
		<view :class="{ top: animate == true }">
			<view class="list" v-for="(item,index) in notics" :key="item._id">
				<text>{{item.name}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				animate:true,
				timer:null,
				notics: []
			}
		},
		created() {
			this.timer = setInterval(this.scroll, 2000);
			this.getData()
		},
		destroyed() { clearInterval(this.timer); },
		methods: {
			scroll() {
				this.animate = true;
				setTimeout(() => {
					this.notics.push(this.notics[0]);
					this.notics.shift();
					this.animate = false;
				}, 1000);
			},
			async getData(){
				const db = uniCloud.database();
				let res = await db.collection('scroll_data').get()
				const notics = res?.result?.data
				this.notics = notics
			}
		}
	}
</script>

<style lang="less" scoped>
	.lists{
		height: 300rpx;
		overflow: hidden;
		background-color: #fff;
		color: #000;
		margin-top: 30rpx;
		border-radius: 10rpx;
	}
	.list{
		height: 60rpx;
		display: flex;
		align-items: center;
		font-size: 26rpx;
	}
	text{
		padding-left: 20rpx;
	}
	.top {
	    transition: all 1s;
	    margin-top: -60rpx;
	  }
</style>
