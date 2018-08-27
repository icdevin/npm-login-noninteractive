const ncl = require('../lib/login.js');
const nclWrapper = require('../lib');
const expect = require('chai').expect;
const path = require('path');

const testData = {
  username: 'username',
  password: 'password',
  email: 'test@example.com',
  registry: 'https://npm.random.com',
  scope: '@scope',
  configPath: '/path/',
  response: { token: 'test' },
  response2: { token: 'random' },
};

const defaultRegistryHost = 'registry.npmjs.org';
const randomRegistryHost = 'npm.random.com';
const defaultRegistryWithTestToken = `//${defaultRegistryHost}/:_authToken="test"`;
const defaultRegistryWithToken = `//${defaultRegistryHost}/:_authToken="${testData.response.token}"`;
const randomWithTestToken = `//${randomRegistryHost}/:_authToken="test"`;
const randomWithToken = `//${randomRegistryHost}/:_authToken="${testData.response.token}"`;
const randomWithToken2 = `//${randomRegistryHost}/:_authToken="${testData.response2.token}"`
const customRegistryWithScope = `${testData.scope}:registry=${testData.registry}`;
const defaultRegistryWithScope = `${testData.scope}:registry=https://${defaultRegistryHost}`;

describe('Can handle', () => {
  it('missing username', () => {
    expect(() => {
      nclWrapper();
    }).to.throw('AssertionError');
  });

  it('missing password', () => {
    expect(() => {
      nclWrapper(testData.username);
    }).to.throw('AssertionError');
  });

  it('missing email', () => {
    expect(() => {
      nclWrapper(testData.username, testData.password);
    }).to.throw('AssertionError');
  });
});

describe('Can resolve', () => {
  it('custom username', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email
    );
    expect(args).to.have.property('user', testData.username);
  });

  it('custom password', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email
    );
    expect(args).to.have.property('pass', testData.password);
  });

  it('custom email', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email
    );
    expect(args).to.have.property('email', testData.email);
  });

  it('default registry', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email
    );
    expect(args).to.have.property('registry', `https://${defaultRegistryHost}`);
  });

  it('custom registry', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email, testData.registry
    );
    expect(args).to.have.property('registry', testData.registry);
  });

  it('default scope', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email, testData.registry
    );
    expect(args).to.have.property('scope', undefined);
  });

  it('custom scope', () => {
    const args = ncl.processArguments(
      testData.username,
      testData.password,
      testData.email,
      testData.registry,
      testData.scope,
    );
    expect(args).to.have.property('scope', testData.scope);
  });

  it('default configuration path', () => {
    const args = ncl.processArguments(
      testData.username,
      testData.password,
      testData.email,
      testData.registry,
      testData.scope,
    );
    const expectedPath = path.join(process.env.HOME, '.npmrc');
    expect(args).to.have.property('configPath', expectedPath);
  });

  it('custom configuration path', () => {
    const args = ncl.processArguments(
      testData.username,
      testData.password,
      testData.email,
      testData.registry,
      testData.scope,
      testData.configPath
    );
    expect(args).to.have.property('configPath', testData.configPath);
  });
});

describe('Can generate', () => {
  it('file with default registry but no scope', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email
    );
    const toWrite = ncl.generateFileContents(args, '', testData.response);
    expect(toWrite).to.have.length(1)
    expect(toWrite).to.include(defaultRegistryWithTestToken);
  }).timeout(5000);

  it('file with default registry and custom scope', () => {
    const args = ncl.processArguments(
      testData.username,
      testData.password,
      testData.email,
      undefined,
      testData.scope,
    );
    const toWrite = ncl.generateFileContents(args, '', testData.response);
    expect(toWrite).to.have.length(2)
    expect(toWrite).to.include(defaultRegistryWithToken);
    expect(toWrite).to.include(defaultRegistryWithScope);
  });

  it('file with custom registry but no scope', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email, testData.registry
    );
    const toWrite = ncl.generateFileContents(args, '', testData.response);
    expect(toWrite).to.have.length(1)
    expect(toWrite).to.include(randomWithToken);
  });

  it('file with custom registry and custom scope', () => {
    const args = ncl.processArguments(
      testData.username,
      testData.password,
      testData.email,
      testData.registry,
      testData.scope,
    );
    const toWrite = ncl.generateFileContents(args, '', testData.response);
    expect(toWrite).to.have.length(2)
    expect(toWrite).to.include(randomWithToken);
    expect(toWrite).to.include(customRegistryWithScope);
  });
});

describe('Can append to', () => {
  it('file with default registry but no scope', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email
    );
    const toWrite = ncl.generateFileContents(args, 'oldData', testData.response);
    expect(toWrite).to.have.length(2);
    expect(toWrite).to.include('oldData');
    expect(toWrite).to.include(defaultRegistryWithToken);
  });

  it('file with default registry and custom scope', () => {
    const args = ncl.processArguments(testData.username, testData.password, testData.email, undefined, testData.scope);
    const toWrite = ncl.generateFileContents(args, 'oldData', testData.response);
    expect(toWrite).to.have.length(3);
    expect(toWrite).to.include('oldData');
    expect(toWrite).to.include(defaultRegistryWithToken);
    expect(toWrite).to.include(defaultRegistryWithScope);
  });

  it('file with custom registry but no scope', () => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email, testData.registry
    );
    const toWrite = ncl.generateFileContents(args, 'oldData', testData.response);
    expect(toWrite).to.have.length(2);
    expect(toWrite).to.include('oldData');
    expect(toWrite).to.include(randomWithToken);
  });

  it('file with custom registry and custom scope', () => {
    const args = ncl.processArguments(
      testData.username,
      testData.password,
      testData.email,
      testData.registry,
      testData.scope,
    );
    const toWrite = ncl.generateFileContents(args, 'oldData', testData.response);
    expect(toWrite).to.have.length(3);
    expect(toWrite).to.include('oldData');
    expect(toWrite).to.include(randomWithToken);
    expect(toWrite).to.include(
      customRegistryWithScope
    );
  });

  it('file with existing auth token', () => {
    const args = ncl.processArguments(
      testData.username,
      testData.password,
      testData.email,
      testData.registry,
      testData.scope,
    );
    const toWrite = ncl.generateFileContents(
      args, randomWithTestToken, testData.response2,
    );
    expect(toWrite).to.have.length(2);
    expect(toWrite).to.not.include(randomWithToken);
    expect(toWrite).to.include(randomWithToken2);
    expect(toWrite).to.include(customRegistryWithScope);
  });
});

describe('Can login to default registry', () => {
  it('with incorrect credentials', done => {
    const args = ncl.processArguments(
      testData.username, testData.password, testData.email
    );
    ncl.login(args, (err, data) => {
      expect(err).to.have.property('statusCode', 401);
      done();
    });
  }).timeout(5000);

  it('with correct credentials', done => {
    const args = ncl.processArguments(
      process.env.NPM_USER, process.env.NPM_PASS, process.env.NPM_EMAIL,
      process.env.NPM_REGISTRY,
    );
    ncl.login(args, (err, data) => {
      expect(data).to.have.property('ok');
      expect(data).to.have.property('token');
      done();
    });
  }).timeout(5000);
});
