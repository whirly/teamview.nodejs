import path from 'path';
import dotenvx from 'dotenv-extended';

dotenvx.load();

export const isProductionBuild = process.env.NODE_ENV == 'production';

export function fromRoot(posixPath) {
    return path.resolve(`${__dirname}/../${posixPath}`);
}
