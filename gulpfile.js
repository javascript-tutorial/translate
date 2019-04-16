const gulp = require('gulp');

gulp.task('clean', require('./tasks/clean'));
gulp.task('refresh', require('./tasks/refresh'));
gulp.task('server', require('./tasks/server'));
gulp.task('initTranslation', require('./tasks/initTranslation'));
gulp.task('initReadme', require('./tasks/initReadme'));
