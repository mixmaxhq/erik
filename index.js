"use strict";

const path = require('path');
const runSequence = require('run-sequence');
const streamqueue = require('streamqueue');
const remoteSrc = require('gulp-remote-src');
const concat = require('gulp-concat');
const URL = require('url');
const karmaServer = require('karma').Server;

class Erik {
  /**
   * @param {Object} options
   * @param {Object} options.gulp - The gulp instance with which to register Erik's tasks.
   * @param {Boolean} [options.watch] - When watch is set, Erik will watch for changes to your
   * bundled spec and re-run the test suite when changes occur.
   * @param {String[]} [options.taskDependencies] - Names of tasks to be run before any Erik
   * processing is done. Useful for registering your spec-building/processing tasks as dependencies
   * of Erik's testing task. These tasks will be run in serial as passed.
   * @param {String[]} [options.localDependencies] - Local dependencies to be bundled alongisde your
   * remote dependencies. Glob strings. Useful for including your bower-installed packages, for
   * example.
   * @param {String[]} [options.remoteDependencies] - URLs corresponding to remote dependencies.
   * @param {String} options.bundledSpecPath - Path to your bundled and processed test suite.
   * @param {Object} [options.karmaConfig]
   * @param {Number} [options.karmaConfig.port=9876] - Port on which to run the Karma server.
   * @param {String} [bundlePath] - Base bath to use for Erik's bundled files. A directory named
   * `erik` will be created here.
   */
  constructor(options) {
    this._gulp = options.gulp;
    this._watch = options.watch || false;
    this._taskDependencies = options.taskDependencies || [];
    this._localDependencies = options.localDependencies || [];
    this._remoteDependencies = options.remoteDependencies || [];
    this._bundledSpecPath = options.bundledSpecPath;
    this._port = (options.karmaConfig && options.karmaConfig.port) || 9876;
    this._bundlePath = options.bundlePath || '';

    this._assertValidOptions(options);

    this._erikPath = path.join(options.bundlePath, 'erik');

    this._registerTasks();
  }

  _assertValidOptions() {
    if (typeof this._gulp !== 'object') {
      throw new Error('`options.gulp` is of an invalid type.');
    }

    if (typeof this._watch !== 'boolean') {
      throw new Error('`options.watch` is of an invalid type.');
    }

    if (!Array.isArray(this._taskDependencies)) {
      throw new Error('`options.taskDependencies` is of an invalid type.');
    }

    if (!Array.isArray(this._localDependencies)) {
      throw new Error('`options.localDependencies` is of an invalid type.');
    }

    if (!Array.isArray(this._remoteDependencies)) {
      throw new Error('`options.remoteDependencies` is of an invalid type.');
    }

    if (typeof this._bundledSpecPath !== 'string') {
      throw new Error('`options.bundledSpecPath` is of an invalid type.');
    }
 
    if (typeof this._port !== 'number') {
      throw new Error('`options.karmaConfig.port` is of an invalid type.');
    }
 
    if (typeof this._bundlePath !== 'string') {
      throw new Error('`options.bundlePath` is of an invalid type.');
    }
   }

  _registerTasks() {
    this._registerFetchRemoteDeps();
    this._registerBundleDeps();
    this._registerCombine();
    this._registerRunSpec();
    this._registerErik();
  }

  _registerFetchRemoteDeps() {
    this._gulp.task('erik-fetch-remote-deps', () => {
      return streamqueue({
        objectMode: true
      }, ...this._remoteDependencies.map((urlStr) => {
        const url = URL.parse(urlStr);
        const base = `${url.protocol}//${url.host}`;
        const path = url.path;

        return remoteSrc([path], {
          base
        });
      }))
        .pipe(concat('remote-deps.js'))
        .pipe(this._gulp.dest(this._erikPath));
    });
  }

  _registerBundleDeps() {
    this._gulp.task('erik-bundle-deps', () => {
      return this._gulp.src([
        `${this._erikPath}/remote-deps.js`,
        ...this._localDependencies
      ])
        .pipe(concat('bundled-deps.js'))
        .pipe(this._gulp.dest(this._erikPath));
    });
  }

  _registerCombine() {
    /**
     * Combine the bundled dependencies and specs to ensure that the dependencies are available to
     * the test suite.
     */
    this._gulp.task('erik-combine', () => {
      return this._gulp.src([
        `${this._erikPath}/bundled-deps.js`,
        this._bundledSpecPath
      ])
        .pipe(concat('combined.js'))
        .pipe(this._gulp.dest(this._erikPath));
    });
  }

  _registerRunSpec() {
    this._gulp.task('erik-run-spec', (done) => {
      new karmaServer.start({
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        reporters: ['mocha'],

        /**
         * Pass an empty object for `preprocessors` in order to disable Karma's default processing
         * of coffescript files.
         */
        preprocessors: {
        },

        files: [
          `${this._erikPath}/combined.js`
        ],

        port: this._port,

        autoWatch: this._watch,
        singleRun: !this._watch
      }, function(error) {
        /**
         * We must create our own Error object because the error Karma returns is not a proper Error
         * object per https://github.com/karma-runner/gulp-karma/issues/18#issuecomment-188413903.
         */
        error = error ? new Error(`Karma returned with the error code: ${error}`) : undefined;

        done(error);
      });
    });
  }

  _registerErik() {
    this._gulp.task('erik', (done) => {
      const tasks = this._taskDependencies.concat([
        'erik-fetch-remote-deps',
        'erik-bundle-deps',
        'erik-combine',
        'erik-run-spec',
        done
      ]);

      // Run everything serially.
      runSequence.use(this._gulp)(...tasks);
    });
  }
}

module.exports = Erik;
