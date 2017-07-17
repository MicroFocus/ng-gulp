var _ = require('lodash');
var connectGzip = require('connect-gzip');
var gulpAutoprefixer = require('gulp-autoprefixer');
var gulpClean = require('gulp-clean');
var gulpCleanCss = require('gulp-clean-css');
var gulpConcat = require('gulp-concat');
var gulpConnect = require('gulp-connect');
var gulpGzip = require('gulp-gzip');
var gulpIf = require('gulp-if');
var gulpIgnore = require('gulp-ignore');
var gulpImageMin = require('gulp-imagemin');
var gulpRename = require('gulp-rename');
var gulpSass = require('gulp-sass');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpUglify = require('gulp-uglify');
var gulpWatch = require('gulp-watch');
var karmaServer = require('karma').Server;
var minimist = require('minimist');
var path = require('path');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var webpackMerge = require('webpack-merge');
var fs = require('fs');


var cwd = process.cwd();
var defaults = {
    autoTest: false,
    cssBasename: 'app',
    debugTests: false,
    devServer: true,
    devServerPort: 8080,
    gulpConnectMiddlewareApps: [],
    directories: {
        nodeModules: path.resolve(cwd, 'node_modules'),
        output: path.resolve(cwd, 'dist'),
        outputImages: path.resolve(cwd, 'dist/images'),
        outputVendor: path.resolve(cwd, 'dist/vendor'),
        src: path.resolve(cwd, 'src'),
        vendor: path.resolve(cwd, 'vendor')
    },
    externals: { 'angular': true },
    files: {
        images: path.resolve(cwd, 'images/**/*.{png,gif,jpg,svg}'),
        indexDevelopment: path.resolve(cwd, 'src/index.html'),
        indexProduction: path.resolve(cwd, 'src/index.html'),
        sassManifest: path.resolve(cwd, 'src/main.scss'),
        srcHtml: path.resolve(cwd, 'src/**/*.html'),
        srcSass: path.resolve(cwd, 'src/**/*.scss'),
        srcTypescript: path.resolve(cwd, 'src/**/*.ts'),
        tests: path.resolve(cwd, 'src/**/*.test.ts'),
        typescriptMainDevelopment: path.resolve(cwd, 'src/main.ts'),
        typescriptMainProduction: path.resolve(cwd, 'src/main.ts'),
        typescriptMainTest: path.resolve(cwd, 'src/main.ts'),
        vendorDevelopment: [ ],
        vendorProduction: [ ],
        vendorTest: [ ]
    },
    jsBasename: 'app',
    junitTestResults: false,
    productionServerGzip: true,
    productionServerPort: 8080,
    testChrome: false,
    testEdge: false,
    testFirefox: false,
    testIE: false,
    vendorCssBasename: 'vendor',
    vendorJsBasename: 'vendor'
};

function excludePattern(patterns) {
    if (/^!/.test(patterns)) {
        return patterns;
    }

    return '!' + patterns;
}

function exclude(patterns) {
    if (_.isString(patterns)) {
        return excludePattern(patterns);
    }

    throw new Error('Type not supported. Pattern must be a string.');
}

function getDefaultTasks(config) {
    var tasks = [ 'build:development', 'watch' ];

    if(config.devServer !== false) {
        tasks.push('serve:development');
    }

    return tasks;
}

function getWebpackConfig(config, webpackConfig) {
    return webpackMerge({
        externals: config.externals,
        module: {
            preLoaders: [
                {
                    test: /\.ts$/,
                    loader: 'tslint'
                }
            ],
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'ts',
                    exclude: new RegExp(config.directories.nodeModules)
                },
                {
                    test: /\.html$/,
                    loader: 'ngtemplate?relativeTo=' + config.directories.src + '/!html?attrs=false'
                },
                {
                    test: /\.json/,
                    loader: 'json'
                }
            ]
        },
        output: {
            filename: '[name].js',
            path: config.directories.output
        },
        resolve: {
            extensions: [ '', '.ts', '.js', '.json' ],
            modulesDirectories: [
                config.directories.src,
                config.directories.vendor,
                config.directories.nodeModules
            ]
        }
    }, webpackConfig);
}

function registerTasks(gulp, config) {
    gulp.task('build:development', [
        'copy:development',
        'vendor:development',
        'sass:development',
        'webpack:development'
    ]);

    gulp.task('build:production', [
        'copy:production',
        'optimize:images',
        'vendor:production',
        'sass:production',
        'webpack:production'
    ]);

    gulp.task('clean', function() {
        return gulp
            .src(config.directories.output)
            .pipe(gulpClean({force: true}));
    });

    gulp.task('copy:development', [
        'copy:images',
        'copy:index:development',
        'copy:vendor:development'
    ]);

    gulp.task('copy:production', [
        'copy:index:production',
        'copy:vendor:production'
    ]);

    gulp.task('copy:images', function() {
        return gulp
            .src(config.files.images)
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.outputImages));
    });

    gulp.task('copy:index:development', function() {
        return gulp
            .src(config.files.indexDevelopment)
            .pipe(gulpRename({ basename: 'index', extname: '.html' }))
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.output));
    });

    gulp.task('copy:index:production', function() {
        return gulp
            .src(config.files.indexProduction)
            .pipe(gulpRename({ basename: 'index', extname: '.html' }))
            .pipe(gulp.dest(config.directories.output));
    });

    gulp.task('copy:vendor:development', function() {
        return gulp
            .src(config.files.vendorDevelopment)
            .pipe(gulpIgnore.exclude('**/*.{css,js}'))
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('copy:vendor:production', function() {
        return gulp
            .src(config.files.vendorProduction)
            .pipe(gulpIgnore.exclude('**/*.{css,js}'))
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('default', getDefaultTasks(config));

    gulp.task('optimize:images', function() {
        return gulp
            .src(config.files.images)
            .pipe(gulpImageMin())
            .pipe(gulp.dest(config.directories.outputImages));
    });

    gulp.task('vendor:development', [ 'vendor:development:css', 'vendor:development:js' ]);

    gulp.task('vendor:development:css', function() {
        return gulp
            .src(config.files.vendorDevelopment)
            .pipe(gulpIgnore.include('**/*.css'))
            .pipe(gulpSourcemaps.init())
            .pipe(gulpConcat(config.vendorCssBasename + '.css'))
            .pipe(gulpSourcemaps.write())
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('vendor:development:js', function() {
        return gulp
            .src(config.files.vendorDevelopment)
            .pipe(gulpIgnore.include('**/*.js'))
            .pipe(gulpSourcemaps.init())
            .pipe(gulpConcat(config.vendorJsBasename + '.js'))
            .pipe(gulpSourcemaps.write())
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('vendor:production', [ 'vendor:production:css', 'vendor:production:js' ]);

    gulp.task('vendor:production:css', function() {
        return gulp
            .src(config.files.vendorProduction)
            .pipe(gulpIgnore.include('**/*.css'))
            .pipe(gulpConcat(config.vendorCssBasename + '.css'))
            .pipe(gulp.dest(config.directories.outputVendor))
            .pipe(gulpSourcemaps.init())
            .pipe(gulpCleanCss())
            .pipe(gulpRename({ basename: config.vendorCssBasename, extname: '.min.css' }))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(config.directories.outputVendor))
            .pipe(gulpIf(config.productionServerGzip, gulpGzip()))
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('vendor:production:js', function() {
        return gulp
            .src(config.files.vendorProduction)
            .pipe(gulpIgnore.include('**/*.js'))
            .pipe(gulpConcat(config.vendorJsBasename + '.js'))
            .pipe(gulp.dest(config.directories.outputVendor))
            .pipe(gulpSourcemaps.init())
            .pipe(gulpUglify())
            .pipe(gulpRename({ extname: '.min.js' }))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(config.directories.outputVendor))
            .pipe(gulpIf(config.productionServerGzip, gulpGzip()))
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('sass:development', function() {
        var multipleManifests = _.isArray(config.files.sassManifest) && config.files.sassManifest.length > 1;

        return gulp
            .src(config.files.sassManifest)
            .pipe(gulpSourcemaps.init())
            .pipe(gulpSass({ outputStyle: 'expanded' }).on('error', gulpSass.logError))
            .pipe(gulpIf(!multipleManifests, gulpRename({ basename: config.cssBasename })))
            .pipe(gulpAutoprefixer({ browsers: [ 'last 2 versions' ] }))
            .pipe(gulpSourcemaps.write())
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.output));
    });

    gulp.task('sass:production', function() {
        var multipleManifests = _.isArray(config.files.sassManifest) && config.files.sassManifest.length > 1;

        return gulp
            .src(config.files.sassManifest)
            .pipe(gulpSass({ outputStyle: 'expanded' }).on('error', gulpSass.logError))
            .pipe(gulpAutoprefixer({ browsers: [ 'last 2 versions' ] }))
            .pipe(gulpIf(!multipleManifests, gulpRename({ basename: config.cssBasename })))
            .pipe(gulp.dest(config.directories.output))
            .pipe(gulpSourcemaps.init())
            .pipe(gulpCleanCss())
            .pipe(gulpIf(!multipleManifests, gulpRename({ basename: config.cssBasename })))
            .pipe(gulpRename({ extname: '.min.css' }))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(config.directories.output))
            .pipe(gulpIf(config.productionServerGzip, gulpGzip()))
            .pipe(gulp.dest(config.directories.output));
    });

    gulp.task('add-custom-middleware', function() {
        if (fs.existsSync(path.resolve(cwd, 'server/server.js'))) {
            var customMiddleware = require(path.resolve(cwd, 'server/server.js'));
            config.gulpConnectMiddlewareApps.push(customMiddleware);
        }
    });

    gulp.task('serve:development', ['add-custom-middleware'], function() {
        var defaults = {
            livereload: true,
            middleware: function() { return config.gulpConnectMiddlewareApps; },
            port: config.devServerPort,
            root: [ config.directories.output ]
        };

        var options = config.devServer || {};
        options = _.merge(defaults, options);

        gulpConnect.server(options);
    });

    gulp.task('serve:production', ['add-custom-middleware'], function() {
        if (config.productionServerGzip) {
            config.gulpConnectMiddlewareApps.push(connectGzip.gzip());
        }

        var defaults = {
            livereload: false,
            middleware: function() { return config.gulpConnectMiddlewareApps; },
            port: config.productionServerPort,
            root: [ config.directories.output ]
        };

        var options = config.productionServer || {};
        options = _.merge(defaults, options);

        gulpConnect.server(options);
    });

    gulp.task('test', function(callback) {
        var srcBundlePath = path.join(config.directories.output, config.jsBasename + '.js');
        var srcCssPath = path.join(config.directories.output, config.cssBasename + '.css');

        var preprocessors = {};
        preprocessors[config.files.tests] = [ 'webpack' ];

        var testInBrowser = config.testChrome || config.testEdge || config.testFirefox || config.testIE;

        var browsers = [ 'PhantomJS' ];
        if (config.testChrome) {
            browsers.push('Chrome');
        }
        if (config.testEdge) {
            browsers.push('Edge');
        }
        if (config.testFirefox) {
            browsers.push('Firefox');
        }
        if (config.testIE) {
            browsers.push('IE')
        }
        if (config.debugTests && !(testInBrowser)) {
            testInBrowser = true;
            browsers.push('Chrome');
        }

        var reporters = [ 'progress' ];
        var junitConfiguration = {};
        if(config.junitTestResults) {
            reporters.push('junit');
            junitConfiguration['outputFile'] = path.resolve(config.directories.output, 'test-results.xml');
        }

        new karmaServer(
            {
                autoWatch: testInBrowser,
                basePath: cwd,
                browsers: browsers,
                colors: true,
                concurrency: Infinity,
                frameworks: [ 'jasmine' ],
                files: config.files.vendorTest.concat(srcBundlePath, srcCssPath, config.files.tests ),
                junitReporter: junitConfiguration,
                logLevel: config.LOG_INFO,
                mime: { 'text/x-typescript': ['ts','tsx'] },
                port: 9876,
                preprocessors: preprocessors,
                reporters: reporters,
                singleRun: !config.debugTests,
                webpack: {
                    externals: config.externals,
                    module: {
                        preLoaders: [
                            {
                                test: /\.ts$/,
                                loader: 'tslint'
                            }
                        ],
                        loaders: [
                            {
                                test: /\.ts$/,
                                loader: 'ts',
                                exclude: new RegExp(config.directories.nodeModules)
                            },
                            {
                                test: /\.html$/,
                                loader: 'ngtemplate?relativeTo=' + config.directories.src + '/!html?attrs=false'
                            },
                            {
                                test: /\.json/,
                                loader: 'json'
                            }
                        ]
                    },
                    resolve: {
                        extensions: ['', '.ts', '.js'],
                        modulesDirectories: [
                            config.directories.src,
                            config.directories.vendor,
                            config.directories.nodeModules
                        ]
                    }
                },
                webpackMiddleware: {
                    // display no info to console (only warnings and errors)
                    noInfo: true,
                    stats: { colors: true }
                }
            }, callback)
            .start();
    });

    gulp.task('watch', [
        'watch:html',
        'watch:images',
        'watch:index',
        'watch:sass',
        'watch:ts',
        'watch:vendor'
    ]);

    gulp.task('watch:html', function() {
        return gulpWatch(config.files.srcHtml, function() {
            gulp.start('webpack:development');

            if (config.autoTest) {
                gulp.start('test');
            }
        });
    });

    gulp.task('watch:images', function() {
        return gulpWatch(config.files.images, function() {
            gulp.start('copy:images');
        });
    });

    gulp.task('watch:index', function() {
        return gulpWatch(config.files.indexDevelopment, function() {
            gulp.start('copy:index:development');
        });
    });

    gulp.task('watch:sass', function() {
        return gulpWatch(config.files.srcSass, function() {
            gulp.start('sass:development');
        });
    });

    gulp.task('watch:ts', function() {
        return gulpWatch([ config.files.srcTypescript, exclude(config.files.tests) ], function() {
            gulp.start('webpack:development');

            if (config.autoTest) {
                gulp.start('test');
            }
        });
    });

    gulp.task('watch:vendor', function() {
        return gulpWatch(config.files.vendorDevelopment, function() {
            gulp.start('copy:vendor:development');
            gulp.start('vendor:development');
        });
    });

    gulp.task('webpack:development', function() {
        var entry = {};
        entry[config.jsBasename] = config.files.typescriptMainDevelopment;

        return gulp
            .src(config.files.typescriptMainDevelopment)
            .pipe(webpackStream(getWebpackConfig(config, {
                devtool: 'cheap-module-inline-source-map',
                entry: entry
            })))
            .on('error', function() { this.emit('end'); })
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.output))
    });

    gulp.task('webpack:production', function() {
        var entry = {};
        entry[config.jsBasename] = config.files.typescriptMainProduction;

        return gulp
            .src(config.files.typescriptMainProduction)
            .pipe(webpackStream(getWebpackConfig(config, { entry: entry })))
            .pipe(gulpRename({ basename: config.jsBasename }))
            .pipe(gulp.dest(config.directories.output))
            .pipe(gulpSourcemaps.init())
            .pipe(gulpUglify())
            .pipe(gulpRename({ basename: config.jsBasename, extname: '.min.js' }))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(config.directories.output))
            .pipe(gulpIf(config.productionServerGzip, gulpGzip()))
            .pipe(gulp.dest(config.directories.output));
    });
}


module.exports = function ngGulp(gulp, config) {
    // Read arguments from command line
    var knownOptions = {
        string: [ 'port' ],
        boolean: [ 'chrome', 'debug-tests', 'edge', 'firefox', 'ie', 'junit' ],
        alias: {
            chrome: 'testChrome',
            'debug-tests': 'debugTests',
            edge: 'testEdge',
            firefox: 'testFirefox',
            ie: 'testIE',
            junit: 'junitTestResults',
            port: 'devServerPort'
        },
        default: {
            chrome: config.testChrome || defaults.testChrome,
            debugTests: config.debugTests || defaults.debugTests,
            edge: config.testEdge || defaults.testEdge,
            firefox: config.testFirefox || defaults.testFirefox,
            ie: config.testIE || defaults.testIE,
            junitTestResults: config.junitTestResults || defaults.junitTestResults,
            port: config.port || defaults.port
        }
    };
    var args = minimist(process.argv.slice(2), knownOptions);

    // Add/Merge defaults to configuration
    config = _.merge(defaults, config, args);

    // Register Tasks
    registerTasks(gulp, config);
};
