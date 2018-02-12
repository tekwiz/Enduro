// * ———————————————————————————————————————————————————————— * //
// * 	Handles adding new page
// * ———————————————————————————————————————————————————————— * //
const page_service = function () {}

// * vendor dependencies
const path = require('path')
const fs = require('fs')

// * enduro dependencies
const flat = require(enduro.enduro_path + '/libs/flat_db/flat')
const pagelist_generator = require(enduro.enduro_path + '/libs/build_tools/pagelist_generator')

function get_first_generated_context (generator) {
	return pagelist_generator.get_cms_list().then((cms_list) => {
		let all_pages = cms_list.structured[generator].filter(p => p.page === true)
		if (!all_pages.length) return {}
		return flat.load(all_pages[0].fullpath)
	})
}

function get_new_generator_context (generator) {
	return flat.load(path.join('generators', generator, generator)).then((template_content) => {
		// check if generator template exists
		if (template_content && Object.keys(template_content).length) {
			return template_content
		} else {
			// there is no template, let's get the first page there is
			return get_first_generated_context(generator)
		}
	})
}

// adds a new page to a generator - basically creates a .js file in the generator folder
page_service.prototype.new_generator_page = function (new_pagename, generator) {
	const file_path = path.join('generators', generator, new_pagename)
	// try to load a template generator - templates are named same as generator
	return get_new_generator_context(generator)
		.then(template_content => flat.save(file_path, template_content))
		.then(() => pagelist_generator.generate_cms_list())
		.then(cmslist => pagelist_generator.save_cms_list(cmslist))
}

function delete_page (pagename) {
	return new Promise((resolve, reject) => {
		const file_path = path.join(enduro.project_path, 'cms', pagename + '.js')

		fs.unlink(file_path, (err) => {
			if (err) return reject(err)

			console.log(`File ${file_path} was deleted`)
			resolve()
		})
	})
}

// deletes a page
page_service.prototype.delete_page = function (pagename) {
	return delete_page(pagename)
		.then(() => pagelist_generator.generate_cms_list())
		.then(cmslist => pagelist_generator.save_cms_list(cmslist))
}

module.exports = new page_service()
