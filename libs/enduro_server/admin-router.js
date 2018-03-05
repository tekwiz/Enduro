const express = require('express')

module.exports = function admin_router () {
	var router = express.Router()

	router.use('/logout', function logout (req, res) {
		req.session.destroy((err) => {
			if (err) {
				console.error(err.stack ? err.stack : `Error message: ${err}`)
				return res.status(500).send('An error occurred')
			}
			res.redirect('/admin')
		})
	})

	// handle for executing enduro refresh from client
	router.get('/api_refresh', function api_refresh (req, res) {
		enduro.actions.render()
			.then(() => {
				res.send({ success: true, message: 'enduro refreshed successfully' })
			}, (err) => {
				if (err && err.stack) {
					console.error(err.stack)
				} else {
					console.error(err || `enduro refresh failed`)
				}
				res.status(500).send({ success: false, message: 'enduro refresh failed' })
			})
	})

	router.use(express.static(enduro.config.admin_folder, {
		fallthrough: false
	}))

	return router
}
