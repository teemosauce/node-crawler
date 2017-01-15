const EventEmitter = require('events')

class Pool extends EventEmitter {
	constructor(autoStartLength) {
		super()
		this.autoStartLength = autoStartLength || 0;
		this.resources = [];
	}

	push(res) {
		this.resources.push(res)
		this.emit('data');
	}

	shift() {
		return this.resources.shift()
	}
}
module.exports = new Pool()