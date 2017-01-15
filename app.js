const cheerio = require('cheerio')
const fetch = require('node-fetch')
const _ = require('lodash')
const fs = require('fs')

let URL = 'http://www.haha.mx/topic/1/new'
let page = 1
const SAVE_PATH = './images'

const MAX_PAGE = 5;
const imageQueue = []
let isDownloading = false

/**
 * [crawler 抓数据主方法]
 * @return {[type]} [description]
 */
function crawler() {
	console.log('开始抓取数据第' + page + '页数据')
	if (page >= MAX_PAGE) {
		if (!isDownloading) {
			download();
		}
		return;
	}

	fetch(URL + '/' + page).then(res => {
		return res.text()
	}).then(body => {
		let $ = cheerio.load(body);
		let smallImages = $('.joke-list .joke-main-content a img.joke-main-img')
		Array.prototype.forEach.call(smallImages, (image) => {
			imageQueue.push(image.attribs.src)
		})

		//当图片大于20张的时候开始下载
		if (imageQueue.length > 20) {
			download()
		}
		page++
		crawler();
	}).catch(e => {
		console.log(e)
	})
}

/**
 * [download description]
 * @return {[type]} [description]
 */
function download() {
	let url = imageQueue.shift()
	if (url) {
		if (!isDownloading) {
			isDownloading = true;
		}
		url = url.replace(/small/, 'big')
		console.log('开始下载==>' + url)
		fetch(url).then(res => {
			if (!res.ok) return;
			let name = url.split('/')
			name = name[name.length - 1]
			fs.stat(SAVE_PATH, (err, stats) => {
				if (err) {
					fs.mkdir(SAVE_PATH, (err, stats) => {
						if (err) return
						saveImageToFile(SAVE_PATH, name, res.body)
					})
				} else {
					saveImageToFile(SAVE_PATH, name, res.body)
				}
			})
		}).catch(e => {
			console.log(e)
		})
		download()
	} else {
		isDownloading = false
	}
}

/**
 * [saveImageToFile description]
 * @param  {[type]} _path   [description]
 * @param  {[type]} _name   [description]
 * @param  {[type]} _stream [description]
 * @return {[type]}         [description]
 */
function saveImageToFile(_path, _name, _stream) {
	console.log(_name + '下载完成开始保存到' + _path)
	let writer = fs.createWriteStream(_path + '/' + _name, {
		autoClose: true
	})
	writer.on('error', err => {
		console.log(_name + '权限拒绝')
	})
	_stream.pipe(writer)
}

//开始任务
crawler()