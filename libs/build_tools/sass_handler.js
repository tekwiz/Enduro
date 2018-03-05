// * ———————————————————————————————————————————————————————— * //
// * 	Sass Task
// *	Processes assets/css/main.scss file
// *	All other scss files need to be imported in main.scss to get compiled
// *	Uses bulkSass for @import subfolder/* funcionality
// * ———————————————————————————————————————————————————————— * //
const sass_handler = function () {}

// * vendor dependencies
const path = require('path')
const bulkSass = require('gulp-sass-bulk-import')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')

// * enduro dependencies
const logger = require(enduro.enduro_path + '/libs/logger')

sass_handler.prototype.init = function (gulp, browser_sync) {

	// stores task name
	const sass_handler_task_name = 'sass'

	// registeres task to provided gulp
	gulp.task(sass_handler_task_name, function () {

		logger.timestamp('Sass compiling started', 'enduro_events')

		var stream = gulp.src(enduro.project_path + '/assets/css/*.scss')
			.pipe(bulkSass())
			.on('error', function (err) {
				logger.err_blockStart('Sass error')
				logger.err(err.message)
				logger.err_blockEnd()
				this.emit('end')
			})
			.on('end', () => {
				logger.timestamp('Sass compiling finished', 'enduro_events')
			})

		if (process.env.NODE_ENV === 'production') {
			stream = stream.pipe(sass({ outputStyle: 'compressed' }))
		} else {
			stream = stream.pipe(sourcemaps.init())
				.pipe(sass({ outputStyle: 'nested' }))
		}

		stream = stream
			.pipe(autoprefixer({
				browsers: ['last 2 versions'],
				cascade: false,
			}))

		if (process.env.NODE_ENV !== 'production') {
			stream = stream.pipe(sourcemaps.write())
		}

		let css_dest = path.join(enduro.project_path, enduro.config.build_folder, 'assets', 'css')
		stream = stream.pipe(gulp.dest(css_dest))

		if (browser_sync) {
			if (process.env.NODE_ENV === 'production') {
				console.warn('DANGER: Using browser_sync in production is insecure!')
			}
			stream = stream.pipe(browser_sync.stream())
		}

		return stream
	})

	return sass_handler_task_name
}

module.exports = new sass_handler()
