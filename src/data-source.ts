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
    host: 'bvsagmcivbwjagvahkbi-mysql.services.clever-cloud.com',
    port: 3306,
    username: 'uzlizjr0drsgriis',
    password: 's7nrasl2oSK7j44DMQqu',
    database: 'bvsagmcivbwjagvahkbi',
    synchronize: true,
    logging: false,
    entities: [User, Category, Topic, Signature, Tag],
    migrations: [],
    subscribers: [],
})
