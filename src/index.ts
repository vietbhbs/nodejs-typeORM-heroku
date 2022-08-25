import 'reflect-metadata'
import { AppDataSource } from './data-source'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import helmet from 'helmet'
import * as cors from 'cors'
import routes from './routes'

AppDataSource.initialize()
    .then(async () => {
        // Create a new express application instance
        const app = express()

        // Call middlewares
        app.use(cors())
        app.use(helmet())
        app.use(bodyParser.json())

        //Set all routes from routes folder
        app.use('/', routes)

        app.listen(3000, () => {
            console.log('Server started on port 3000!')
        })
    })
    .catch((error) => console.log(error))
