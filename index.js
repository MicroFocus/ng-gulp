var _ = require('lodash');
var gulpAutoprefixer = require('gulp-autoprefixer');
var gulpClean = require('gulp-clean');
var gulpCleanCss = require('gulp-clean-css');
var gulpConcat = require('gulp-concat');
var gulpConnect = require('gulp-connect');
var gulpIgnore = require('gulp-ignore');
var gulpImageMin = require('gulp-imagemin');
var gulpRename = require('gulp-rename');
var gulpSass = require('gulp-sass');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpUglify = require('gulp-uglify');
var gulpWatch = require('gulp-watch');
var minimist = require('minimist');
var path = require('path');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var webpackMerge = require('webpack-merge');


var cwd = process.cwd();
var defaults = {
    cssBasename: 'app',
    devServer: true,
    devServerPort: 8080,
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
        typescriptMainDevelopment: path.resolve(cwd, 'src/main.ts'),
        typescriptMainProduction: path.resolve(cwd, 'src/main.ts'),
        vendorDevelopment: [ ],
        vendorProduction: [ ]
    },
    jsBasename: 'app',
    vendorCssBasename: 'vendor',
    vendorJsBasename: 'vendor'
};


function getDefaultTasks(config) {
    var tasks = [ 'build:development', 'watch' ];

    if(config.devServer) {
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
            .pipe(gulpSourcemaps.init())
            .pipe(gulpConcat(config.vendorCssBasename + '.css'))
            .pipe(gulpCleanCss())
            .pipe(gulpRename({ extname: '.min.css' }))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('vendor:production:js', function() {
        return gulp
            .src(config.files.vendorProduction)
            .pipe(gulpIgnore.include('**/*.js'))
            .pipe(gulpSourcemaps.init())
            .pipe(gulpConcat(config.vendorJsBasename + '.js'))
            .pipe(gulpUglify())
            .pipe(gulpRename({ extname: '.min.js' }))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(config.directories.outputVendor));
    });

    gulp.task('sass:development', function() {
        return gulp
            .src(config.files.sassManifest)
            .pipe(gulpSourcemaps.init())
            .pipe(gulpSass({ outputStyle: 'expanded' }).on('error', gulpSass.logError))
            .pipe(gulpRename({ basename: config.cssBasename }))
            .pipe(gulpAutoprefixer({ browsers: [ 'last 2 versions' ] }))
            .pipe(gulpSourcemaps.write())
            .pipe(gulpConnect.reload())
            .pipe(gulp.dest(config.directories.output));
    });

    gulp.task('sass:production', function() {
        return gulp
            .src(config.files.sassManifest)
            .pipe(gulpSourcemaps.init())
            .pipe(gulpSass({ outputStyle: 'expanded' }).on('error', gulpSass.logError))
            .pipe(gulpAutoprefixer({ browsers: [ 'last 2 versions' ] }))
            .pipe(gulpCleanCss())
            .pipe(gulpRename({ basename: config.cssBasename, extname: '.min.css' }))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(config.directories.output));
    });

    gulp.task('serve:development', function() {
        gulpConnect.server({
            livereload: true,
            port: config.devServerPort,
            root: config.directories.output
        });
    });

    gulp.task('serve:production', function() {
        gulpConnect.server({
            livereload: false,
            port: config.devServerPort,
            root: config.directories.output
        });
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
        return gulpWatch(config.files.srcTypescript, function() {
            gulp.start('webpack:development');
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
            .pipe(webpackStream(getWebpackConfig(config, {
                devtool: 'source-map',
                entry: entry,
                output: {
                    filename: '[name].min.js'
                },
                plugins: [
                    new webpack.optimize.UglifyJsPlugin()
                ]
            })))
            .pipe(gulp.dest(config.directories.output))
    });
}


module.exports = function ngGulp(gulp, config) {
    // Read arguments from command line
    var knownOptions = {
        string: [ 'port' ],
        alias: { port: 'devServerPort' },
        default: { port: config.port || defaults.port }
    };
    var args = minimist(process.argv.slice(2), knownOptions);

    // Add/Merge defaults to configuration
    config = _.merge(defaults, config, args);

    // Register Tasks
    registerTasks(gulp, config);
};
