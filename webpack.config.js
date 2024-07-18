const path = require('path');

module.exports = {
    // target: 'electron-renderer',
    resolve: {
        extensions: ['.ts', '.js']
    },
    node: {
        __dirname: false,
        __filename: false
    },
    externals: {
        fs: 'commonjs fs',
        path: 'commonjs path',
        electron: 'commonjs electron'
    },
    module: {
        parser: {
            javascript: {
                importMeta: false,
                url: true,
            }
        }
    }
};
