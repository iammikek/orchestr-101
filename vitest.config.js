const path = require('path');

module.exports = {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [path.join(__dirname, 'tests', 'setup.js')],
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.config.js', 'tests/'],
    },
  },
};
