import { Request, Response } from 'express'
import { validate } from 'class-validator'

import { User } from '../entity/User'
import { AppDataSource } from '../data-source'
import Utils from '../utils'
import config from '../config/config'
import logger from '../logger'

const select = [
    'users.id',
    'users.department_id',
    'users.parent',
    'users.username',
    'users.fullname',
    'users.email',
    'users.status',
    'users.group_id',
    'users.created_at',
    'users.updated_at',
]

class UserController {
    // get list users
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        logger.info('message content', { context: 'index.js', metric: 1 })
        if (version === 'v1') {
            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }
            //Get users from database
            const userRepository = AppDataSource.getRepository(User)

            let users

            try {
                // pagination or get all
                if (req.query.page) {
                    const currentPage = Number(req.query.page)
                    const pageItem = config.pageItem

                    users = await userRepository
                        .createQueryBuilder('users')
                        .select(select)
                        .skip((currentPage - 1) * pageItem)
                        .take(pageItem)
                        .getMany()
                } else {
                    users = await userRepository.createQueryBuilder('users').select(select).getMany()
                }
            } catch (error) {
                res.status(404).json({
                    message: 'Cannot get list users',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            const actionText = config.action.getAll + ' user'
            const response = Utils.formatSuccessResponse(actionText, users)
            //Send the users object
            res.status(200).json(response)
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    // show user detail
    static getOneById = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get the ID from the url
            const id = Number(req.body.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get the user from database
            const userRepository = AppDataSource.getRepository(User)
            try {
                const user = await userRepository
                    .createQueryBuilder('users')
                    .select(select)
                    .where('users.id = :id', { id: id })
                    .getOne()

                if (!user) {
                    const response = Utils.formatNotExistRecordResponse(req.body)
                    res.status(200).json(response)
                } else {
                    const actionText = config.action.read + ' user'
                    const response = Utils.formatSuccessResponse(actionText, user)

                    res.status(200).json(response)
                }
            } catch (error) {
                res.status(404).json({
                    message: 'Cannot get user detail',
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

    // store new user
    static newUser = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get parameters from the body
            const user = new User()
            for (const key in req.body) {
                user[key] = req.body[key]
            }

            user['updated_pass'] = new Date()

            //Validate if the parameters are ok
            const errors = await validate(user)
            if (errors.length > 0) {
                const response = Utils.formatErrorResponse(errors)
                res.status(400).json(response)
                return
            }

            //Hash the password, to securely store on DB
            user.hashPassword()

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Try to save. If fails, the username is already in use
            const userRepository = AppDataSource.getRepository(User)
            try {
                const userRecord = await userRepository.save(user)
                const actionText = config.action.create + ' user'

                const response = Utils.formatSuccessResponse(actionText, userRecord.id)

                res.status(201).json(response)
            } catch (e) {
                res.status(409).send('username already in use')
                return
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

    // update user
    static editUser = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get the ID from body
            const id = Number(req.body.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Try to find user on database
            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({
                id: id,
            })

            if (!user) {
                const response = Utils.formatNotExistRecordResponse(req.body)
                res.status(200).json(response)
                return
            } else {
                // disconnect database
                await AppDataSource.destroy()
            }

            //Get values from the body
            for (const key in req.body) {
                if (key === 'password') {
                    user['updated_pass'] = new Date()
                    user.hashPassword()
                } else {
                    user[key] = req.body[key]
                }
            }

            //Validate the new values on model
            const errors = await validate(user)
            if (errors.length > 0) {
                const response = Utils.formatErrorResponse(errors)
                res.status(400).send(response)
                return
            }

            //Try to safe, if fails, that means username already in use
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                const userRecord = await userRepository.save(user)
                const actionText = config.action.update + ' user'

                const response = Utils.formatSuccessResponse(actionText, userRecord.id)

                //Update user successful
                res.status(200).json(response)
            } catch (e) {
                res.status(409).send('username already in use')
                return
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

    // delete user
    static deleteUser = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get the ID from the url
            const id = Number(req.body.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            const userRepository = AppDataSource.getRepository(User)

            let user
            try {
                user = await userRepository.findOneOrFail({
                    where: {
                        id: id,
                    },
                })
            } catch (error) {
                const response = Utils.formatNotExistRecordResponse(req.body)
                res.status(200).json(response)
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            // remove user
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                await userRepository.remove(user)

                const actionText = config.action.delete + ' user'
                const response = Utils.formatSuccessResponse(actionText, id)

                //Remove user successful
                res.status(200).json(response)
            } catch (e) {
                res.status(409).json({
                    message: 'User removed failed.',
                })
                return
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
}

export default UserController
