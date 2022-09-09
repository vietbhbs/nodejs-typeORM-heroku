import * as winston from 'winston'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'

const LOG_DIR = path.normalize(`${process.cwd()}/logs`)

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR)
}

const MESSAGE = Symbol.for('message')

const jsonFormatter = (logEntry) => {
    const base = { timestamp: moment().format('YYYY-MM-DD HH:mm:ss') }
    const json = Object.assign(base, logEntry)
    logEntry[MESSAGE] = JSON.stringify(json)
    return logEntry
}

const logger = winston.createLogger({
    exitOnError: false,
    silent: process.env.VAR === 'true',
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format(jsonFormatter)(),
    transports: [
        new DailyRotateFile({
            dirname: LOG_DIR,
            filename: '%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: false,
            maxSize: '1m',
            maxFiles: '14d',
        }),
    ],
})

export default logger
