import { Request, Response } from 'express'
import { validate } from 'class-validator'

import { User } from '../entity/User'
import { AppDataSource } from '../data-source'
import Utils from '../utils'
import config from '../config/config'

class UserController {
    // get list users
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }
            //Get users from database
            const userRepository = AppDataSource.getRepository(User)

            let users

            try {
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
                    users = await userRepository
                        .createQueryBuilder('users')
                        .select(select)
                        .getMany()
                }
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
                data: users,
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    // show user detail
    static getOneById = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get the ID from the url
            const id = Number(req.params.id)

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get the user from database
            const userRepository = AppDataSource.getRepository(User)
            try {
                const user = await userRepository.findOneBy({
                    id: id,
                })

                res.status(200).json({
                    data: user,
                })
            } catch (error) {
                res.status(404).json({
                    message: 'User not found',
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

            //Hash the password, to securely store on DB
            user.hashPassword()

            //Validate if the parameters are ok
            const errors = await validate(user)
            if (errors.length > 0) {
                res.status(400).send(errors)
                return
            }

            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Try to save. If fails, the username is already in use
            const userRepository = AppDataSource.getRepository(User)
            try {
                await userRepository.save(user)
            } catch (e) {
                res.status(409).send('username already in use')
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //If all ok, send 201 response
            res.status(201).send('User created')
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
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
                res.status(404).json({
                    message: 'User not found',
                })
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
                res.status(400).send(errors)
                return
            }

            //Try to safe, if fails, that means username already in use
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                await userRepository.save(user)
            } catch (e) {
                res.status(409).send('username already in use')
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //Update user successful
            res.status(200).json({
                message: 'user updated',
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
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
                res.status(404).json({
                    message: 'User not found',
                })
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
                message: 'User deleted',
            })
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }
}

export default UserController
