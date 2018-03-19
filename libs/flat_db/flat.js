// * ———————————————————————————————————————————————————————— * //
// * 	flatdb custom built for enduro.js
// * 	handles cms data storage
// * ———————————————————————————————————————————————————————— * //
const flat = function () {}

// * vendor dependencies
const Promise = require('bluebird')
const fs = require('fs')
const require_from_string = require('require-from-string')
const decode = require('urldecode')
const stringify_object = require('stringify-object')
const path = require('path')
const _ = require('lodash')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const log_clusters = require(enduro.enduro_path + '/libs/log_clusters/log_clusters')
const brick_processors = require(enduro.enduro_path + '/libs/bricks/brick_processors')


// * ———————————————————————————————————————————————————————— * //
// * 	Save cms file
// *	@param {String} filename - Path to file without extension, relative to /cms folder
// *	@param {Object} contents - Content to be saved
// *	@return {Promise} - Promise with no content. Resolve if saved successfully, reject otherwise
// * ———————————————————————————————————————————————————————— * //
flat.prototype.save = function (filename, contents) {
	// TODO: maybe the file could be backed up somewhere before overwriting
	contents = contents || {}

	// url decode filename
	filename = decode(filename)

	const fullpath_to_cms_file = this.get_full_path_to_flat_object(filename)

	return flat_helpers.ensure_directory_existence(fullpath_to_cms_file)
		.then(() => {
			return this.load_raw(fullpath_to_cms_file, true)
		})
		.then((contents_before) => {
			if (enduro.config.meta_context_enabled) {
				if (!contents_before.meta) {
					contents_before.meta = {}
					if (contents.meta && contents.meta.last_edited) {
						contents_before.meta.last_edited = contents.meta.last_edited
					}
				}
				if (!contents.meta) contents.meta = {}

				if (contents_before.meta.last_edited !== contents.meta.last_edited) {
					throw new Error(`last_edit mismatch`)
				}

				// add meta data (only if meta is enabled - currently juicebox)
				flat_helpers.add_meta_context(contents)
			}

			// formats js file so it can be edited by hand later
			const flatObj = require_from_string('module.exports = ' + JSON.stringify(contents))
			return stringify_object(flatObj, { indent: '	', singleQuotes: true })
		})
		.then((contents_pretty_string) => {
			return new Promise((resolve, reject) => {
				// save cms file
				fs.writeFile(fullpath_to_cms_file, contents_pretty_string, (err) => {
					err ? reject(err) : resolve()
				})
			})
		})
		.then(() => {
			return this.load(fullpath_to_cms_file, true)
		})
}
// * ———————————————————————————————————————————————————————— * //
// * 	Load cms file without brick processors
// *	@param {string} filename - Path to file without extension, relative to /cms folder
// *	@param {bool} is_full_absolute_path - if true, filename is handled as absolute path
// *	@return {Promise} - Promise returning an object
// * ———————————————————————————————————————————————————————— * //
flat.prototype.load_raw = function (filename, is_full_absolute_path) {
	return new Promise((resolve, reject) => {

		// url decode filename
		filename = decode(filename)

		let fullpath_to_cms_file
		if (is_full_absolute_path) {
			fullpath_to_cms_file = filename
		} else {
			fullpath_to_cms_file = this.get_full_path_to_flat_object(filename)

		}

		// check if file exists. return empty object if not
		if (!flat_helpers.file_exists_sync(fullpath_to_cms_file)) {
			return resolve({})
		}

		fs.readFile(fullpath_to_cms_file, (err, raw_context_data) => {
			if (err) return reject(err)

			// check if file is empty. return empty object if so
			if (raw_context_data == '') return resolve({})

			// strip whitespace
			raw_context_data = raw_context_data.toString().trim()

			// wraps content in curly braces if it isn't already wrapped
			// the file will still be saved with braces but might help some people if
			// they forget to include the braces
			if (raw_context_data[0] != '{') {
				raw_context_data = '{' + raw_context_data + '}'
			}

			// convert the string-based javascript into an object
			let context = {}
			try {
				context = require_from_string('module.exports = ' + raw_context_data)
			} catch (e) {
				console.error(e.stack)
				log_clusters.log('malformed_context_file', filename)
				return reject(e)
			}

			resolve(context)
		})
	})
}

// * ———————————————————————————————————————————————————————— * //
// * 	Load cms file
// *	@param {string} filename - Path to file without extension, relative to /cms folder
// *	@param {bool} is_full_absolute_path - if true, filename is handled as absolute path
// *	@return {Promise} - Promise returning an object
// * ———————————————————————————————————————————————————————— * //
flat.prototype.load = function (filename, is_full_absolute_path) {
	return this.load_raw(filename, is_full_absolute_path)
		.then((context) => {
			return brick_processors.process('cms_context_processor', context)
		})
}

// * ———————————————————————————————————————————————————————— * //
// * 	Get full path of a cms file
// *	@param {string} flat_object_path - path to file without extension, relative to flat root folder
// *	@return {string} - peturns full server path to specified file
// * ———————————————————————————————————————————————————————— * //
flat.prototype.get_full_path_to_flat_object = (filename) => {
	return path.join(enduro.project_path, 'cms', filename + '.js')
}

// * ———————————————————————————————————————————————————————— * //
// * 	get cms flat_object_path from a full path
// *	@param {string} full_path - absolute, server-root-related path to the file
// *	@return {string} - returns file name relative to /cms folder
// * ———————————————————————————————————————————————————————— * //
flat.prototype.get_cms_filename_from_fullpath = (full_path) => {
	return full_path.match(/(?:\/|\\)cms(?:\/|\\)(.*)\..*/)[1]
}

// * ———————————————————————————————————————————————————————— * //
// * 	checks if specified file exists
// *	@param {string} flat_object_path - path to file without extension, relative to flat root folder
// *	@return {boolean} - returns true if specified file exists
// * ———————————————————————————————————————————————————————— * //
flat.prototype.flat_object_exists = function (flat_object_path) {
	return flat_helpers.file_exists_sync(this.get_full_path_to_flat_object(flat_object_path))
}

// * ———————————————————————————————————————————————————————— * //
// * 	updates flat object with new context
// *	merges array instead of replacing them
// *	@param {string} flat_object_path - path to file without extension, relative to flat root folder
// *	@param {object} context_to_update - object to be merged with current context
// *	@return {object} - returns merged object
// * ———————————————————————————————————————————————————————— * //
flat.prototype.upsert = function (flat_object_path, context_to_update) {
	return this.load(flat_object_path)
		.then((current_context) => {
			const merged_context = _.mergeWith(current_context, context_to_update, (objValue, srcValue) => {
				if (Array.isArray(objValue) && Array.isArray(srcValue)) {
					return _.union(objValue, srcValue)
				}
			})
			return this.save(flat_object_path, merged_context)
		})
}

// * ———————————————————————————————————————————————————————— * //
// * 	checks filename and returns if it defines a generator file or not
// *	@param {string} filename - path to file without extension, relative to flat folder
// *	@return {bool} - returns true if filename belongs to a generator
// * ———————————————————————————————————————————————————————— * //
flat.prototype.is_generator = function (flat_object_path) {
	return flat_object_path.split('/')[0] == 'generators'
}

// * ———————————————————————————————————————————————————————— * //
// * 	returns a relative http url from flat_object_path
// *	for example: `generators/blog/blog_entry` will result in `blog/blog_entry`
// *	@param {string} flat_object_path - path to file without extension, relative to flat folder
// *	@return {string} - returns relative url that will serve this flat object
// * ———————————————————————————————————————————————————————— * //
flat.prototype.url_from_filename = function (flat_object_path) {
	if (flat_object_path == 'index') {
		return ''
	}

	if (this.is_generator(flat_object_path)) {
		const temp_path = flat_object_path.split('/').slice(1)
		return temp_path.join('/')
	}

	return flat_object_path
}

// * ———————————————————————————————————————————————————————— * //
// * 	returns a relative path to the file actually being served when flat object is requested
// *	for example: `generators/blog/blog_entry` will result in `blog/blog_entry/index.html`
// *	@param {string} flat_object_path - path to file without extension, relative to flat folder
// *	@return {string} - returns relative url to the file
// * ———————————————————————————————————————————————————————— * //
flat.prototype.filepath_from_filename = function (flat_object_path) {
	if (flat_object_path == 'index') {
		return 'index'
	}

	if (this.is_generator(flat_object_path)) {
		let temp_path = flat_object_path.split('/').slice(1)
		temp_path.push('index')
		return path.join(...temp_path)
	}

	return path.join(flat_object_path, 'index')
}

// * ———————————————————————————————————————————————————————— * //
// * 	returns true if flat_object is directly linked to a accessible, served http page
// *	currently global flat objects have no page associated with them
// *	@param {string} flat_object_path - path to file without extension, relative to flat folder
// *	@return {bool}
// * ———————————————————————————————————————————————————————— * //
flat.prototype.has_page_associated = function (flat_object_path) {
	const first_route_part = flat_object_path.split('/')[0].toLowerCase()

	// global flat objects does not have a page associated with them
	if (first_route_part == 'global') {
		return false
	}

	let hbs_filepath = path.join(enduro.project_path, 'pages', flat_object_path + '.hbs')

	if (this.is_generator(flat_object_path)) {
		// eslint-disable-next-line no-useless-escape
		hbs_filepath = hbs_filepath.replace(/\/[^\/]+(\.hbs)$/, '$1')
	}

	try {
		let stats = fs.statSync(hbs_filepath)
		return stats.isFile()
	} catch (e) {
		return false
	}
}

// * ———————————————————————————————————————————————————————— * //
// * 	makes a decision whether this content file is deletable
// *	currently only generator flat objects are deletable
// *	@param {string} filename - path to file without extension, relative to flat folder
// *	@return {bool} - returns true if particular content file is deletable
// * ———————————————————————————————————————————————————————— * //
flat.prototype.is_deletable = function (filename) {
	return this.is_generator(filename)
}

module.exports = new flat()
