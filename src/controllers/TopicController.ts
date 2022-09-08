import { Request, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Topic } from '../entity/Topic'
import { validate } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import Utils from '../utils'
import config from '../config/config'
import { Md5 } from 'md5-typescript'

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

class TopicController {
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        //get username and signature
        const username: string = req.query.username
            ? String(req.query.username)
            : ''
        const signature: string = req.query.signature
            ? String(req.query.signature)
            : ''

        if (version === 'v1') {
            //check user and signature empty
            if (!username || !signature) {
                const response = Utils.formatErrorDataIsEmptyResponse(req.query)
                res.status(400).json(response)
                return
            } else {
                // get signature & compare user signature and signature request
                const user = await Utils.getUserSignature(
                    String(req.query.username),
                )
                const validSignature: string = user
                    ? Md5.init(String(username) + '$' + user.signature)
                    : ''

                //check user and signature valid
                if (validSignature !== String(signature) || !user) {
                    const response = Utils.formatErrorSignatureResponse(
                        String(signature),
                    )
                    res.status(400).json(response)
                    return
                } else {
                    // connect database
                    if (!AppDataSource.isInitialized) {
                        await AppDataSource.initialize()
                    }

                    //Get topics from database
                    const topicRepository = AppDataSource.getRepository(Topic)
                    let topics

                    try {
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
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static getOneById = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        const username: string = req.query.username
            ? String(req.query.username)
            : ''
        const signature: string = req.query.signature
            ? String(req.query.signature)
            : ''

        if (version === 'v1') {
            if (!username || !signature) {
                const response = Utils.formatErrorDataIsEmptyResponse(req.query)
                res.status(400).json(response)
                return
            } else {
                // get signature & compare user signature and signature request
                const user = await Utils.getUserSignature(
                    String(req.query.username),
                )
                const validSignature: string = user
                    ? Md5.init(String(username) + '$' + user.signature)
                    : ''

                //check user and signature valid
                if (validSignature !== String(signature) || !user) {
                    const response = Utils.formatErrorSignatureResponse(
                        String(signature),
                    )
                    res.status(400).json(response)
                    return
                } else {
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
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static newTopic = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        const username: string = req.query.username
            ? String(req.query.username)
            : ''
        const signature: string = req.query.signature
            ? String(req.query.signature)
            : ''

        if (version === 'v1') {
            //check user and signature empty
            if (!username || !signature) {
                const response = Utils.formatErrorDataIsEmptyResponse({
                    ...req.query,
                    ...req.body,
                })
                res.status(400).json(response)
                return
            } else {
                // get signature & compare user signature and signature request
                const user = await Utils.getUserSignature(
                    String(req.query.username),
                )
                const validSignature: string = user
                    ? Md5.init(String(username) + '$' + user.signature)
                    : ''

                //check user and signature valid
                if (validSignature !== String(signature) || !user) {
                    const response = Utils.formatErrorSignatureResponse(
                        String(signature),
                    )
                    res.status(400).json(response)
                    return
                } else {
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
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static editTopic = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        const username: string = req.query.username
            ? String(req.query.username)
            : ''
        const signature: string = req.query.signature
            ? String(req.query.signature)
            : ''

        if (version === 'v1') {
            //check user and signature empty
            if (!username || !signature) {
                const response = Utils.formatErrorDataIsEmptyResponse({
                    ...req.query,
                    ...req.body,
                })
                res.status(400).json(response)
                return
            } else {
                // get signature & compare user signature and signature request
                const user = await Utils.getUserSignature(
                    String(req.query.username),
                )
                const validSignature: string = user
                    ? Md5.init(String(username) + '$' + user.signature)
                    : ''

                //check user and signature valid
                if (validSignature !== String(signature) || !user) {
                    const response = Utils.formatErrorSignatureResponse(
                        String(signature),
                    )
                    res.status(400).json(response)
                    return
                } else {
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
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static deleteTopic = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        const username: string = req.query.username
            ? String(req.query.username)
            : ''
        const signature: string = req.query.signature
            ? String(req.query.signature)
            : ''

        if (version === 'v1') {
            //check user and signature empty
            if (!username || !signature) {
                const response = Utils.formatErrorDataIsEmptyResponse(req.query)
                res.status(400).json(response)
                return
            } else {
                // get signature & compare user signature and signature request
                const user = await Utils.getUserSignature(
                    String(req.query.username),
                )
                const validSignature: string = user
                    ? Md5.init(String(username) + '$' + user.signature)
                    : ''

                //check user and signature valid
                if (validSignature !== String(signature) || !user) {
                    const response = Utils.formatErrorSignatureResponse(
                        String(signature),
                    )
                    res.status(400).json(response)
                    return
                } else {
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
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }
}

export default TopicController
