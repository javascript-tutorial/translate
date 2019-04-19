const gulp = require('gulp');
const { series } = require('gulp');

// delete all repos
gulp.task('clean', require('./tasks/clean'));

// pull all changes, recalculate stats
gulp.task('refresh', require('./tasks/refresh'));

gulp.task('reload', require('./tasks/reload'));

// pull all changes, recalculate stats
gulp.task('refresh-and-reload', series('refresh','createThisReadme','reload'));

gulp.task('server', require('./tasks/server'));

// create local and remote repo
// create teams
// add maintainers
// *non-destructive
gulp.task('createTranslation', require('./tasks/createTranslation'));

// push readme from the template
gulp.task('createReadme', require('./tasks/createReadme'));

// create readme for this repo
gulp.task('createThisReadme', require('./tasks/createThisReadme'));

// sync with upstream, create pr
gulp.task('sync', require('./tasks/sync'));
