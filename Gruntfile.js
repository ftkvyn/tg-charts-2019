module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: ['public/js/'],
		uglify: {
			yourTask: {
				options: {
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
					compress: true,
					mangle: true,
				},
				files: {
					'public/js/chart.min.js': 'src/chart.js',
					'public/js/data.min.js': 'src/data.js',
					// 'public/js/test.min.js': 'src/test.js',
				},
			},
		},
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task(s).
	grunt.registerTask('build', ['clean', 'uglify']);
};
