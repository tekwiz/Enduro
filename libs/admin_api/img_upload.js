// * ———————————————————————————————————————————————————————— * //
// * 	image upload endpoint
// *
// * 	simples version adds the
// *	@return {response} - success boolean
// * ———————————————————————————————————————————————————————— * //

const multer = require('multer')

// * enduro dependencies
const file_uploader = require('../admin_utilities/file_uploader')
const admin_rights = require('../admin_utilities/admin_rights')

// Array of middleware + endpoint
module.exports = [
	// middleware to process upload
	multer({
		dest: 'tmp/uploads'
		//TODO enduro config to limit upload file types to images
		// fileFilter: (req, file, callback) => {
		// 	if (/^image\//.test(file.mimetype)) {
		// 		return callback(null, true)
		// 	}
		// 	return callback(null, false)
		// }
		//TODO enduro config to set the upload file size limit, e.g.:
		// limits: {
		// 	fileSize: enduro.config.image_file_size_limit
		// }
	}).single('file'),

	function img_upload (req, res, next) {
		req.logger.debug('Trying to upload a file')

		//TODO if (!admin_rights.can_user_do_that(req.user, 'write')) {
		// 	req.logger.warn('Permission denied')
		// 	return res.status(403).json({ success: false, message: 'Permission denied' })
		// }

		req.logger.info({ file: req.file.originalname }, 'Uploading')

		file_uploader.upload({
			name: req.file.originalname,
			path: req.file.path
		}).then((image_url) => {
			res.send({ success: true, image_url: image_url })
		}, (err) => {
			if (!err) err = new Error('undefined error in rejection')
			next(err)
		})
	}
]
