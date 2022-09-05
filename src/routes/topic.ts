import { Router } from 'express'
import TopicController from '../controllers/TopicController'
// import {checkJwt} from "../middlewares/checkJwt";
// import {checkRole} from "../middlewares/checkRole";

const router = Router()

//Get all topics
router.get('/', TopicController.listAll)

// Get one topic
router.get('/:id([0-9]+)', TopicController.getOneById)

//Create a new user
router.post('/', TopicController.newTopic)

//Edit one topic
router.patch('/:id([0-9]+)', TopicController.editTopic)

//Delete one topic
router.delete('/:id([0-9]+)', TopicController.deleteTopic)
export default router
