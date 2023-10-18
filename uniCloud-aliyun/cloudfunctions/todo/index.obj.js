// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database();
module.exports = {
	_before: function () { // 通用预处理器
		
	},
	//增加表数据
	async add(dataSheetName,param){
		let res = await db.collection(dataSheetName).add(param)
		const data = res?.result
		return data
	},
	//更新表中一条数据
	async updata(dataSheetName,param,id){
		let res = await db.collection(dataSheetName).doc(id).update(param)
		const data = res?.result
		return data  
	},
	//获取表数据
	async getData(dataSheetName){
		let res = await db.collection(dataSheetName).get()
		const data = res?.result
		console.log("res",res)
		return data
	},
	//获取筛选数据
	async getAppointData(dataSheetName,param){
		let res =  await db.collection(dataSheetName).where(param).get()
		const data = res?.result
		return data
	},
	//获取筛选数据数量
	async getAppointData(dataSheetName,param){
		let res = await db.collection(dataSheetName).where(param).count()
		const data = res?.result
		return data
	},
	getUrl(){
		return{
			url:"1111111"
		}
	}
	
},
