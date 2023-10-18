// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database();
module.exports = {
	_before: function () { // 通用预处理器
		
	},
	//增加表数据
	async add(dataSheetName,param){
		let res = await db.collection(dataSheetName).add(param)
		try{
			return Promise.resolve({...res,code:1,message:"请求成功"}) 
		}catch(e){
			return Promise.reject({code:0,message:"请求失败"})
		}
	},
	//更新表中一条数据
	async updata(dataSheetName,param,id){
		let res = await db.collection(dataSheetName).doc(id).update(param)
		try{
			return Promise.resolve({...res,code:1,message:"请求成功"}) 
		}catch(e){
			return Promise.reject({code:0,message:"请求失败"})
		}
	},
	//获取表数据
	async getData(dataSheetName){
		let res = await db.collection(dataSheetName).get()
		try{
			return Promise.resolve({...res,code:1,message:"请求成功"}) 
		}catch(e){
			return Promise.reject({code:0,message:"请求失败"})
		}
		
	},
	//获取筛选数据
	async getAppointData(dataSheetName,param){
		let res =  await db.collection(dataSheetName).where(param).get()
		try{
			return Promise.resolve({...res,code:1,message:"请求成功"}) 
		}catch(e){
			return Promise.reject({code:0,message:"请求失败"})
		}
	},
	//获取筛选数据数量
	async getAppointData(dataSheetName,param){
		let res = await db.collection(dataSheetName).where(param).count()
		try{
			return Promise.resolve({...res,code:1,message:"请求成功"}) 
		}catch(e){
			return Promise.reject({code:0,message:"请求失败"})
		}
	},
}