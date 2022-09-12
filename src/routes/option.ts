import { Router } from 'express'
import OptionController from '../controllers/OptionController'
const router = Router()
router.post('/', OptionController.newOption)
router.get('/show/:id([0-9]+)', OptionController.getOptionById)
router.get('/', OptionController.listAll)
router.post('/edit/:id([0-9]+)', OptionController.editOption)
router.post('/delete/:id([0-9]+)', OptionController.deleteOption)
export default router
