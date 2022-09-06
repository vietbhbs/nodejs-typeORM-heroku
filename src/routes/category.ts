import { Router } from 'express'
import CategoryController from '../controllers/CategoryController'
// import {checkJwt} from "../middlewares/checkJwt";
// import {checkRole} from "../middlewares/checkRole";

const router = Router()

//Get all categories
router.get('/', CategoryController.listAll)

// Get one category
router.get('/:id([0-9]+)', CategoryController.getOneById)

//Create a new category
router.post('/', CategoryController.newCategory)

//Edit one category
router.patch('/:id([0-9]+)', CategoryController.editCategory)

router.delete('/:id([0-9]+)', CategoryController.deleteCategory)

export default router
