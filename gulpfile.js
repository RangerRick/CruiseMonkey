const run = require('gulp-run-command').default;

const sass = (done) => {
  return run('npm run build')().then(done);
};

const watch = (done) => {
  return run('npm run watch')().then(done);
};

exports.sass = sass;
exports.watch = watch;
exports.default = sass;
