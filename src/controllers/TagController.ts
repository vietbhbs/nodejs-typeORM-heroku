import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { Tag } from '../entity/Tag'
import { AppDataSource } from '../data-source'
import config from '../config/config'
import Utils from '../utils'
import { v4 as uuidv4 } from 'uuid'
import { Md5 } from 'md5-typescript'

class TagController {
    // get list tag
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        //get username and signature
        const username: string = req.query.username ? String(req.query.username) : ''
        const signature: string = req.query.signature ? String(req.query.signature) : ''
        if (version === 'v1') {
            //check user and signature empty
            if (!username || !signature) {
                const response = Utils.formatErrorDataIsEmptyResponse(req.query)
                res.status(400).json(response)
                return
            } else {
                // get signature & compare user signature and signature request
                const user = await Utils.getUserSignature(String(req.query.username))
                const validSignature: string = user ? Md5.init(String(username) + '$' + user.signature) : ''
                //check user and signature valid
                if (validSignature !== String(signature) || !user) {
                    const response = Utils.formatErrorSignatureResponse(String(signature))
                    res.status(400).json(response)
                    return
                } else {
                    //connect database
                    if (!AppDataSource.isInitialized) {
                        await AppDataSource.initialize()
                    }

                    //Get tags from database
                    const tagRepository = AppDataSource.getRepository(Tag)

                    let tag

                    try {
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
                    } catch (e) {
                        res.status(404).json({
                            message: 'Cannot get list tags',
                        })
                    } finally {
                        // disconnect database
                        await AppDataSource.destroy()
                    }
                    const actionText = config.action.getAll + ' tags'
                    const response = Utils.formatSuccessResponse(actionText, tag)

                    //Send the tags object
                    res.status(200).json(response)
                }
            }
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    // store new tag

    static newTag = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        const username: string = req.query.username ? String(req.query.username) : ''
        const signature: string = req.query.signature ? String(req.query.signature) : ''

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
                const user = await Utils.getUserSignature(String(req.query.username))
                const validSignature: string = user ? Md5.init(String(username) + '$' + user.signature) : ''

                //check user and signature valid
                if (validSignature !== String(signature) || !user) {
                    const response = Utils.formatErrorSignatureResponse(String(signature))
                    res.status(400).json(response)
                    return
                } else {
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
                        res.status(400).send(errors)
                        return
                    }

                    // connect database
                    if (!AppDataSource.isInitialized) {
                        await AppDataSource.initialize()
                    }

                    //Try to save. If fails, the tag is already in use

                    const tagRepository = AppDataSource.getRepository(Tag)
                    await AppDataSource.manager.save(tag)
                    try {
                        await tagRepository.save(tag)
                    } catch (e) {
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
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

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

                res.status(200).json({
                    data: tags,
                })
            } catch (e) {
                res.status(404).json({
                    message: 'Tag not found',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

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
                res.status(404).json({
                    message: 'Tag not found',
                })
                return
            }

            // disconnect database
            await AppDataSource.destroy()

            //Get values from the body
            for (const tagKey in req.body) {
                tag[tagKey] = req.body[tagKey]
            }

            //Validate the new values on model
            const errors = await validate(Tag)
            if (errors.length > 0) {
                res.status(400).send(errors)
                return
            }

            //Try to safe, if fails, that means category already in use
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                await tagRepository.save(tag)
            } catch (e) {
                res.status(409).json({
                    message: 'TAG ERROR UPDATE',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            res.status(200).json({
                message: 'Tag updated',
            })
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

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
            } catch (e) {
                res.status(404).json({
                    message: 'tag not found',
                })
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

                await tagRepository.remove(tag)
            } catch (e) {
                res.status(409).json({
                    message: 'tag removed failed.',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //After all send a 204 (no content, but accepted) response
            res.status(200).json({
                message: 'tag deleted',
            })
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }
}
export default TagController
