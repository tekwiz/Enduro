const crypto = require('crypto')
const fs = require('fs')

module.exports = function get_digest (fn) {
	return new Promise((resolve, reject) => {
		var hash = crypto.createHash('md5')
		var f = fs.createReadStream(fn)

		hash.on('readable', () => {
			let data = hash.read()
			if (!data) return
			resolve(data.toString('base64'))
		})

		f.on('error', reject)

		f.pipe(hash)
	})
}
