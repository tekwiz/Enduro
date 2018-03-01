// * ———————————————————————————————————————————————————————— * //
// * 	enduro render
// *	goes throught all the pages and renders them with handlebars
// * ———————————————————————————————————————————————————————— * //
const enduro_render = function () {}

// * vendor dependencies
const fs = require('fs')
const path = require('path')

// * enduro dependencies
const logger = require(enduro.enduro_path + '/libs/logger')
const page_renderer = require(enduro.enduro_path + '/libs/page_rendering/page_renderer')
const page_queue_generator = require(enduro.enduro_path + '/libs/page_rendering/page_queue_generator')

function list_directories_recursive (dir) {
	return fs.readdirSync(dir)
		.reduce((files, fn) => {
			fn = path.join(dir, fn)
			var stat = fs.statSync(fn)
			if (stat.isDirectory()) {
				files.push(fn)
				return files.concat(list_directories_recursive(fn))
			}
			return files
		}, [])
}

function list_files_recursive (dir) {
	return fs.readdirSync(dir)
		.map(fn => path.join(dir, fn))
		.reduce((files, fn) => {
			var stat = fs.statSync(fn)
			if (stat.isDirectory()) {
				return files.concat(list_files_recursive(fn))
			}
			files.push(fn)
			return files
		}, [])
}

function rm_empty_directory_rollup (dir) {
	if (fs.readdirSync(dir).length) return

	// console.log(`RMDIR ${dir}`)
	fs.rmdirSync(dir)
	rm_empty_directory_rollup(path.dirname(dir))
}

// Goes through the pages and renders them
enduro_render.prototype.render = function () {
	logger.timestamp('Render started', 'enduro_events')

	const build_path = path.join(enduro.project_path, enduro.config.build_folder)

	// gets list of pages to be generated
	return page_queue_generator.generate_pagelist()
		.then((pages_to_render) => {

			// converts the list of pages into list of promises
			const pages_to_render_promises = pages_to_render.map((page_to_render) => {
				return page_renderer.render_file(page_to_render.file, page_to_render.context_file, page_to_render.culture, page_to_render.destination_path)
			})
			// executes the promises and return resolved promise when all are finished
			return Promise.all(pages_to_render_promises)
		})
		.then((cultured_destination_paths) => {
			list_files_recursive(build_path)
				.filter(fn => path.basename(fn) === 'index.html')
				.map(fn => path.relative(build_path, fn).replace(/\.html$/, ''))
				.filter(fn => ![ '_prebuilt', 'assets', 't' ].includes(fn.split(path.sep)[0]))
				.forEach((fn) => {
					if (!cultured_destination_paths.includes(fn)) {
						fn = path.join(build_path, fn + '.html')
						// console.log(`DEL ${fn}`)
						fs.unlinkSync(fn)
						rm_empty_directory_rollup(path.dirname(fn))
					}
				})

			return cultured_destination_paths
		})
		.then((cultured_destination_paths) => {
			list_directories_recursive(build_path)
				.map(fn => path.relative(build_path, fn))
				.filter(fn => ![ '_prebuilt', 'assets', 't' ].includes(fn.split(path.sep)[0]))
				.forEach(fn => rm_empty_directory_rollup(path.join(build_path, fn)))

			return cultured_destination_paths
		})
}

module.exports = new enduro_render()
