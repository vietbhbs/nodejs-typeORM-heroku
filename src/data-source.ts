import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { Tag } from './entity/Tag'
import { Category } from './entity/Category'
import { Signature } from './entity/Signature'
import { Topic } from './entity/Topic'

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Category, Topic, Signature, Tag],
    migrations: [],
    subscribers: [],
})
