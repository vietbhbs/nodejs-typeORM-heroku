import { Router } from 'express'
import auth from './auth'
import user from './user'
import tag from './tag'
import category from './category'
import topic from './topic'

const routes = Router()

routes.use('/auth', auth)
routes.use('/user', user)
routes.use('/tag', tag)
routes.use('/category', category)
routes.use('/topic', topic)

export default routes
