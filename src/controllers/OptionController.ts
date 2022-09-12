import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { Option } from '../entity/Option'
import { AppDataSource } from '../data-source'
import config from '../config/config'
import Utils from '../utils'
import { Md5 } from 'md5-typescript'

class OptionController {
    // get list option
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

                    //Get options from database
                    const optionRepository = AppDataSource.getRepository(Option)

                    let option

                    try {
                        const select = ['option.name', 'option.value', 'option.status', 'option.created_at']

                        // pagination or get all
                        if (req.query.page) {
                            const currentPage = Number(req.query.page)
                            const pageItem = config.pageItem

                            option = await optionRepository
                                .createQueryBuilder('option')
                                .select(select)
                                .skip((currentPage - 1) * pageItem)
                                .take(pageItem)
                                .getMany()
                        } else {
                            option = await optionRepository.createQueryBuilder('option').select(select).getMany()
                        }
                    } catch (e) {
                        res.status(404).json({
                            message: 'Cannot get list options',
                        })
                    } finally {
                        // disconnect database
                        await AppDataSource.destroy()
                    }
                    const actionText = config.action.getAll + ' options'
                    const response = Utils.formatSuccessResponse(actionText, option)

                    //Send the options object
                    res.status(200).json(response)
                }
            }
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    // store new option

    static newOption = async (req: Request, res: Response) => {
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
                    const option = new Option()
                    //Get parameters from the body
                    for (const optionKey in req.body) {
                        option[optionKey] = req.body[optionKey]
                    }
                    option['updated_pass'] = new Date()
                    //Validate if the parameters are ok
                    const errors = await validate(option, {
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

                    //Try to save. If fails, the option is already in use

                    const optionRepository = AppDataSource.getRepository(Option)
                    await AppDataSource.manager.save(option)
                    try {
                        await optionRepository.save(option)
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
                        message: 'option created',
                    })
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    // show option detail
    static getOptionById = async (req: Request, res: Response) => {
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
            const optionRepository = AppDataSource.getRepository(Option)
            try {
                const options = await optionRepository.findOneBy({
                    id: id,
                })

                res.status(200).json({
                    data: options,
                })
            } catch (e) {
                res.status(404).json({
                    message: 'option not found',
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

    static editOption = async (req: Request, res: Response) => {
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
            const optionRepository = AppDataSource.getRepository(Option)
            const option = await optionRepository.findOneBy({
                id: id,
            })

            if (!option) {
                res.status(404).json({
                    message: 'option not found',
                })
                return
            }

            // disconnect database
            await AppDataSource.destroy()

            //Get values from the body
            for (const optionKey in req.body) {
                option[optionKey] = req.body[optionKey]
            }

            //Validate the new values on model
            const errors = await validate(Option)
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

                await optionRepository.save(option)
            } catch (e) {
                res.status(409).json({
                    message: 'option ERROR UPDATE',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            res.status(200).json({
                message: 'option updated',
            })
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static deleteOption = async (req: Request, res: Response) => {
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

            const optionRepository = AppDataSource.getRepository(Option)

            let option
            try {
                option = await optionRepository.findOneOrFail({
                    where: {
                        id: id,
                    },
                })
            } catch (e) {
                res.status(404).json({
                    message: 'option not found',
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

                await optionRepository.remove(option)
            } catch (e) {
                res.status(409).json({
                    message: 'option removed failed.',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //After all send a 204 (no content, but accepted) response
            res.status(200).json({
                message: 'option deleted',
            })
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }
}
export default OptionController
