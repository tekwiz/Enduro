// * ———————————————————————————————————————————————————————— * //
// * 	get temp page
// *
// * 	generates temporary html file and saves it in _generated/t folder
// *	@param {string} filename - name of the cms file. relative to cms/
// *	@param {string} content - content of the cms updated file - will be converted to js object and formated upon save
// *	@return {response} - success boolean and saved cms' file content
// * ———————————————————————————————————————————————————————— * //

// * vendor dependencies
const path = require('path')
const fs = require('fs')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const logger = require(enduro.enduro_path + '/libs/logger')
const temper = require(enduro.enduro_path + '/libs/temper/temper')

// routed call
module.exports = function get_temp_page (req, res, next) {
	const filename = req.body.filename
	const content = req.body.content

	// checks if all required parameters had been received
	if (!filename || !content) {
		logger.err('parameters not provided')
		return res.send({ success: false, message: 'Parameters not provided' })
	}

	temper.render(filename, content).then((temp_page_in_raw_html) => {
		const temp_filename = Math.random().toString(36).substring(7)
		const temp_destination_url = path.join('t', temp_filename)
		const temp_destination_path = path.join(enduro.project_path, enduro.config.build_folder,
			temp_destination_url, 'index.html')

		flat_helpers.ensure_directory_existence(temp_destination_path).then(() => {
			fs.writeFile(temp_destination_path, temp_page_in_raw_html, (err) => {
				if (err) return next(err)
				res.send(tmp_destination_url)
			})
		})
	}, (err) => {
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	})
}
