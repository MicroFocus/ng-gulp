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

### .devServer
Type: `boolean`
Default: `true`

Start a development server with LiveReload. Serves files in `[config.directories.output]` by default.

### .devServerPort
Type: `number`
Default: 8080

The port for the dev server. Override configuration in gulpfile and ng-gulp with commandline argument "--port". 
(ex: `gulp --port=4000`)

### .productionServerGzip
Type: `boolean`
Default: true

Enable/Disable gzip output and middleware in the server.

### .productionServerPort
Type: `number`
Default: 8080

The port for the production server.

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

## Testing
### Unit tests
Coming soon

### E2E tests
Coming soon
