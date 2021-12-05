const winston = require('winston');

const logConfiguration = {
    'transports': [
        new winston.transports.Console({
          level: 'info'
        }),
    ],
    format: winston.format.combine(
        winston.format.timestamp({
           format: 'MMM-DD-YYYY HH:mm:ss'
       }),
        winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
    )
};
const log = winston.createLogger(logConfiguration);

module.exports = log;
