import { Router } from 'express'
import auth from './auth'
import user from './user'
import tag from './tag'
import category from './category'
import topic from './topic'
import config from './config'
import option from './option'

const routes = Router()

routes.use('/auth', auth)
routes.use('/user', user)
routes.use('/tag', tag)
routes.use('/category', category)
routes.use('/topic', topic)
routes.use('/config', config)
routes.use('/option', option)

export default routes
