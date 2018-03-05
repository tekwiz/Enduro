// * ———————————————————————————————————————————————————————— * //
// * 	save cms
// *
// * 	admin api endpoint admin_api/save_cms
// *	@param {string} filename - name of the cms file. relative to cms/
// *	@param {string} content - content of the cms updated file - will be converted to js object and formated upon save
// *	@return {response} - success boolean and saved cms' file content
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const flat = require('../flat_db/flat')
const logger = require('../logger')
const admin_rights = require('../admin_utilities/admin_rights')

// routed call
module.exports = function save_cms (req, res, next) {
	const filename = req.body.filename
	const content = req.body.content

	// checks if all required parameters had been received
	if (!filename || !content) {
		logger.err('parameters not provided')
		return res.send({ success: false, message: 'Parameters not provided' })
	}

	if (!admin_rights.can_user_do_that(req.user, 'write')) {
		console.warn(`Permission denied for ${req.user.username}`)
		return res.status(403).json({ success: false, message: 'Permission denied' })
	}

	// disable watching for cms files to prevent double rendering
	enduro.flags.temporary_nocmswatch = true

	return flat.save(filename, content)
		.then(() => enduro.actions.render(true), (err) => {
			if (err && err.message === 'last_edit mismatch') {
				return res.status(422).json({ success: false, message: err.message })
			}
			if (err) throw err
			throw new Error('undefined error in rejection')
		})
		.then(() => res.send(), (err) => {
			if (!err) err = new Error('undefined error in rejection')
			next(err)
		})
}
