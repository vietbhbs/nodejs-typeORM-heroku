import {Request, Response} from 'express'
import {Category} from '../entity/Category'
import {AppDataSource} from '../data-source'
import {validate} from 'class-validator'
import {v4 as uuidv4} from 'uuid'

class CategoryController {
    static listAll = async (req: Request, res: Response) => {
        //Get categories from database
        const categoryRepository = AppDataSource.getRepository(Category)
        let categories
        // pagination or get all
        if (req.query.page) {
            const currentPage = Number(req.query.page)
            const pageItem = 2

            categories = await categoryRepository.createQueryBuilder('category')
                .skip((currentPage - 1) * pageItem)
                .take(pageItem)
                .getMany()
        } else {
            categories = await categoryRepository.find()
        }

        //Send the categories object
        res.status(200).json({
            'data': categories
        })
    }

    static getOneById = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = Number(req.params.id)

        //Get the category from database
        const categoryRepository = AppDataSource.getRepository(Category)
        try {
            const categories = await categoryRepository.findOneBy({
                id: id,
            })

            res.status(200).json({
                'data': categories
            })
        } catch (error) {
            res.status(404).json({
                'message': 'Category not found'
            })
        }
    }

    static newCategory = async (req: Request, res: Response) => {
        const category = new Category()
        //Get parameters from the body
        for (const categoryKey in req.body) {
            category[categoryKey] = req.body[categoryKey]
        }

        category.uuid = uuidv4()
        //Validate if the parameters are ok
        const errors = await validate(category, {validationError: {target: false}})
        if (errors.length > 0) {
            res.status(400).send(errors)
            return
        }

        //Try to save. If fails, the category is already in use
        const categoryRepository = AppDataSource.getRepository(Category)
        try {
            await categoryRepository.save(category)
        } catch (e) {
            res.status(409).json({
                'message': 'category already in use'
            })
            return
        }

        //If all ok, send 201 response
        res.status(201).json({
            'message': 'Category created'
        })
    }

    static editCategory = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = Number(req.params.id)

        //Try to find category on database
        const categoryRepository = AppDataSource.getRepository(Category)
        const category = await categoryRepository.findOneBy({
            id: id,
        })

        if (!category) {
            res.status(404).json({
                'message': 'Category not found'
            })
            return
        }

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
            await categoryRepository.save(category)
        } catch (e) {
            res.status(409).json({
                'message': 'category already in use'
            })
            return
        }

        res.status(200).json({
            'message': 'category updated'
        })
    }

    static deleteCategory = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = Number(req.params.id)
        const categoryRepository = AppDataSource.getRepository(Category)

        try {
            await categoryRepository.findOneOrFail({
                where: {
                    id: id
                }
            })
        } catch (error) {
            res.status(404).json({
                'message': 'Category not found'
            })
            return
        }
        await categoryRepository.delete(id)

        //After all send a 204 (no content, but accepted) response
        res.status(200).json({
            'message': 'category deleted'
        })
    }
}

export default CategoryController
