// * ———————————————————————————————————————————————————————— * //
// * 	image upload endpoint
// *
// * 	simples version adds the
// *	@return {response} - success boolean
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const file_uploader = require(enduro.enduro_path + '/libs/admin_utilities/file_uploader')
const logger = require(enduro.enduro_path + '/libs/logger')
const admin_rights = require(enduro.enduro_path + '/libs/admin_utilities/admin_rights')

// routed call
module.exports = function img_upload (req, res, next) {
	logger.timestamp('Trying to upload a file', 'file_uploading')

	if (!admin_rights.can_user_do_that(req.user, 'write')) {
		console.warn(`Permission denied for ${req.user.username}`)
		return res.status(403).json({ success: false, message: 'Permission denied' })
	}

	logger.timestamp('uploading file: ' + req.files.file.name, 'file_uploading')

	file_uploader.upload(req.files.file).then((image_url) => {
		res.send({ success: true, image_url: image_url })
	}, (err) => {
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	})
}
