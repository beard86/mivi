'use strict';

/* file paths */
var gulp = require('gulp'),
imagemin = require('gulp-imagemin'),
    req = require('gulp-load-plugins')(), //Use load plugins to load plugins on demand
    del = require('del'), //plugins that doesnt start with 'gulp-'' needs to be defined here
    sequal = require('run-sequence'), //this plugin will help with asynchronous issue
    arg = require('yargs').argv, //pass arguments in/from terminal
    map = require('map-stream'),//Create a through stream from an asyncronous function.
    //pagespeed = require('psi'); //pagespeed API
    browserSync = require('browser-sync');

var declare = require('gulp-declare');
var concat = require('gulp-concat');
var merge = require('merge-stream');

var path = require('path');
var wrap = require('gulp-wrap');

// Development Paths
var pathDev = {
  js: ['app/assets/js/*.js', '!app/assets/js/vendor/', '!app/assets/js/lib/'],
  images: ['app/assets/img/*','app/assets/img/**/*'],
  data: ['app/assets/data/*.json','app/assets/data/**/*.json'],
  css: ['app/assets/scss/*.scss', 'app/assets/scss/**/*.scss', '!app/assets/scss/lib/'],
  tempCss: 'app/assets/css/'
}

var currentClient = '';

// Production Paths
var pathProd = {
  images: 'dist/assets/img/',
  data: 'dist/assets/data/',
  js: 'dist/assets/js/',
  mainRoot: 'dist'
}

// Check main gulp task parameter
var gulpTask = (arg._[0] == 'build') ? true : false;

// IF env in production (--prod) set isProd and sass/compass config
var isProd = true,
    sassStyle = 'compressed',
    sourceMap = false;

if(!arg.prod){
    isProd = false,
    sassStyle = 'nested',
    sourceMap = true;
}

// set autropefixer browsers versions
var autoprefix_browsers = [
  'last 2 version',
  'safari >= 5',
  'ie >= 8',
  'opera >= 12.1',
  'ios >= 6',
  'ie_mob >= 10',
  'android >= 4',
  'bb >= 10'
];

//Copy assets to dist
gulp.task('fonts', function(){
  console.log(' DO FONTS ');
  return gulp.src(['app/assets/fonts/**'])
    .pipe(gulp.dest('dist/assets/fonts'))
    .pipe(req.size({title: 'fonts'}));
});

gulp.task('video', function(){
  console.log(' DO VIDEOS ');
  return gulp.src(['app/assets/video/**'])
    .pipe(gulp.dest('dist/assets/video'))
    .pipe(req.size({title: 'Videos'}));
});

// Data
gulp.task('data', function(){
  var src_path = ['app/assets/data/**'];
  return gulp.src(src_path)
    .pipe(gulp.dest('dist/assets/data'))
    .pipe(req.size({title: 'data'}));
});


// Don't stop gulp if error is a warning (jenkins benefit)
var errorFlag = false;
gulp.task('jshint', function () {
 console.log(' DO JSHINT ');

  var src_path =  ['app/assets/js/*.js', '!app/assets/js/vendor/', '!app/assets/js/lib/','!app/assets/js/templates.js']

  return gulp.src(src_path)
    .pipe(req.jshint())
    .pipe(req.jshint.reporter('jshint-stylish'))
    .pipe(req.jshint.reporter('default'))
    //Stop gulp only if error but keep working if is a warning.
    .pipe(map(function (file, cb) {

      if (!file.jshint.success) {
        file.jshint.results.forEach(function (err) {
          var checkError = err.error.code
          if(checkError.charAt(0) === 'W'){
            //console.log('it is a warning')
          }else{
            //console.log('it is an Error')
            errorFlag = true;
          }
        });
      }

      cb(null, file);
    }))
    //.pipe(req.jshint.reporter('fail'))
    .pipe(req.size({title: 'Linting JS files'}))
    .pipe(browserSync.reload({stream:true}))
    .on('end', function () {
        if (errorFlag) {
          process.exit(1);
        }
    });
});

//CSS task. The concatenation and minification will be done in the html task
gulp.task('css', function () {
   console.log(' DO CSS ');
  return gulp.src(pathDev.css)
    .pipe(req.compass({
      //config_file: 'config.rb',
      css: 'app/assets/css/',
      sass: 'app/assets/scss/',
      output_style: sassStyle
    }))
    // If add on error this will keep compiling without stop on issue
    // .on('error', function(error){
    //   // console.log(error.message);
    //   console.log(error);
    //   this.emit('end');
    // })
    .pipe(req.autoprefixer({browsers: autoprefix_browsers}))
    .pipe(gulp.dest(pathDev.tempCss))
    .pipe(req.size({title: 'Compiled SASS and saved in app -> CSS folder'}))
    .pipe(browserSync.reload({stream:true}));
});


// Generate the final file with concat and/or min files "css and js"
// The Css and Js will be transfered to assets root
gulp.task('html', function(){
  var assets = req.useref.assets();
   console.log(' DO HTML ASSETS ');

  var dest_path = 'dist/';
 
  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(req.if(isProd, req.if('*.js', req.uglify({mangle: false}))))
    .on('error', function( e ){
      console.log(' EROR ', e);
    })
    .pipe(req.if(isProd, req.if('*.css',  req.minifyCss())))
    .pipe(assets.restore())
    .pipe(req.useref())
    .pipe(gulp.dest(dest_path))
    .pipe(req.size(req.if(isProd, {title: 'Concat and Min files'}, {title: 'Concat files only'})));
});

// Minify index.html only after all the other tasks are done.
// The minify task will be used in the dist version
gulp.task('minhtml', function(){
  var opts = {
    conditionals: true,
    empty: true
  };

  return gulp.src('dist/*.html')
    .pipe(req.if(isProd, req.minifyHtml(opts)))
    .pipe(gulp.dest(pathProd.mainRoot))
    .pipe(req.size({title: 'Html Minified'}));
});


// Optimize and copy images to dist. Run task only on build */
gulp.task('images', function() {
  var src_path =  ['app/assets/img/**/*'];//,'app/client-resources/'+currentClient+'/assets/images/**/*']; //dist/clients/'+currentClient+'/assets/data'
  var dest_path = 'dist/assets/img';
  return gulp.src(src_path)
    .pipe(req.newer(dest_path)) //check if image exist already
   // .pipe(req.imagemin({
   //   progressive: true,
   //   interlaced: true,
   ///   optimizationLevel:5
   // })) //optimize images*/
    .pipe(gulp.dest(dest_path)) //move to dist folder
    .pipe(req.size({title: 'Optimization of images'}));
});



/** Clean Dist folder before adding new files. you can clean other folder adding it to the array **/
gulp.task('clean', function(cb) {
    del(['dist'], cb);
});


/* webserver dist folder */
gulp.task('webserver_dist', function() {
  gulp.src('dist')
    .pipe(req.webserver({
      livereload: true,
      directoryListing: false,
      open: true
      //fallback: 'index.html'
    }));
});


//Task to watch changes on folders and file. 
gulp.task('watch', function () {
  gulp.watch(['app/*.html']);
  gulp.watch(pathDev.js, ['jshint']);
  gulp.watch(pathDev.css, ['css']);
 // gulp.watch(pathDev.images);
  gulp.watch(pathDev.data);
  gulp.watch("app/*.html", ['bs-reload']);
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});
//gulp.task('build', ['clean'], function(cb){
gulp.task('build', ['clean'], function(cb){
    
    sequal(['fonts', 'data', 'video'],'css', 'jshint', ['images'], ['html'], 'minhtml', function(){
    console.log(" all complete....."+ currentClient);
    });

});

// Task to start server and watch assets 
gulp.task('server', ['watch', 'browser-sync'], function(){});
// Run server on dist folder to check if minification is working
gulp.task('server:dist', ['webserver_dist'], function(){});



