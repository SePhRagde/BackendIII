import winston from 'winston';
import { join } from 'path';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Custom format for our logs
const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Development logger configuration
const devLogger = createLogger({
    level: 'debug',
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        new transports.Console()
    ]
});

// Production logger configuration
const prodLogger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        // Console transport for info and above
        new transports.Console({
            level: 'info'
        }),
        // File transport for errors and above
        new transports.File({
            filename: join(process.cwd(), 'logs', 'errors.log'),
            level: 'error'
        })
    ]
});

// Select logger based on environment
const logger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
    mkdirSync(join(process.cwd(), 'logs'), { recursive: true });
} catch (error) {
    if (error.code !== 'EEXIST') {
        console.error('Error creating logs directory:', error);
    }
}

export default logger; 