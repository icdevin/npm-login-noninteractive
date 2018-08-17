const ncl = require('./login.js');

module.exports = (user, pass, email, registry, scope, configPath) => {
  const finalArgs = ncl.processArguments(
    user, pass, email, registry, scope, configPath
  );

  ncl.login(finalArgs, (err, data) => {
    if (err) throw new Error(err);

    const resp = data;
    ncl.readFile(finalArgs, (err, data) => {
      if (err) throw new Error(err);

      const contents = data;
      const newContents = ncl.generateFileContents(finalArgs, contents, resp);
      ncl.writeFile(finalArgs, newContents, err => {
        if (err) throw new Error(err);
      });
    });
  });
};
