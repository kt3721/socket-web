/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const babel = require('gulp-babel')
const merge = require('merge2')
const { OUTPUT_ES, OUTPUT_LIB } = require('./config')

const PATH = [
  'src/**/*.ts'
]

const tsConfig = require(path.join(process.cwd(), 'tsconfig.json')).compilerOptions

function compileTs() {
  return gulp.src(PATH).pipe(ts(tsConfig))
}

function compileEs() {
  const { js, dts } = compileTs()

  return merge([
    // ES module
    js
      .pipe(babel({
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false // 输出 esm
            }
          ]
        ]
      }))
      .pipe(gulp.dest(OUTPUT_ES)),
    // 生成 d.ts 文件
    dts
      .pipe(gulp.dest(OUTPUT_ES))
  ])
}

function compileCjs() {
  const { js, dts } = compileTs()

  return merge([
    // commonjs module
    js
      .pipe(babel())
      .pipe(gulp.dest(OUTPUT_LIB)),
    // 生成 d.ts 文件
    dts
      .pipe(gulp.dest(OUTPUT_LIB))
  ])
}

module.exports = {
  compileEs,
  compileCjs
}
