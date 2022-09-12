import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { Option } from '../entity/Option'
import { AppDataSource } from '../data-source'
import config from '../config/config'
import Utils from '../utils'
import logger from '../logger'

const select = ['option.name', 'option.value', 'option.status', 'option.created_at']

class OptionController {
    // get list option
    static listAll = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

            //connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            //Get options from database
            const optionRepository = AppDataSource.getRepository(Option)

            let option

            try {
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
            } catch (error) {
                logger.error('list Option: Exception', {
                    statusCode: 404 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(404).json({
                    message: 'Cannot get list options',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
            const actionText = config.action.getAll + ' options'
            const response = Utils.formatSuccessResponse(actionText, option)
            logger.debug('list Option: formatSuccessResponse', {
                statusCode: 400 || res.statusMessage,
                api: req.originalUrl,
                method: req.method,
                ip: req.ip,
                input: req.body,
                res: response,
            })

            //Send the options object
            res.status(200).json(response)
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('list Option: formatAPIVersionNotMatchResponse', {
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

    // store new option

    static newOption = async (req: Request, res: Response) => {
        const version = Utils.getApiVersion(req.baseUrl, res)
        if (version === 'v1') {
            // validate signature
            if (!(await Utils.validateSignature(req, res))) {
                return
            }

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
                const response = Utils.formatErrorResponse(errors)
                logger.error('create option: formatErrorResponse', {
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

            //Try to save. If fails, the option is already in use

            const optionRepository = AppDataSource.getRepository(Option)
            try {
                const optionRecord = await optionRepository.save(option)
                const actionText = config.action.create + ' option'

                const response = Utils.formatSuccessResponse(actionText, optionRecord.id)
                logger.debug('create option: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: optionRecord,
                })

                res.status(201).json(response)
            } catch (e) {
                logger.error('create option: Exception', {
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
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('store option: formatAPIVersionNotMatchResponse', {
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

                if (!options) {
                    const response = Utils.formatNotExistRecordResponse(req.body)

                    logger.error('option detail: formatNotExistRecordResponse', {
                        statusCode: 200 || res.statusMessage,
                        api: req.originalUrl,
                        method: req.method,
                        ip: req.ip,
                        input: req.body,
                        res: response,
                    })

                    res.status(200).json(response)
                } else {
                    const actionText = config.action.read + ' option'
                    const response = Utils.formatSuccessResponse(actionText, options)

                    logger.debug('list option: formatSuccessResponse', {
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
                logger.error('option detail: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(404).json({
                    message: 'option not found',
                })
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('show Option: formatAPIVersionNotMatchResponse', {
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
                const response = Utils.formatNotExistRecordResponse(req.body)

                logger.error('update Option: formatNotExistRecordResponse', {
                    statusCode: 200 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: response,
                })

                res.status(200).json(response)

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
                const response = Utils.formatErrorResponse(errors)

                logger.error('update option: formatErrorResponse', {
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

            //Try to safe, if fails, that means category already in use
            try {
                // connect database
                if (!AppDataSource.isInitialized) {
                    await AppDataSource.initialize()
                }

                const optionRecord = await optionRepository.save(option)
                const actionText = config.action.update + ' option'

                const response = Utils.formatSuccessResponse(actionText, optionRecord.id)

                logger.debug('update Option: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: optionRecord,
                })
                //Update option successful
                res.status(200).json(response)
            } catch (e) {
                logger.error('update option: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(409).send('option already in use')
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
            } catch (error) {
                const response = Utils.formatNotExistRecordResponse(req.body)

                logger.error('delete option: formatNotExistRecordResponse', {
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

                await optionRepository.remove(option)
                const actionText = config.action.delete + ' option'

                logger.debug('delete Option: formatSuccessResponse', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                    res: id,
                })

                const response = Utils.formatSuccessResponse(actionText, id)

                //Remove option successful
                res.status(200).json(response)
            } catch (e) {
                logger.error('delete option: Exception', {
                    statusCode: 400 || res.statusMessage,
                    api: req.originalUrl,
                    method: req.method,
                    ip: req.ip,
                    input: req.body,
                })

                res.status(409).json({
                    message: 'option removed failed.',
                })
                return
            } finally {
                // disconnect database
                await AppDataSource.destroy()
            }
        } else {
            const response = Utils.formatAPIVersionNotMatchResponse()

            logger.error('delete option: formatAPIVersionNotMatchResponse', {
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

export default OptionController
