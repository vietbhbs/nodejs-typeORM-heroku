import { Request, Response } from 'express'
import { validate } from 'class-validator'

import { User } from '../entity/User'
import { AppDataSource } from '../data-source'
import Utils from '../utils'

class UserController {
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            //Get users from database
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find({
                select: [
                    'id',
                    'department_id',
                    'parent',
                    'username',
                    'fullname',
                    'email',
                    'status',
                    'group_id',
                    'created_at',
                    'updated_at'
                ], //We don't want to send the passwords on response
            })

            //Send the users object
            res.send(users)
        } else{
            res.status(400).send('API version is not in the correct.')
        }
    }

    static getOneById = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id: number = req.body.id

        //Get the user from database
        const userRepository = AppDataSource.getRepository(User)
        try {
            await userRepository.findOneBy({
                id: id,
            })
        } catch (error) {
            res.status(404).send('User not found')
        }
    }

    static newUser = async (req: Request, res: Response) => {
        //Get parameters from the body
        const { username, password } = req.body
        const user = new User()
        user.username = username
        user.password = password

        //Validate if the parameters are ok
        const errors = await validate(user)
        if (errors.length > 0) {
            res.status(400).send(errors)
            return
        }

        //Hash the password, to securely store on DB
        user.hashPassword()

        //Try to save. If fails, the username is already in use
        const userRepository = AppDataSource.getRepository(User)
        try {
            await userRepository.save(user)
        } catch (e) {
            res.status(409).send('username already in use')
            return
        }

        //If all ok, send 201 response
        res.status(201).send('User created')
    }

    static editUser = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = req.body.id

        //Get values from the body
        const { username, role } = req.body

        //Try to find user on database
        const userRepository = AppDataSource.getRepository(User)
        let user
        try {
            user = await userRepository.findOneBy({
                id: id,
            })
        } catch (error) {
            //If not found, send a 404 response
            res.status(404).send('User not found')
            return
        }

        //Validate the new values on model
        user.username = username
        user.role = role
        const errors = await validate(user)
        if (errors.length > 0) {
            res.status(400).send(errors)
            return
        }

        //Try to safe, if fails, that means username already in use
        try {
            await userRepository.save(user)
        } catch (e) {
            res.status(409).send('username already in use')
            return
        }
        //After all send a 204 (no content, but accepted) response
        res.status(204).send()
    }

    static deleteUser = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = req.body.id

        const userRepository = AppDataSource.getRepository(User)
        try {
            await userRepository.findOneOrFail(id)
        } catch (error) {
            res.status(404).send('User not found')
            return
        }
        await userRepository.delete(id)

        //After all send a 204 (no content, but accepted) response
        res.status(204).send()
    }
}

export default UserController
