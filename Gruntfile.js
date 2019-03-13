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
		watch: {
			scripts: {
				files: ['src/*.js'],
				tasks: ['build'],
				options: {
					spawn: false,
				},
			},
		},
		express: {
			myServer: {
				options: {
					port: 3000,
					server: './app.js',
				},
				// server: './fwefwe.js', // path.resolve(__dirname, 'app.js'),
				// if you do not define a port it will start your server at port 3000
			},
		},
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');

	// Default task(s).
	grunt.registerTask('build', ['clean', 'uglify']);
	grunt.registerTask('dev', ['clean', 'uglify', 'express', 'watch']);
};
