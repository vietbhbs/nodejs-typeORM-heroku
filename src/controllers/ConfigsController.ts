import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { Configs } from '../entity/Configs'
import { AppDataSource } from '../data-source'
import config from '../config/config'
import Utils from '../utils'
import logger from '../logger'

const select = ['configs.language', 'configs.value', 'configs.label', 'configs.type', 'configs.status']

class ConfigsController {
    // get list configs
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        //get username and signature
        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

            //connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get configss from database
            const configsRepository = AppDataSource.getRepository(Configs)

            let configs

            try {
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
            } catch (error) {
                logger.error('list Config: Exception', {
                    statusCode: 404 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(404).json({
                    message: 'Cannot get list Configs',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
            const actionText = config.action.getAll + ' configs'
            const response = Utils.formatSuccessResponse(actionText, configs)
            logger.debug('list User: formatSuccessResponse', {
                statusCode: 400 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //Send the configss object
            res.status(200).json(response)
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('list User: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //API Version Not Match
            res.status(200).json(response)
        }
    }

    // store new configs

    static newConfigs = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)

        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

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
                const response = Utils.formatErrorResponse(errors)
                logger.error('create Config: formatErrorResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

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
                const userRecord = await configsRepository.save(configs)
                const actionText = config.action.create + ' config'

                const response = Utils.formatSuccessResponse(actionText, userRecord.id)
                logger.debug('create config: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: userRecord,
                })

                res.status(201).json(response)
            } catch (e) {
                logger.error('create user: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

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
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('store user: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

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
                const configs = await configsRepository.findOneBy({
                    id: id,
                })

                if (!configs) {
                    const response = Utils.formatNotExistRecordResponse(req.body)

                    logger.error('user detail: formatNotExistRecordResponse', {
                        statusCode: 200 || res.statusMessage,
                        api: req.originalUrl,
                        method: req.method,
                        ip: req.ip,
                        input: req.body,
                        res: response,
                    })

                    res.status(200).json(response)
                } else {
                    const actionText = config.action.read + ' user'
                    const response = Utils.formatSuccessResponse(actionText, configs)

                    logger.debug('list User: formatSuccessResponse', {
                        statusCode: 200 || res.statusMessage,
                        api: req.originalUrl,
                        method: req.method,
                        ip: req.ip,
                        input: req.body,
                        res: response,
                    })

                    res.status(200).json(response)
                }
            } catch (error) {
                logger.error('Config detail: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(404).json({
                    message: 'Cannot get config detail',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()
            logger.error('show user: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

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
                const response = Utils.formatNotExistRecordResponse(req.body)

                logger.error('update config: formatNotExistRecordResponse', {
                    statusCode: 200 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

                res.status(200).json(response)
                return
            } else {
                // disconnect database
                await AppDataSource.destroy()
            }

            //Get values from the body
            for (const configsKey in req.body) {
                configs[configsKey] = req.body[configsKey]
            }

            //Validate the new values on model
            const errors = await validate(Configs)
            if (errors.length > 0) {
                const response = Utils.formatErrorResponse(errors)

                logger.error('update user: formatErrorResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

                res.status(400).send(response)
                return
            }

            //Try to safe, if fails, that means category already in use
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                const configRecord = await configsRepository.save(configs)
                const actionText = config.action.update + ' user'

                const response = Utils.formatSuccessResponse(actionText, configRecord.id)

                logger.debug('update User: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: configRecord,
                })
                //Update user successful
                res.status(200).json(response)
            } catch (e) {
                logger.error('update config: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(409).send('config already in use')
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

            logger.error('update user: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

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
            } catch (error) {
                const response = Utils.formatNotExistRecordResponse(req.body)

                logger.error('delete config: formatNotExistRecordResponse', {
                    statusCode: 200 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

                res.status(200).json(response)

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
                const actionText = config.action.delete + ' config'

                logger.debug('delete Config: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: id,
                })

                const response = Utils.formatSuccessResponse(actionText, id)

                //Remove user successful
                res.status(200).json(response)
            } catch (e) {
                logger.error('delete config: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(409).json({
                    message: 'config removed failed.',
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
            logger.error('delete user: formatAPIVersionNotMatchResponse', {
                statusCode: 200 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //API Version Not Match
            res.status(200).json(response)
        }
    }
}

export default ConfigsController
