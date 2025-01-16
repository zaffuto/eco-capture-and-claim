import winston from 'winston';
import { config } from '../config';

export const createLogger = (service: string) => {
  return winston.createLogger({
    level: config.LOG_LEVEL,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          service,
          message,
          ...meta,
        });
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ 
        filename: `logs/error-${service}.log`, 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: `logs/combined-${service}.log` 
      }),
    ],
  });
};
