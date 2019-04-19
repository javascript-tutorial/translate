const gulp = require('gulp');

// delete all repos
gulp.task('clean', require('./tasks/clean'));

// pull all changes, recalculate stats
gulp.task('refresh', require('./tasks/refresh'));

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
