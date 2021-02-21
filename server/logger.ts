import * as winston from 'winston';
import { StreamOptions } from 'morgan';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({})
    ]
});

export default logger;

export const morganStreamWriter: StreamOptions = {
    write(message: string): void {
        logger.info(message.replace(/\n$/, ''));
    }
};
