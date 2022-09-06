import { Request, Response } from 'express'
import { Category } from '../entity/Category'
import { AppDataSource } from '../data-source'
import { validate } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import Utils from '../utils'
import config from '../config/config'

class CategoryController {
    // get list categories
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // connect database
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

            //Send the categories object
            res.status(200).json({
                data: categories,
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    // show category detail
    static getOneById = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
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
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    static newCategory = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
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
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    static editCategory = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
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

                // disconnect database
                await AppDataSource.destroy()
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
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    static deleteCategory = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
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

                // disconnect database
                await AppDataSource.destroy()
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

                // disconnect database
                await AppDataSource.destroy()
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
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }
}

export default CategoryController
