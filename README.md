# Erik

Start running your client `Jasmine` tests headlessly with [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome) and `gulp` today.

### When should I use Erik?

You should use Erik when you have a suite of client Jasmine tests that you currently run by opening a `SpecRunner.html` file but would prefer to run headlessly via a `gulp` task.

Erik utilizes [Karma](https://github.com/karma-runner/karma) to run your Jasmine tests with Headless Chrome.

It abstracts away Karma's details and configuration so that you can begin running your tests with Headless Chrome quickly and easily.

Simply adapt the below example configuration for your use.

### Installation

`$ npm install -D erik`

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

(in your `gulpfile`)
```js
const SHOULD_WATCH = !!argv.watch;

// Creating an `Erik` object registers several tasks with gulp (all prefixed with 'erik-').
new Erik({
  // The gulp instance with which to register Erik's tasks.
  gulp,

  /**
   * When watch is set, Erik will watch for changes to your local dependencies and re-run the test
   * suite when changes occur.
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
   * Local dependencies to be bundled alongside your remote dependencies. Glob strings. Order is
   * respected here - make sure to include any dependencies before your specs.
   */
  localDependencies: [
    'public/build-lib.js',
    'public/lib/ext/**/*',

    // Include your specs here. Make sure that they are bundled as an IIFE.
    'spec/client/tests.js',
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

##### Testing on other browsers

Should you desire to use a browser other than Headless Chrome, you can do so by providing a `browsers` array in the `karmaConfig` object. Note that you'll need to install the appropriate [browser plugins](http://karma-runner.github.io/1.0/config/browsers.html) for Karma.

```js
new Erik({
  gulp,
  
  ...
  
  karmaConfig: {
    port: 1337,
    browsers: ['Chrome', 'Firefox']
  }
});
```

### Contributing

We welcome pull requests! Please lint your code using the JSHint configuration in this project.

### Release history

* 3.1.0 Add support for the `customLaunchers` Karma field
* 3.0.0 Fail on empty test suites.
* 2.0.0 Replace PhantomJS with Headless Chrome.
* 1.2.1 Allow browser configuration by browsers array.
* 1.2.0 Work around Karma bug to support `console.log` output among test cases as they run.
* 1.1.2 Don't fail when the test suite run is empty.
* 1.1.1 Documentation updates. Require non-empty `options.localDependencies` argument.
* 1.1.0 Re-run specs on any local dependency changes. Wrap `options.bundledSpecPath` into `options.localDependencies`, deprecating `options.bundledSpecPath`.
* 1.0.3 Don't specify exact dependency versions.
* 1.0.2 Add event-based watch example.
* 1.0.1 Move dependencies to be non-dev dependencies.
* 1.0.0 Initial release.

### Etymology

Erik is the name of the Phantom in _Phantom of the Opera_ :D. This library used to use PhantomJS instead of Headless Chrome.
