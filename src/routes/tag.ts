import { Router } from 'express'
import TagController from '../controllers/TagController'

const router = Router()
router.post('/', TagController.newTag)
router.get('/show/:id([0-9]+)', TagController.getTagById)
router.get('/', TagController.listAll)
export default router
