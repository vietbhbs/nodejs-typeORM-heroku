import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { Tag } from '../entity/Tag/Tag'
import { AppDataSource } from '../data-source'

class TagController {

    // get list users
    static listAll = async (req: Request, res: Response) => {
        // const version = Utils.getApiVersion(req.baseUrl, res)
        //
        // if (version === 'v1') {
            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }
            //Get tags from database
            // const tagRepository = AppDataSource.getRepository(Tag)

            let tags

            try {

                // const select = [
                //     'tags.uuid',
                //     'tags.status',
                //     'tags.is_hot',
                //     'tags.name',
                //     'tags.slugs',
                //     'tags.language',
                //     'tags.title',
                //     'tags.description',
                //     'tags.keywords',
                //     'tags.photo',
                //     'tags.viewed',
                //     'tags.view_total',
                //     'tags.view_day',
                //     'tags.view_week',
                //     'tags.view_month',
                //     'tags.view_year'
                // ]

                // pagination or get all
                // if (req.query.page) {
                //     const currentPage = Number(req.query.page)
                //     const pageItem = config.pageItem
                //
                //     tags = await tagRepository
                //         .createQueryBuilder('tnv_tag')
                //         .select(select)
                //         .skip((currentPage - 1) * pageItem)
                //         .take(pageItem)
                //         .getMany()
                // } else {
                //     tags = await tagRepository
                //         .createQueryBuilder('tnv_tag')
                //         .select(select)
                //         .getMany()
                // }
            } catch (error) {
                res.status(404).json({
                    message: 'Cannot get list users',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //Send the users object
            res.status(200).json({
                data: tags,
            })
        // } else {
        //     res.status(400).json({
        //         message: 'API version does not match.',
        //     })
        // }
    }


    // store new user
    static newTag = async (req: Request, res: Response) => {
            //Get parameters from the body
            const tag = new Tag()
            for (const key in req.body) {
                tag[key] = req.body[key]
            }
            tag['updated_pass'] = new Date()
            //Validate if the parameters are ok
            const errors = await validate(tag)
            if (errors.length > 0) {
                res.status(400).send(errors)
                return
            }

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }
            //Try to save. If fails, the username is already in use
            const TagRepository = AppDataSource.getRepository(Tag)
            try {
                await TagRepository.save(tag)
            } catch (e) {
                res.status(409).send('Tag already in tag tagble')
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //If all ok, send 201 response
            res.status(201).send('Tag created')
    }

    // show Tag detail
    static getTagById = async (req: Request, res: Response) => {
            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get the tag from database
            const tagRepository = AppDataSource.getRepository(Tag)
            try {
                const tag = await tagRepository.findOneBy({
                    id: id,
                })

                res.status(200).json({
                    data: tag,
                })
            } catch (error) {
                res.status(404).json({
                    message: 'Tag not found',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
    }
}
export  default  TagController
