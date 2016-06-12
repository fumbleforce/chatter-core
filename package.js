Package.describe({
  name: 'jorgeer:chatter-core',
  version: '0.1.0',
  summary: 'Models and chat functionality for chatter',
  git: 'https://github.com/jorgeer/chatter-core',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');

  api.use('ecmascript');
  api.use('underscore');
  api.use('mongo');
  api.use('check');
  api.use('accounts-base');

  api.use('momentjs:moment@2.8.4');
  api.use('jagi:astronomy@1.2.1');
  api.use('jagi:astronomy-timestamp-behavior@1.0.0');
  api.use('jagi:astronomy-validators');
  api.use('xolvio:cleaner');


  api.addFiles('chatter.js');
  api.addFiles('models/message.js');
  api.addFiles('models/room.js');
  api.addFiles('models/userroom.js');
  api.addFiles('models/user.js');

  api.addFiles([
    'server/publish.js',
    'server/access.js',
    'server/methods.js'

  ], 'server');

  api.export([
    'Chatter',
  ], ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('accounts-base');
  api.use('ecmascript');
  api.use('practicalmeteor:chai');
  api.use('jorgeer:chatter-core');
  api.use('xolvio:cleaner');
  api.use('practicalmeteor:sinon');
  api.addFiles([
    'server-tests/test-helpers.js',
    'imports/api/fixtures.js'

  ], 'server');
  api.mainModule('chattercore.server.tests.js', 'server');
  api.mainModule('chattercore.client.tests.js', 'client');
});
