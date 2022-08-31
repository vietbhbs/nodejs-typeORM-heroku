import { Router } from 'express'
import UserController from '../controllers/UserController'

const router = Router()

//Get all users
router.get('/', UserController.listAll)

// Get one user
router.get('/show/:id([0-9]+)', UserController.getOneById)

//Create a new user
router.post('/', UserController.newUser)

//Edit one user
router.patch('/:id([0-9]+)', UserController.editUser)

//Delete one user
router.post('/delete', UserController.deleteUser)

export default router
