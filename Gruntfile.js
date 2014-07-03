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

    require('load-grunt-tasks')(grunt);

    var bowerMainFiles = findBowerMainFiles(
        path.resolve(__dirname, 'client/bower_components')
    );

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            client: 'client/web/js',
            build: 'client/build'
        },
        copy: {
            // copies the client application files for the build
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'client/app/',
                        src: ['**/*.js'],
                        dest: 'client/build/app',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'client/bower_components/',
                        src: bowerMainFiles,
                        dest: 'client/build/lib',
                        filter: 'isFile'
                    }
                ]
            },
            // copies the shared files for the client during the build
            shared: {
                files: [
                    {
                        expand: true,
                        cwd: 'shared/',
                        src: ['**/*.js'],
                        dest: 'client/build/shared',
                        filter: 'isFile'
                    }
                ]
            },
            // copies the socket.io client library for the build
            'socket.io': {
                files: [
                    {
                        expand: true,
                        cwd: 'node_modules/socket.io/node_modules/socket.io-client',
                        src: ['socket.io.js'],
                        dest: 'client/build/lib/socket.io',
                        filter: 'isFile'
                    }
                ]
            },
            // copies the assets for the build
            assets: {
                files: [
                    {
                        expand: true,
                        cwd: 'client/assets',
                        src: ['**/*.{png,json}'],
                        dest: 'client/web/assets',
                        filter: 'isFile'
                    }
                ]
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
                    cwd: 'client/assets/images',
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
        requirejs: {
            // development build, client application is built as separate files
            dev: {
                options: {
                    mainConfigFile: 'client/app/config.js',
                    baseUrl: './',
                    appDir: 'client/build/',
                    dir: 'client/web/js/',
                    optimize: 'none',
                    removeCombined: true,
                    useStrict: true,
                    cjsTranslate: true
                }
            },
            // distribution build, client application is combined to a single file
            dist: {
                options: {
                    mainConfigFile: 'client/app/config.js',
                    baseUrl: './',
                    appDir: 'client/build/',
                    dir: 'client/web/js/',
                    optimize: 'uglify2',
                    modules: [
                        {
                            name: 'client',
                            exclude: ['lodash', 'jquery', 'phaser', 'socket.io'],
                        }
                    ],
                    removeCombined: true,
                    useStrict: true,
                    cjsTranslate: true
                }
            }
        },
        // watch plugin configuration
        watch: {
            client: {
                files: [
                    'client/app/**/*.js',
                    'shared/**/*.js'
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
        'copy:build',
        'copy:shared',
        'copy:assets',
        'copy:socket.io',
        'clean:client',
        'requirejs:dev',
        'clean:build'
    ]);

    // distribution build task
    grunt.registerTask('dist', [
        'copy:build',
        'copy:shared',
        'copy:assets',
        'copy:socket.io',
        'clean:client',
        'requirejs:dist',
        'clean:build',
        'imagemin:assets'
    ]);

};
