import { Router } from 'express'
import ConfigsController from '../controllers/ConfigsController'
const router = Router()
router.post('/', ConfigsController.newConfigs)
router.get('/show/:id([0-9]+)', ConfigsController.getConfigsById)
router.get('/', ConfigsController.listAll)
router.post('/edit/:id([0-9]+)', ConfigsController.editConfigs)
router.post('/delete/:id([0-9]+)', ConfigsController.deleteConfigs)
export default router
