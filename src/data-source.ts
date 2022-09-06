import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { Tag } from './entity/Tag/Tag'
import { Category } from './entity/Category'

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Tag, Category],
    migrations: [],
    subscribers: [],
})
