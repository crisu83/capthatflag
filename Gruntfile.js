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
            scripts: 'client/web/js',
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
            }
        },
        requirejs: {
            app: {
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
            }
        },
        watch: {
            scripts: {
                files: [
                    'client/app/**/*.js',
                    'Gruntfile.js',
                    'shared/**/*.js'
                ],
                tasks: ['build']
            }
        }
    });

    grunt.registerTask('default', []);
    grunt.registerTask('build', ['copy', 'clean:scripts', 'requirejs', 'clean:build']);

};
