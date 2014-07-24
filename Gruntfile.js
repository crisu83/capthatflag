module.exports = function(grunt) {

    var path = require('path'),
        fs = require('fs');

    /**
     * Parses the given components path and returns a list with the main file for each bower dependency.
     * @param {string} componentsPath path to Bower components
     * @returns {Array} list of files
     */
    function findBowerMainFiles(componentsPath) {
        var files = [];

        fs.readdirSync(componentsPath).filter(function (file) {
            return fs.statSync(path.join(componentsPath, file)).isDirectory();
        }).forEach(function (packageName) {
            var bowerJsonPath = path.join(componentsPath, packageName, 'bower.json');
            if (fs.existsSync(bowerJsonPath)) {
                var json = grunt.file.readJSON(bowerJsonPath);
                files.push(path.join(packageName, json.main));
            }
        });

        return files;
    }

    // time the grunt build
    require('time-grunt')(grunt);

    // enable the "just-in-time" plugin loader
    require('jit-grunt')(grunt);

    var bowerMainFiles = findBowerMainFiles(
        path.resolve(__dirname, 'client/bower_components')
    );

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            client: 'client/web',
            build: 'client/build'
        },
        browserify: {
            client: {
                files: {
                    'client/build/client.bundle.js': 'client/app/client.js'
                }
            }
        },
        concat: {
            client: {
                src: [
                    'client/build/lib/**/*.js',
                    'client/build/client.bundle.js'
                ],
                dest: 'client/build/client.js'
            },
        },
        copy: {
            client: {
                files: [
                    {
                        expand: true,
                        cwd: 'client/build',
                        src: ['client.js'],
                        dest: 'client/web/js',
                        filter: 'isFile'
                    }
                ]
            },
            index: {
                files: [
                    {
                        expand: true,
                        cwd: 'client',
                        src: ['index.html'],
                        dest: 'client/web',
                        filter: 'isFile'
                    }
                ]
            },
            // copies the client application files for the build
            libs: {
                files: [
                    {
                        expand: true,
                        cwd: 'client/bower_components/',
                        src: bowerMainFiles,
                        dest: 'client/build/lib',
                        filter: 'isFile'
                    }
                ]
            },
            // copies the assets for the build
            assets: {
                files: [
                    {
                        expand: true,
                        cwd: 'assets',
                        src: ['**/*.*'],
                        dest: 'client/web/assets',
                        filter: 'isFile'
                    }
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'client/web/index.html': 'client/index.html'
                }
            }
        },
        // documentation parser configuration
        jsdoc : {
            dist : {
                src: [
                    'client/app/**/*.js',
                    'server/app/**/*.js',
                    'shared/**/*.js'
                ],
                options : {
                    destination : 'docs',
                    template: 'node_modules/ink-docstrap/template'
                }
            }
        },
        // image minifaction configuration
        imagemin: {
            assets: {
                files: [{
                    expand: true,
                    cwd: 'assets/images',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'client/web/images'
                }]
            },
        },
        // jshint configuration
        jshint: {
            files: [
                'client/app/**/*.js',
                'server/app/**/*.js',
                'shared/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        uglify: {
            client: {
                files: {
                    'client/web/js/client.js': ['client/build/client.js']
                }
            }
        },
        // watch plugin configuration
        watch: {
            client: {
                files: [
                    'client/app/**/*.js',
                    'shared/**/*.js',
                    'assets/images/**/*.png',
                    'data/**/*.json'
                ],
                tasks: ['build'],
                options: {
                    livereload: true,
                    spawn: false
                }
            },
            lint: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint']
            }
        }
    });

    grunt.registerTask('default', []);

    // development build task
    grunt.registerTask('build', [
        'jshint',
        'browserify:client',
        'copy:libs',
        'concat:client',
        'clean:client',
        'copy:assets',
        'copy:client',
        'clean:build',
        'copy:index'
    ]);

    // distribution build task
    grunt.registerTask('dist', [
        'browserify:client',
        'copy:libs',
        'concat:client',
        'clean:client',
        'copy:assets',
        'uglify:client',
        'clean:build',
        'htmlmin:dist',
        'imagemin:assets'
    ]);

};
