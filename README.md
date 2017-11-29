# ng-gulp
Build configuration and development environment for Angular 1 applications using Typescript and Sass.

## Installation
The consuming application must include the following dependencies
```
"devDependencies": {    
    "gulp": "3.9.1",
    "ng-gulp": "git@github.com:jedwardhawkins/ng-gulp.git"
}
```

## Usage
### Project Structure
The consuming application should have the following directory structure and files. This structure is [configurable](#options).
* images/
* server/
  * server.js
* src/
  * index.html
  * main.ts
  * main.scss
* vendor/
* gulpfile.js
* tsconfig.json
* tslint.json

Example gulpfile.js:
 
```
var gulp = require('gulp');
var ngGulp = require('ng-gulp');

var ngGulpOptions = {...};

ngGulp(gulp, ngGulpOptions);
```

### Commands
Run these commands from the root of the consuming application:
* `gulp` - Starts development environment (development build, file watchers, and server)
* `gulp build:development` - Development build. This build is optimized for speed. Writes files to `dist/` by default
* `gulp build:production` - Production build. This build is optimized for size and quality of output. Writes files to `dist/` by default
* `gulp clean` - Cleans all built assets by removing `dist/`
* `gulp test` - Compiles and runs unit tests against PhantomJS. *NOTE: must run `gulp build:development` or `gulp build:production` first*
* `gulp test --chrome` - Compiles and runs unit tests against PhantomJS and Chrome.
* `gulp test --edge` - Compiles and runs unit tests against PhantomJS and Microsoft Edge.
* `gulp test --firefox` - Compiles and runs unit tests against PhantomJS and Firefox.
* `gulp test --ie` - Compiles and runs unit tests against PhantomJS and Internet Explorer.
* `gulp test --debug-tests` - Compiles and runs unit tests against PhantomJS. Works with all browser flags. Uses Chrome by default

## Options

### .directories.nodeModules
Type: `String`
Default: `'node_modules'`

Change the directory where NPM modules are installed.

### .directories.output
Type: `String`
Default: `'dist'`

Change the directory where the build output is saved. 

### .directories.outputImages
Type: `String`
Default: `'dist/images'`

Change the directory where where built images are saved.

### .directories.outputVendor
Type: `String`
Default: `'dist/vendor'`

Change the directory where built vendor files are saved.

### .directories.src
Type: `String`
Default: `'src'`

Change the directory where source code is located.

### .directories.vendor
Type: `String|Array<String>`
Default: `'vendor'`

Change the directory where vendor files are located.

### .autoTest
Type: `boolean`
Default: `false`

Run tests on Typescript and HTML file changes in development environment.

### .cssBasename
Type: `String`
Default: `'app'`

Change the base name of `[config.directories.output]\app.css` and `[config.directories.output]\app.min.css`.
This option is **not** valid, if .files.sassManifest is an array.

### .jsBasename
Type: `String`
Default: `'app'`

Change the base name of `[config.directories.output]\app.js` and `[config.directories.output]\app.min.js`

### .debugTests
Type: `boolean`
Default: false

Debug unit tests in browser. Enable option from the command line with `gulp test --debug-tests`. Works with any browser
flag (i.e. `--chrome --edge --firefox --ie`). Uses Chrome for debugging if no browser is specified.

### .devServer
Type: `boolean|Object`
Default: `true`

Start a development server with LiveReload. Serves files in `[config.directories.output]` by default. If `false`, the
development server will not be started as part of the default gulp task. connect configuration can be specified as
an `Object`. *Note: Do not specify port in the connect configuration. Use .devServerPort option instead.*

### .devServerPort
Type: `number`
Default: 8080

The port for the dev server. Override configuration in gulpfile and ng-gulp with commandline argument "--port". 
(ex: `gulp --port=4000`)

### .disableLiveReload
Type: `boolean`
Default: `false`

Disable LiveReload for the development server.

### .junitTestResults
Type: `boolean`
Default: false

Reports the results of unit tests in `[config.directories.output]/test-results.xml`. Enable on the command line via
`gulp test --junit`

### .productionServer
Type: `Object`
Default: `{}`

connect configuration for production server. *Note: Do not specify port in the connect configuration. Use 
.productionServerPort option instead.*

### .productionServerGzip
Type: `boolean`
Default: true

Enable/Disable gzip output and middleware in the server.

### .productionServerPort
Type: `number`
Default: 8080

The port for the production server.

### .testChrome
Type: `boolean`
Default: false

Enable running unit tests in Chrome for task `gulp test`. Enable option from the command line with `gulp test --chrome`.

### .testEdge
Type: `boolean`
Default: false

Enable running unit tests in Edge for task `gulp test`. Enable option from the command line with `gulp test --edge`.

### .testFirefox
Type: `boolean`
Default: false

Enable running unit tests in Firefox for task `gulp test`. Enable option from the command line with `gulp test --firefox`.

### .testIE
Type: `boolean`
Default: false

Enable running unit tests in Internet Explorer for task `gulp test`. Enable option from the command line with `gulp test --ie`.

### .vendorCssBasename
Type: `String`
Default: `'vendor'`

Change the base name of `[config.directories.outputVendor]\vendor.css` and `[config.directories.outputVendor]\vendor.min.css`

### .vendorJsBasename
Type: `String`
Default: `'vendor'`

Change the base name of `[config.directories.outputVendor]\vendor.js` and `[config.directories.outputVendor]\vendor.min.js`

### .externals
Type: `Object`
Default: `{ 'angular': true }`

Merge additional external libraries into the default set of external libraries. This object is passed to Webpack to 
specify modules that will be loaded by the environment, rather than added to the Webpack bundle. NOTE: Some libraries 
contain hyphens in their names. For such libraries use the following format: 
`{ 'angular-ui-router': 'window["angular-ui-router"]' }`

### .files.images
Type: `String|Array<String>`
Default: `'images/**/*.{png,gif,jpg,svg}'`

Merge additional image file glob into default image glob.

### .files.indexDevelopment
Type: `String`
Default: `'src/index.html'`

Specify a different location for the development version of index.html

### .files.indexProduction
Type: `String`
Default: `'src/index.html'`

Specify a different location for the production version of index.html

### .files.sassManifest
Type: `String|Array<String>`
Default: `'src/main.scss'`

Specify a different location for the sass manifest file or multiple manifests. If multiple manifests are specified,
.cssBasename option will use the basename of the files specified.

### .files.srcHtml
Type: `String|Array<String>`
Default: `'src/**/*.html'`

Merge additional source HTML file glob into default source HTML glob.

### .files.srcSass
Type: `String|Array<String>`
Default: `'src/**/*.scss'`

Merge additional source Sass file glob into default source Sass glob.

### .files.srcTypescript
Type: `String|Array<String>`
Default: `'src/**/*.ts'`

Merge additional source Typescript file glob into default source Typescript glob.

### .files.typescriptMainDevelopment
Type: `String`
Default: `'src/main.ts'`

Specify a different location for the main Typescript file in development.

### .files.typescriptMainProduction
Type: `String`
Default: `'src/main.ts'`

Specify a different location for the main Typescript file in production.

### .files.typescriptMainTest
Type: `String`
Default: `'src/main.ts'`

Specify a different location for the main Typescript file in test.

### .files.vendorDevelopment
Type: `Array<String>`
Default: `[]`

Specify vendor dependencies for development. Non-Javascript and Non-CSS files are copied to the directory at 
`[config.directories.outputVendor]`. Javascript and CSS files are bundled into 
`[config.directories.outputVendor]\[config.vendorJsBasename].js` and
`[config.directories.outputVendor]\[config.vendorCssBasename].css` respectively.

### .files.vendorProduction
Type: `Array<String>`
Default: `[]`

Specify vendor dependencies for production. Non-Javascript and Non-CSS files are copied to the directory at 
`[config.directories.outputVendor]`. Javascript and CSS files are bundled into 
`[config.directories.outputVendor]\[config.vendorJsBasename].js` and
`[config.directories.outputVendor]\[config.vendorCssBasename].css` respectively.

### .files.vendorTest
Type: `Array<String>`
Default: `[]`

Specify vendor dependencies for test.

### .gulpConnectMiddlewareApps

Type: `Array<any>`
Default: `[]`

Provides a way to add one or more custom middleware apps to be loaded by gulp-connect in the serve:production and serve:development tasks (see: https://github.com/avevlad/gulp-connect#optionsmiddleware).

For example:

```
var app = require('express').express();

app.get('/hello', function(req, res) {
    res.send('Hello World!');
});

ngGulp(gulp, {
    ...
    gulpConnectMiddlewareApps: [app]
});
```

## Testing
### Unit tests
Execute a single run of the unit test suite by running `gulp test` using PhantomJS. `gulp test --chrome` will run the 
tests in PhantomJS and Chrome. Place unit tests under `src/` with the suffix `test.ts` to include tests in the suite.

`--chrome --edge --firefox --ie` are all supported commandline options.

In order to keep the browser open for debugging, use the `--debug-tests` commandline option.

JUnit test results can be generated via the `.junitTestResults` option or by the `--junit` commandline option. Results
are published to `[config.directories.output]/test-results.xml`.

To enable running tests on file changes, set the `.autoWatch` option to true. *NOTE: this causes memory issues with
 webpack and may slow down the response time of gulp and the auto reload feature.*

### E2E tests
Coming soon

## Custom Middleware

In addition to using the `gulpConnectMiddlewareApps` configuration option, you can also have custom middleware apps loaded automatically by exporting a variable in the file: server/server.js.  ng-gulp automatically takes whatever is exported by this file, and adds it to the `gulpConnectMiddlewareApps` array when running the serve:production and serve:development tasks.

Example server/server.js file:

```
var express = require('express');
var app = express();

app.get('/hello', function(req, res) {
    res.send('Hello World!');
});

module.exports = app;
```

