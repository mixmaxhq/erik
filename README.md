# Erik

Start running your client `Jasmine` tests headlessly with `PhantomJS` and `gulp` today.

### When should I use Erik?

You should use Erik when you have a suite of client Jasmine tests that you currently run by opening a `SpecRunner.html` file but would prefer to run headlessly via a `gulp` task.

Erik utilizes [Karma](https://github.com/karma-runner/karma) to run your Jasmine tests with PhantomJS.

It abstracts away Karma's details and configuration so that you can begin running your tests with PhantomJS quickly and easily.

Simply adapt the below example configuration for your use.

### Installation

`$ yarn add -D erik`

or

`$ npm install --save-dev erik`

### Can I use this with `my CI platform`?

Yes! Erik's exit code is determined by the outcome of your test suite, so integration with your CI platform should be easy.

### Notes on our assumed configuration (or, "How we make it easy for you")

##### Fetching remote dependencies

We use [`gulp-remote-src`](https://github.com/ddliu/gulp-remote-src) to fetch the remote dependencies that currently live in your `SpecRunner.html` `script` tags.

##### No Karma-configured pre-processing

If you're like [us](https://github.com/mixmaxhq), you already have `gulp` tasks for bundling (and perhaps transpiling) your test suite along with its dependencies. It's easier to keep that configuration and simply pass the path of your bundled, transpiled test suite than it is to duplicate that configuration with Karma preprocessing. Additionally, we've disabled Karma's default preprocessing of `coffeescript` files.

##### The `mocha` reporter

Karma's default `progress` reporter isn't quite as nice as the report shown by Jasmine. Erik uses `karma-mocha-reporter` so that you can see a similar, friendly, hierarchical overview of your specs as they complete.

### Example usage

**Please make sure that all of your dependencies are [compatible with PhantomJS](https://kangax.github.io/compat-table/es6/#phantom).**

(in your `gulpfile`)
```js
const SHOULD_WATCH = !!argv.watch;

// Creating an `Erik` object registers several tasks with gulp (all prefixed with 'erik-').
new Erik({
  // The gulp instance with which to register Erik's tasks.
  gulp,

  /**
   * When watch is set, Erik will watch for changes to your bundled spec and re-run the test suite
   * when changes occur.
   */
  watch: SHOULD_WATCH,

  /**
   * Names of tasks to be run before any Erik processing is done. Useful for registering your
   * spec-building/processing tasks as dependencies of Erik's testing task. These tasks will be run
   * in serial as passed.
   */
  taskDependencies: [
    'build-spec-bundle',
    'bower'
  ],

  /**
   * Local dependencies to be bundled alongside your remote dependencies. Glob strings. Useful for
   * including your bower-installed packages, for example.
   */
  localDependencies: [
    'public/build-lib.js',
    'public/lib/ext/**/*'
  ],

  /**
   * URLs corresponding to remote dependencies.
   */
  remoteDependencies: [
    'https://cdn.jsdelivr.net/g/es6.shim@0.35.3',
    'https://cdn.jsdelivr.net/g/jquery@2.1.4',
    'https://cdn.jsdelivr.net/g/underscorejs@1.8.3',
  ],

  /**
   * Path to your bundled test suite. This should be an IIFE.
   */
  bundledSpecPath: 'spec/client/tests.js',

  /**
   * This configuration is not passed directly into Karma but rather is processed by Erik. Only
   * `port` is supported at this time.
   */
  karmaConfig: {
    /**
     * Port on which to run the Karma server. Defaults to 9876.
     */
    port: 1337
  },

  // Base path to use for Erik's bundled files. A directory named `.erik` will be created here.
  bundlePath: 'spec/client'
});

// Optionally configure Gulp to watch for spec changes.
gulp.on('task_start', function(e) {
  if (e.task === 'erik') {
    if (SHOULD_WATCH) {
      console.log('Watching tests…');
      gulp.watch(TEST_FILES, ['build-spec-bundle']);
    }
  }
});
```

Run your test suite!

`$ gulp erik [--watch]`

### Contributing

We welcome pull requests! Please lint your code using the JSHint configuration in this project.

### Release history

* 1.0.2 Add event-based watch example.
* 1.0.1 Move dependencies to be non-dev dependencies.
* 1.0.0 Initial release.

### Etymology

Erik is the name of the Phantom in _Phantom of the Opera_ :D
