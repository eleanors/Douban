'use strict';

module.exports = function(grunt) {
        require('load-grunt-tasks')(grunt); // 加载全部grunt插件
        grunt.initConfig({ // 定义的任务
                pkg: grunt.file.readJSON('package.json'),

                watch: {
                        jade: {
                                files: ['views/**']
                        },
                        js: {
                                files: ['public/scripts/**', 'test/**', 'app/**/*.js'],
                                tasks: ['jshint']
                        },
                        styles: {
                                files: ['public/sass/**'],
                                tasks: ['sass']
                        }
                },
                // 检查文件语法等问题
                jshint: {
                        options: {
                                jshintrc: '.jshintrc',
                                ignores: ['node_modules/**', 'public/scripts/libs/*.js']
                        },
                        build: ['public/scripts/**', 'test/**', 'app/**/*.js']
                },
                //css压缩
                cssmin: {
                        options: {
                                shorthandCompacting: false,
                                roundingPrecision: -1,
                                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                                beautify: {
                                        ascii_only: true //中文ascii化，非常有用！防止中文乱码的神配置
                                }
                        },
                        build: {
                                files: [{
                                        expand: true,
                                        cwd: '<%= config.static_dest%>',
                                        //相对路径
                                        src: ['*.css', '!*.min.css'],
                                        dest: '<%= config.static_dest%>',
                                        ext: '.min.css',
                                        rename: function(dest, src) {
                                                var folder = src.substring(0, src.lastIndexOf('/'));
                                                var filename = src.substring(src.lastIndexOf('/'), src.length);
                                                //  var filename=src;  
                                                filename = filename.substring(0, filename.lastIndexOf('.'));
                                                var fileresult = dest + folder + filename + '.css';
                                                grunt.log.writeln("现处理文件：" + src + "  处理后文件：" + fileresult);

                                                return fileresult;
                                                //return  filename + '.min.js';  
                                        }
                                }]
                        }
                },

                autoprefixer: {

                        options: {
                                // Task-specific options go here.
                                diff: true
                        },
                        your_target: {
                                // Target-specific file lists and/or options go here. 
                        }
                },
                // Sass编译
                sass: {
                        dist: { // 编译任务
                                options: {
                                        style: 'compact',
                                        // CSS输出格式
                                        update: true,
                                        // 仅对改变的Sass执行编译
                                        cacheLocation: 'public/sass/.sass-cache' // sass编译缓存存储路径
                                },
                                files: [{
                                        expand: true,
                                        cwd: 'public/sass/',
                                        // sass路径
                                        src: ['*.scss', '**/*.scss'],
                                        // 执行编译sass文件
                                        dest: 'public/css/',
                                        // 输出CSS路径
                                        ext: '.css' // CSS文件格式
                                }]
                        }
                },
                // js压缩
                uglify: {
                        options: {
                                stripBanners: true,
                                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
                        },
                        development: {
                                files: {
                                        'build/admin.min.js': ['public/scripts/index.js'],
                                        'build/libs.min.js': ['public/scripts/libs/*.js'],
                                        'build/movie.min.js': ['public/scripts/js/movie/*.js'],
                                        'build/music.min.js': ['public/scripts/js/music/*.js'],
                                        'build/user.min.js': ['public/scripts/js/user/*.js'],
                                        'build/movie.ctrl.min.js': ['app/controllers/movie/*.js']
                                }
                        }
                },

                nodemon: {
                        dev: {
                                script: 'server.js',
                                // Script that nodemon runs and restarts when changes are detected.
                                options: {
                                        // file: 'app.js',
                                        nodeArgs: ['--debug'],
                                        ignore: ['README.md', 'node_modules/**'],
                                        watch: ['.'],
                                        debug: true,
                                        delay: 5000,
                                        env: {
                                                PORT: 3000
                                        },
                                        cwd: __dirname,
                                        callback: function(nodemon) {
                                                nodemon.on('log', function(event) {
                                                        console.log(event.colour);
                                                });

                                                // opens browser on initial server start 
                                                nodemon.on('config:update', function() {
                                                        // Delay before server listens on port 
                                                        setTimeout(function() {
                                                                require('open')('http://localhost:5455');
                                                        },
                                                        1000);
                                                });

                                                // refreshes browser when server reboots 
                                                nodemon.on('restart', function() {
                                                        // Delay before server listens on port 
                                                        setTimeout(function() {
                                                                require('fs').writeFileSync('.rebooted', 'rebooted');
                                                        },
                                                        1000);
                                                });
                                        }
                                }
                        }
                },

                rev: {
                        options: {
                                encoding: 'utf8',
                                algorithm: 'md5',
                                length: 8,
                                assets: {
                                        files: [{
                                                src: ['dist/*.{css,jpg,jpeg,gif,png,js}']
                                        }]
                                }
                        }
                },
                // 测试任务
                mochaTest: {
                        options: {
                                reporter: 'spec',
                                // 测试报告的格式
                        },
                        src: ['test/**/*.js']
                },
                // 并行执行任务
                concurrent: {
                        tasks: ['jshint', 'watch', 'sass', 'uglify', 'rev'],  // , 'nodemon'
                        options: {
                                logConcurrentOutput: true
                        }
                }
        });

        grunt.option('force', true) // 便于开发时不要因为某些语法错误中断整个任务
        // 注册默认任务
        grunt.registerTask('default', ['concurrent']);
        grunt.registerTask('test', ['mochaTest']); // 单元测试任务
}