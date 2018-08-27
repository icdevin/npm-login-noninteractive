#!/usr/bin/env node

const getArg = arg => {
  const argIndex = process.argv.indexOf(arg);
  return argIndex !== -1 ? process.argv[argIndex + 1] : null;
};

const login = () => {
  const user = getArg('-u') || process.env.NPM_USER;
  const pass = getArg('-p') || process.env.NPM_PASS;
  const email = getArg('-e') || process.env.NPM_EMAIL;
  const registry = getArg('-r') || process.env.NPM_REGISTRY;
  const scope = getArg('-s') || process.env.NPM_SCOPE;
  const configPath = getArg('--config-path') || process.env.NPM_RC_PATH;

  require('../')(user, pass, email, registry, scope, configPath);
};

login();
