import { Router } from 'express'
import UserController from '../controllers/UserController'

const router = Router()

//Get all users
router.post('/list', UserController.listAll)

// Get one user
router.post('/show', UserController.getOneById)

//Create a new user
router.post('/store', UserController.newUser)

//Edit one user
router.post('/update', UserController.editUser)

//Delete one user
router.post('/delete', UserController.deleteUser)

export default router
