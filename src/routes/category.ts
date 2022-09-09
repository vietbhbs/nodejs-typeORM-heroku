import { Router } from 'express'
import CategoryController from '../controllers/CategoryController'
// import {checkJwt} from "../middlewares/checkJwt";
// import {checkRole} from "../middlewares/checkRole";

const router = Router()

//Get all categories
router.post('/', CategoryController.listAll)

// Get one category
router.post('/show/:id([0-9]+)', CategoryController.getOneById)

//Create a new category
router.post('/add', CategoryController.newCategory)

//Edit one category
router.post('/edit/:id([0-9]+)', CategoryController.editCategory)

router.post('/delete/:id([0-9]+)', CategoryController.deleteCategory)

export default router
