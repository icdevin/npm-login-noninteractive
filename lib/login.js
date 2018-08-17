const RegClient = require('npm-registry-client');
const fs = require('fs');
const path = require('path');

const regClient = new RegClient();

module.exports = {
  processArguments(
    npmUser, npmPass, npmEmail, npmRegistry, npmScope, configPath
  ) {
    const registry = npmRegistry || 'https://registry.npmjs.org';
    const homePath = process.env.HOME || process.env.USERPROFILE;
    const finalPath = configPath || path.join(homePath, '.npmrc');
    const args = {
      user: npmUser,
      pass: npmPass,
      email: npmEmail,
      registry: registry,
      scope: npmScope,
      configPath: finalPath
    };

    return args;
  },

  login(args, callback) {
    try {
      regClient.adduser(args.registry, {
        auth: {
          username: args.user,
          password: args.pass,
          email: args.email
        }
      }, (err, data) => {
        if (err) return callback(err);
        return callback(null, data);
      });
    } catch (e) {
      return callback(e);
    }
  },

  readFile(args, callback) {
    fs.readFile(args.configPath, 'utf-8', (err, contents) => {
      if (err) contents = '';
      return callback(null, contents);
    });
  },

  generateFileContents(args, contents, response) {
    // `contents` holds the initial content of the NPMRC file
    // Convert the file contents into an array
    const lines = contents ? contents.split('\n') : [];

    if (args.scope !== undefined) {
      const scope = `${args.scope}:registry=${args.registry}`;
      const scopeWrite = lines.findIndex(element => {
        if (element.indexOf(scope) !== -1) {
          // If an entry for the scope is found, replace it
          element = scope;
          return true;
        }
      });

      // If no entry for the scope is found, add one
      if (scopeWrite === -1) lines.push(scope);
    }

    const protocolIndex = args.registry.search(/\:\/\//, '') + 1;
    const registrySlice = `${args.registry.slice(protocolIndex)}/:_authToken=`;
    const authWrite = lines.findIndex((element, index, array) => {
      if (element.indexOf(registrySlice) !== -1) {
        // If an entry for the auth token is found, replace it
        array[index] = element.replace(
          /authToken\=.*/, `authToken="${response.token}"`
        );
        return true;
      }
    });

    // If no entry for the auth token is found, add one
    if (authWrite === -1) lines.push(`${registrySlice}"${response.token}"`);

    return lines.filter(element => element !== '');
  },

  writeFile(args, lines, callback = () => {}) {
    fs.writeFile(args.configPath, lines.join('\n') + '\n', callback);
  }
};
