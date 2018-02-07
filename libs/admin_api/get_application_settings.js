// * ———————————————————————————————————————————————————————— * //
// * 	check juicebox enabledget_application_settings
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const flat = require(enduro.enduro_path + '/libs/flat_db/flat')

// routed call
module.exports = function get_application_settings (req, res, next) {
	// shallow clone settings with some additions
	var application_settings = Object.assign({
		juicebox_enabled: enduro.config.juicebox_enabled,
		has_admins: true
	}, enduro.cms_data.global.settings)

	flat.load(enduro.config.admin_secure_file).then((raw_userlist) => {
		// if there are no users
		if (!raw_userlist.users) {
			application_settings.has_admins = false
		}

		res.json(application_settings)
	}, (err) => {
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	})
}
