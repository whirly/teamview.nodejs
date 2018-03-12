const path = require('path');
const dotenvx = require('dotenv-extended');

dotenvx.load();

const mode = process.env.NODE_ENV || 'development';

const isProductionBuild = mode === 'production';

function fromRoot(posixPath) {
    return path.resolve(`${__dirname}/../${posixPath}`);
}

module.exports = { mode, isProductionBuild, fromRoot };
