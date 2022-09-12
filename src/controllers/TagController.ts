import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { Tag } from '../entity/Tag'
import { AppDataSource } from '../data-source'
import config from '../config/config'
import Utils from '../utils'
import { v4 as uuidv4 } from 'uuid'
import logger from '../logger'

const select = [
    'tag.uuid',
    'tag.status',
    'tag.is_hot',
    'tag.name',
    'tag.slugs',
    'tag.language',
    'tag.title',
    'tag.description',
    'tag.keywords',
    'tag.photo',
    'tag.viewed',
    'tag.view_total',
    'tag.view_day',
    'tag.view_week',
    'tag.view_month',
    'tag.view_year',
]

class TagController {
    // get list tag
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }
            //Get users from database

            //Get tags from database
            const tagRepository = AppDataSource.getRepository(Tag)

            let tag

            try {
                // pagination or get all
                if (req.query.page) {
                    const currentPage = Number(req.query.page)
                    const pageItem = config.pageItem

                    tag = await tagRepository
                        .createQueryBuilder('tag')
                        .select(select)
                        .skip((currentPage - 1) * pageItem)
                        .take(pageItem)
                        .getMany()
                } else {
                    tag = await tagRepository.createQueryBuilder('tag').select(select).getMany()
                }
            } catch (error) {
                logger.error('list User: Exception', {
                    statusCode: 404 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(404).json({
                    message: 'Cannot get list tags',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
            const actionText = config.action.getAll + ' tags'
            const response = Utils.formatSuccessResponse(actionText, tag)

            logger.debug('list User: formatSuccessResponse', {
                statusCode: 400 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //Send the tags object
            res.status(200).json(response)
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('list User: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    // store new tag

    static newTag = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

            const tag = new Tag()
            //Get parameters from the body
            for (const tagKey in req.body) {
                tag[tagKey] = req.body[tagKey]
            }
            tag['updated_pass'] = new Date()
            tag.uuid = uuidv4()
            //Validate if the parameters are ok
            const errors = await validate(tag, {
                validationError: { target: false },
            })
            if (errors.length > 0) {
                const response = Utils.formatErrorResponse(errors)
                logger.error('create tag: formatErrorResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

                res.status(400).send(errors)
                return
            }

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Try to save. If fails, the tag is already in use

            const tagRepository = AppDataSource.getRepository(Tag)
            try {
                const tagRecord = await tagRepository.save(tag)
                const actionText = config.action.create + ' user'

                const response = Utils.formatSuccessResponse(actionText, tagRecord.id)
                logger.debug('create tag: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: tagRepository,
                })
                res.status(201).json(response)
            } catch (e) {
                logger.error('create tag: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(409).json({
                    message: 'SAVE ERROR ',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //If all ok, send 201 response
            res.status(201).json({
                message: 'tag created',
            })
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('store user: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    // show tag detail
    static getTagById = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get the category from database
            const tagRepository = AppDataSource.getRepository(Tag)
            try {
                const tags = await tagRepository.findOneBy({
                    id: id,
                })

                if (!tags) {
                    const response = Utils.formatNotExistRecordResponse(req.body)

                    logger.error('tag detail: formatNotExistRecordResponse', {
                        statusCode: 200 || res.statusMessage,
                        api: req.originalUrl,
                        method: req.method,
                        ip: req.ip,
                        input: req.body,
                        res: response,
                    })

                    res.status(200).json(response)
                } else {
                    const actionText = config.action.read + ' tag'
                    const response = Utils.formatSuccessResponse(actionText, tags)

                    logger.debug('list User: formatSuccessResponse', {
                        statusCode: 200 || res.statusMessage,
                        api: req.originalUrl,
                        method: req.method,
                        ip: req.ip,
                        input: req.body,
                        res: response,
                    })

                    res.status(200).json(response)
                }
            } catch (error) {
                logger.error('Tag detail: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(404).json({
                    message: 'Tag not found',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()
            logger.error('show tag: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static editTag = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Try to find category on database
            const tagRepository = AppDataSource.getRepository(Tag)
            const tag = await tagRepository.findOneBy({
                id: id,
            })

            if (!tag) {
                const response = Utils.formatNotExistRecordResponse(req.body)

                logger.error('update tag: formatNotExistRecordResponse', {
                    statusCode: 200 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

                res.status(200).json(response)

                return
            } else {
                await AppDataSource.destroy()
            }

            // disconnect database

            //Get values from the body
            for (const tagKey in req.body) {
                tag[tagKey] = req.body[tagKey]
            }

            //Validate the new values on model
            const errors = await validate(Tag)
            if (errors.length > 0) {
                const response = Utils.formatErrorResponse(errors)
                logger.error('update tag: formatErrorResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })
                res.status(400).send(errors)
                return
            }

            //Try to safe, if fails, that means category already in use
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                const tagRecord = await tagRepository.save(tag)
                const actionText = config.action.update + ' user'

                const response = Utils.formatSuccessResponse(actionText, tagRecord.id)

                logger.debug('update Tag: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: tagRecord,
                })
                //Update user successful
                res.status(200).json(response)
            } catch (e) {
                logger.error('update user: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(409).json({
                    message: 'TAG already in use',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()
            logger.error('update tag: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static deleteTag = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            const tagRepository = AppDataSource.getRepository(Tag)

            let tag
            try {
                tag = await tagRepository.findOneOrFail({
                    where: {
                        id: id,
                    },
                })
            } catch (error) {
                const response = Utils.formatNotExistRecordResponse(req.body)

                logger.error('delete tag: formatNotExistRecordResponse', {
                    statusCode: 200 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

                res.status(200).json(response)
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            // remove category
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                const actionText = await tagRepository.remove(tag)
                logger.debug('delete Tag: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: id,
                })

                const response = Utils.formatSuccessResponse(actionText, id)

                //Remove user successful
                res.status(200).json(response)
            } catch (e) {
                logger.error('delete Tag: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(409).json({
                    message: 'tag removed failed.',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('delete user: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //API Version Not Match
            res.status(200).json(response)
        }
    }
}

export default TagController
