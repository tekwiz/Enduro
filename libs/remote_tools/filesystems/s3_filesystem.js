// * ———————————————————————————————————————————————————————— * //
// * 	remote handler
// *	uploads files to s3
// * ———————————————————————————————————————————————————————— * //
const filesystem = function () {}

// * vendor dependencies
const AWS = require('aws-sdk')

// * enduro dependencies
const logger = require(enduro.enduro_path + '/libs/logger')

filesystem.prototype.init = function () {
	// no init required
}

filesystem.prototype.upload = function (filename, path_to_file) {

	var destination_url = self.get_remote_url(filename)

	var s3 = new AWS.S3({
		// accessKeyId: enduro.config.variables.S3_KEY,
		// secretAccessKey: enduro.config.variables.S3_SECRET,
		// region: enduro.config.s3.region || 'us-west-1',
		params: {
			Bucket: enduro.config.s3.bucket
		}
	})

	return s3.upload({
		Key: filename,
		ACL: 'public-read',
		Body: fs.createReadStream(path_to_file)
	}).promise().then(() => {
		logger.timestamp('File uploaded successfully: ' + destination_url)
		return destination_url
	}, (err) => {
		console.error('unable to upload:', err.stack)
		throw err
	})
}

filesystem.prototype.get_remote_url = function (filename, juicebox) {
	if (enduro.config.s3.cloudfront && !juicebox) {
		return 'https://' + enduro.config.s3.cloudfront + '/' + filename
	}

	let s3 = new AWS.S3({
		// region: enduro.config.s3.region || 'us-west-1',
		params: {
			Bucket: enduro.config.s3.bucket
		}
	})

	return s3.endpoint.href + enduro.config.s3.bucket + '/' + filename
}

module.exports = new filesystem()
