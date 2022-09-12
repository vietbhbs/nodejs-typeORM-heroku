import { Router } from 'express'
import TagController from '../controllers/TagController'
const router = Router()
router.post('/', TagController.newTag)
router.get('/show/:id([0-9]+)', TagController.getTagById)
router.get('/', TagController.listAll)
router.post('/edit/:id([0-9]+)', TagController.editTag)
router.post('/delete/:id([0-9]+)', TagController.deleteTag)
export default router
