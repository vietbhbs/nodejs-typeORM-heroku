import { Router } from 'express'
import auth from './auth'
import user from './user'
import tag from './tag'

const routes = Router()

routes.use('/auth', auth)
routes.use('/user', user)
routes.use('/tag', tag)

export default routes
