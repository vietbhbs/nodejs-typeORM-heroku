import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { Configs } from '../entity/Configs'
import { AppDataSource } from '../data-source'
import config from '../config/config'
import Utils from '../utils'
import { Md5 } from 'md5-typescript'

class ConfigsController {
    // get list configs
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

                    //Get configss from database
                    const configsRepository = AppDataSource.getRepository(Configs)

                    let configs

                    try {
                        const select = [
                            'configs.language',
                            'configs.value',
                            'configs.label',
                            'configs.type',
                            'configs.status',
                        ]

                        // pagination or get all
                        if (req.query.page) {
                            const currentPage = Number(req.query.page)
                            const pageItem = config.pageItem

                            configs = await configsRepository
                                .createQueryBuilder('config')
                                .select(select)
                                .skip((currentPage - 1) * pageItem)
                                .take(pageItem)
                                .getMany()
                        } else {
                            configs = await configsRepository.createQueryBuilder('config').select(select).getMany()
                        }
                    } catch (e) {
                        res.status(404).json({
                            message: 'Cannot get list configs',
                        })
                    } finally {
                        // disconnect database
                        await AppDataSource.destroy()
                    }
                    const actionText = config.action.getAll + ' configs'
                    const response = Utils.formatSuccessResponse(actionText, configs)

                    //Send the configss object
                    res.status(200).json(response)
                }
            }
        } else {
            res.status(400).json({
                message: 'API version does not match.',
            })
        }
    }

    // store new configs

    static newConfigs = async (req: Request, res: Response) => {
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
                    const configs = new Configs()
                    //Get parameters from the body
                    for (const configsKey in req.body) {
                        configs[configsKey] = req.body[configsKey]
                    }
                    configs['updated_pass'] = new Date()
                    //Validate if the parameters are ok
                    const errors = await validate(configs, {
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

                    //Try to save. If fails, the configs is already in use

                    const configsRepository = AppDataSource.getRepository(Configs)
                    await AppDataSource.manager.save(configs)
                    try {
                        await configsRepository.save(configs)
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
                        message: 'configs created',
                    })
                }
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    // show configs detail
    static getConfigsById = async (req: Request, res: Response) => {
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
            const configsRepository = AppDataSource.getRepository(Configs)
            try {
                const configss = await configsRepository.findOneBy({
                    id: id,
                })

                res.status(200).json({
                    data: configss,
                })
            } catch (e) {
                res.status(404).json({
                    message: 'configs not found',
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

    static editConfigs = async (req: Request, res: Response) => {
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
            const configsRepository = AppDataSource.getRepository(Configs)
            const configs = await configsRepository.findOneBy({
                id: id,
            })

            if (!configs) {
                res.status(404).json({
                    message: 'configs not found',
                })
                return
            }

            // disconnect database
            await AppDataSource.destroy()

            //Get values from the body
            for (const configsKey in req.body) {
                configs[configsKey] = req.body[configsKey]
            }

            //Validate the new values on model
            const errors = await validate(Configs)
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

                await configsRepository.save(configs)
            } catch (e) {
                res.status(409).json({
                    message: 'Configs ERROR UPDATE',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            res.status(200).json({
                message: 'configs updated',
            })
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    static deleteConfigs = async (req: Request, res: Response) => {
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

            const configsRepository = AppDataSource.getRepository(Configs)

            let configs
            try {
                configs = await configsRepository.findOneOrFail({
                    where: {
                        id: id,
                    },
                })
            } catch (e) {
                res.status(404).json({
                    message: 'configs not found',
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

                await configsRepository.remove(configs)
            } catch (e) {
                res.status(409).json({
                    message: 'configs removed failed.',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }

            //After all send a 204 (no content, but accepted) response
            res.status(200).json({
                message: 'configs deleted',
            })
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            //API Version Not Match
            res.status(200).json(response)
        }
    }
}
export default ConfigsController
