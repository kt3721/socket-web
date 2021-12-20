/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require('gulp')
const del = require('del')
const { compileEs, compileCjs } = require('./build/compile')

const { OUTPUT_ES, OUTPUT_LIB } = require('./build/config')

// 清空 output
function clean(path) {
  return del([`${path}/**`])
}

// 构建
gulp.task('build:es', gulp.series(clean.bind(null, OUTPUT_ES), compileEs))
gulp.task('build:lib', gulp.series(clean.bind(null, OUTPUT_LIB), compileCjs))

gulp.task('build', gulp.parallel('build:es', 'build:lib'))
