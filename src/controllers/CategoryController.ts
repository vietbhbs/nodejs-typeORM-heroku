import { Request, Response } from 'express'
import { Category } from '../entity/Category'
import { AppDataSource } from '../data-source'
import { validate } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import Utils from '../utils'
import config from '../config/config'
import { Md5 } from 'md5-typescript'

class CategoryController {
    // get list categories
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

                    //Get categories from database
                    const categoryRepository = AppDataSource.getRepository(Category)
                    let categories

                    try {
                        const select = [
                            'categories.id',
                            'categories.name',
                            'categories.language',
                            'categories.slugs',
                            'categories.title',
                            'categories.description',
                            'categories.keywords',
                            'categories.photo',
                            'categories.level',
                            'categories.status',
                            'categories.created_at',
                            'categories.updated_at',
                        ]

                        // pagination or get all
                        if (req.query.page) {
                            const currentPage = Number(req.query.page)
                            const pageItem = config.pageItem

                            categories = await categoryRepository
                                .createQueryBuilder('categories')
                                .select(select)
                                .skip((currentPage - 1) * pageItem)
                                .take(pageItem)
                                .getMany()
                        } else {
                            categories = await categoryRepository
                                .createQueryBuilder('categories')
                                .select(select)
                                .getMany()
                        }
                    } catch (e) {
                        res.status(404).json({
                            message: 'Cannot get list categories',
                        })
                    } finally {
                        // disconnect database
                        await AppDataSource.destroy()
                    }
                    const actionText = config.action.getAll + ' category'
                    const response = Utils.formatSuccessResponse(actionText, categories)

                    //Send the categories object
                    res.status(200).json(response)
                }
            }
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    // show category detail
    static getOneById = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
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
                    //Get the ID from the url
                    const id = Number(req.params.id)

                    // connect database
                    if (!AppDataSource.isInitialized) {
                        await AppDataSource.initialize()
                    }

                    //Get the category from database
                    const categoryRepository = AppDataSource.getRepository(Category)
                    try {
                        const categories = await categoryRepository.findOneBy({
                            id: id,
                        })

                        res.status(200).json({
                            data: categories,
                        })
                    } catch (e) {
                        res.status(404).json({
                            message: 'Category not found',
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

    static newCategory = async (req: Request, res: Response) => {
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
                    const category = new Category()
                    //Get parameters from the body
                    for (const categoryKey in req.body) {
                        category[categoryKey] = req.body[categoryKey]
                    }

                    category.uuid = uuidv4()
                    //Validate if the parameters are ok
                    const errors = await validate(category, {
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
                    const categoryRepository = AppDataSource.getRepository(Category)
                    try {
                        await categoryRepository.save(category)
                    } catch (e) {
                        res.status(409).json({
                            message: 'category already in use',
                        })
                        return
                    } finally {
                        // disconnect database
                        await AppDataSource.destroy()
                    }

                    //If all ok, send 201 response
                    res.status(201).json({
                        message: 'Category created',
                    })
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static editCategory = async (req: Request, res: Response) => {
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
                    //Get the ID from the url
                    const id = Number(req.params.id)

                    // connect database
                    if (!AppDataSource.isInitialized) {
                        await AppDataSource.initialize()
                    }

                    //Try to find category on database
                    const categoryRepository = AppDataSource.getRepository(Category)
                    const category = await categoryRepository.findOneBy({
                        id: id,
                    })

                    if (!category) {
                        res.status(404).json({
                            message: 'Category not found',
                        })
                        return
                    }

                    // disconnect database
                    await AppDataSource.destroy()

                    //Get values from the body
                    for (const categoryKey in req.body) {
                        category[categoryKey] = req.body[categoryKey]
                    }

                    //Validate the new values on model
                    const errors = await validate(Category)
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

                        await categoryRepository.save(category)
                    } catch (e) {
                        res.status(409).json({
                            message: 'category already in use',
                        })
                        return
                    } finally {
                        // disconnect database
                        await AppDataSource.destroy()
                    }

                    res.status(200).json({
                        message: 'category updated',
                    })
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static deleteCategory = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
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
                    //Get the ID from the url
                    const id = Number(req.params.id)

                    // connect database
                    if (!AppDataSource.isInitialized) {
                        await AppDataSource.initialize()
                    }

                    const categoryRepository = AppDataSource.getRepository(Category)

                    let category
                    try {
                        category = await categoryRepository.findOneOrFail({
                            where: {
                                id: id,
                            },
                        })
                    } catch (e) {
                        res.status(404).json({
                            message: 'Category not found',
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

                        await categoryRepository.remove(category)
                    } catch (e) {
                        res.status(409).json({
                            message: 'User removed failed.',
                        })
                        return
                    } finally {
                        // disconnect database
                        await AppDataSource.destroy()
                    }

                    //After all send a 204 (no content, but accepted) response
                    res.status(200).json({
                        message: 'category deleted',
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

export default CategoryController
