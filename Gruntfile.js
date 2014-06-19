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
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'client/app/',
                        src: ['**/*.js'],
                        dest: 'client/build',
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
        imagemin: {
            client: {
                files: [{
                    expand: true,
                    cwd: 'client/assets/images',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'client/web/images'
                }]
            },
        },
        jshint: {
            files: [
                'client/app/**/*.js',
                'server/app/**/*.js',
                'shared/**/*.js',
                'Gruntfile.js'
            ],
            options: {
                'curly': true, // require curly braces
                'eqeqeq': true, // use === and !==
                'forin': true, // use hasOwnProperty in for in loops
                'latedef': true, // prevent variables being used before defined
                'newcap': true, // captialize constructor functions
                'noarg': true, // prevent arguments.caller and arguments.callee
                'eqnull': true, // do not use === null
                'evil': true, // no eval
                'expr': true, // check expressions
                'laxcomma': true, // comma-first style coding
                'node': true, // node.js
                'trailing': true, // no trailing white-space
                'undef': true, // warn about undefined variables
                //'unused': true, // warn about unused variables
                'camelcase': true, // camel case variable and function names
                'indent': 4, // indent length
                'predef': ['define']
            }
        },
        requirejs: {
            dev: {
                options: {
                    mainConfigFile: 'client/app/config.js',
                    baseUrl: './',
                    appDir: 'client/build/',
                    dir: 'client/web/js',
                    optimize: 'none',
                    removeCombined: true,
                    useStrict: true,
                    cjsTranslate: true
                }
            },
            dist: {
                options: {
                    mainConfigFile: 'client/app/config.js',
                    baseUrl: './',
                    appDir: 'client/build/',
                    dir: 'client/web/js',
                    optimize: 'uglify2',
                    removeCombined: true,
                    useStrict: true,
                    cjsTranslate: true
                }
            }
        },
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
    grunt.registerTask('build', [
        'jshint',
        'copy:build',
        'copy:shared',
        'copy:assets',
        'clean:client',
        'requirejs:dev',
        'clean:build'
    ]);
    grunt.registerTask('dist', [
        'jshint',
        'copy:build',
        'copy:shared',
        'copy:assets',
        'clean:client',
        'requirejs:dist',
        'clean:build',
        'imagemin:client'
    ]);

};
