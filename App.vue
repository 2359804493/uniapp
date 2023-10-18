<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
page {
  padding: 0;
  margin: 0;
  background-color: orange;
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
  height: 100%;
  position: relative;
  top: 0rpx;
  bottom: 0rpx;
  left: 0rpx;
  right: 0rpx;
  color: #fff;
}
</style>
