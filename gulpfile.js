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
gulp.task('initTranslation', require('./tasks/initTranslation'));

// push readme from the template
gulp.task('initReadme', require('./tasks/initReadme'));

// sync with upstream, create pr
gulp.task('sync', require('./tasks/sync'));
