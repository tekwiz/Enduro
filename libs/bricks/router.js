const path = require('path')
const express = require('express')
const brick_handler = require('./brick_handler')

module.exports = function brick_router () {
	var router = express.Router()

	for (brick_name in enduro.config.bricks) {
		const assets_dir = path.join(brick_handler._get_bricks_root_folder(brick_name), 'assets')
		router.use(`/${brick_name}`, express.static(assets_dir, { fallthrough: false }))
	}

	return router
}
