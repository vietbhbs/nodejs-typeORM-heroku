import { Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Topic } from '../entity/Topic'
import { validate } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import Utils from '../utils'
import config from '../config/config'

class TopicController {
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get topics from database
            const topicRepository = AppDataSource.getRepository(Topic)
            let topics

            try {
                const select = [
                    'topics.id',
                    'topics.name',
                    'topics.is_hot',
                    'topics.slugs',
                    'topics.title',
                    'topics.status',
                    'topics.description',
                    'topics.content',
                    'topics.keywords',
                    'topics.photo',
                ]

                // pagination or get all
                if (req.query.page) {
                    const currentPage = Number(req.query.page)
                    const pageItem: number = config.pageItem

                    topics = await topicRepository
                        .createQueryBuilder('topics')
                        .select(select)
                        .skip((currentPage - 1) * pageItem)
                        .take(pageItem)
                        .getMany()
                } else {
                    topics = await topicRepository
                        .createQueryBuilder('topics')
                        .select(select)
                        .getMany()
                }
            } catch (e) {
                res.status(404).json({
                    message: 'Cannot get list topics',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //Send the categories object
            res.status(200).json({
                data: topics,
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    static getOneById = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get the topic from database
            const topicRepository = AppDataSource.getRepository(Topic)

            try {
                const topics = await topicRepository.findOneBy({
                    id: id,
                })

                res.status(200).json({
                    data: topics,
                })
            } catch (error) {
                res.status(404).json({
                    message: 'Topic not found',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    static newTopic = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            const topic = new Topic()
            //Get parameters from the body
            for (const topicKey in req.body) {
                topic[topicKey] = req.body[topicKey]
            }
            topic.uuid = uuidv4()

            //Validate if the parameters are ok
            const errors = await validate(topic, {
                validationError: { target: false },
            })
            if (errors.length > 0) {
                res.status(400).send(errors)
                return
            }

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Try to save. If fails, the category is already in use
            const topicRepository = AppDataSource.getRepository(Topic)
            try {
                await topicRepository.save(topic)
            } catch (e) {
                res.status(409).json({
                    message: 'topic already in use',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //If all ok, send 201 response
            res.status(201).json({
                message: 'topic created',
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    static editTopic = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Try to find category on database
            const topicRepository = AppDataSource.getRepository(Topic)
            const topic = await topicRepository.findOneBy({
                id: id,
            })

            if (!topic) {
                res.status(404).json({
                    message: 'Category not found',
                })
                return
            }

            // disconnect database
            await AppDataSource.destroy()

            //Get values from the body
            for (const topicKey in req.body) {
                topic[topicKey] = req.body[topicKey]
            }

            //Validate the new values on model
            const errors = await validate(Topic)
            if (errors.length > 0) {
                res.status(400).send(errors)
                return
            }

            //Try to safe, if fails, that means topic already in use
            try {
                await topicRepository.save(topic)
            } catch (e) {
                res.status(409).json({
                    message: 'topic already in use',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            res.status(200).json({
                message: 'topic updated',
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    static deleteTopic = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            const topicRepository = AppDataSource.getRepository(Topic)
            let topic

            try {
                topic = await topicRepository.findOneOrFail({
                    where: {
                        id: id,
                    },
                })
            } catch (error) {
                res.status(404).json({
                    message: 'Topic not found',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                await topicRepository.remove(topic)
            } catch (e) {
                res.status(409).json({
                    message: 'Topic removed failed.',
                })
                return
            } finally {
                await AppDataSource.destroy()
            }

            //After all send a 204 (no content, but accepted) response
            res.status(200).json({
                message: 'topic deleted',
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }
}

export default TopicController
