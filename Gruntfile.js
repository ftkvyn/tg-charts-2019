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
					'public/js/chart.js': 'src/chart.js',
					'public/js/data.js': 'src/data.js',
					// 'public/js/test.min.js': 'src/test.js',
				},
			},
		},
		copy: {
			main: {
				src: 'src/*',
				dest: 'public/js/',
				expand: true,
				flatten: true,
			},
		},
		watch: {
			scripts: {
				files: ['src/*.js'],
				tasks: ['clean', 'copy'],
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
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Default task(s).
	grunt.registerTask('build', ['clean', 'uglify']);
	grunt.registerTask('dev', ['clean', 'copy', 'express', 'watch']);
};
