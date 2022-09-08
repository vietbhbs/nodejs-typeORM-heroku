import { Response } from 'express'
import { AppDataSource } from './data-source'
import { Md5 } from 'md5-typescript'
import * as NodeCache from 'node-cache'
import config from './config/config'
import { Signature } from './entity/Signature'

export default class Utils {
    /**
     * get version api
     * @param baseUrl
     * @param res
     */
    static getApiVersion(baseUrl: string, res: Response): string | boolean {
        const splitUrl = baseUrl.split('/')
        const version = splitUrl[2]
        const regex = /^v\d{1,3}$/g

        if (!regex.test(version)) {
            res.status(400).json('API version is not in the correct.')
        }

        return version
    }

    /**
     * get version number
     * @param version
     * @param prefix
     */
    static getVersionNumber(version, prefix = 'v'): number {
        return version.substring(version.indexOf(prefix) + 1)
    }

    /**
     * format api version not match response
     */
    static formatAPIVersionNotMatchResponse() {
        const response: string[] = []
        response[config.exitCodeKey] = config.exitCode.apiVersionNotMatch

        response[config.desKey] = config.message.apiVersionNotMatch

        return Object.assign({}, response)
    }

    /**
     * format error response
     * @param errors
     */
    static formatErrorResponse(errors) {
        const response: string[] = []
        response[config.exitCodeKey] = config.exitCode.invalidParams

        response[config.desKey] = []
        for (const errorsKey in errors) {
            const constraints = errors[errorsKey].constraints
            response[config.desKey].push(constraints)
        }

        response[config.inputDataKey] = errors[0].target

        return Object.assign({}, response)
    }

    /**
     * format success response
     * @param actionText
     * @param data
     */
    static formatSuccessResponse(actionText, data) {
        const response: string[] = []
        response[config.exitCodeKey] = config.exitCode.success

        response[config.desKey] = actionText + ' - ' + config.message.success

        if (
            actionText.includes(config.action.create) ||
            actionText.includes(config.action.update)
        ) {
            response[config.insertIdKey] = data
        } else {
            response[config.dataKey] = data
        }

        return Object.assign({}, response)
    }

    /**
     * format not exist record response
     * @param data
     */
    static formatNotExistRecordResponse(data) {
        const response: string[] = []
        response[config.exitCodeKey] = config.exitCode.notFound

        response[config.desKey] = config.message.notFound
        response[config.inputDataKey] = data

        return Object.assign({}, response)
    }

    /**
     * format error signature response
     * @param signature
     */
    static formatErrorSignatureResponse(signature: string) {
        const response: string[] = []
        response[config.exitCodeKey] = config.exitCode.invalidSignature
        response[config.desKey] = config.message.invalidSignature
        response[config.validKey] = signature

        return Object.assign({}, response)
    }

    /**
     * format error data empty response
     * @param data
     */
    static formatErrorDataIsEmptyResponse(data) {
        const response: string[] = []
        response[config.exitCodeKey] = config.exitCode.paramsIsEmpty
        response[config.desKey] = config.message.invalidParams
        response[config.inputDataKey] = []
        const obj: any = {}

        for (const key in data) {
            obj[key] = data[key]
        }

        response[config.inputDataKey].push(obj)
        return Object.assign({}, response)
    }

    /**
     * get user signature
     * @param nickname
     * @param role
     */
    static async getUserSignature(nickname, role: number = null) {
        const cacheKey: string =
            this.constructor.name + Md5.init('data_signature' + nickname + role)
        const nodeCache = new NodeCache()
        let result

        if (nodeCache.has(cacheKey)) {
            return nodeCache.get(cacheKey)
        }

        try {
            // connect database
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize()
            }

            const signatureRepository = await AppDataSource.getRepository(
                Signature,
            )
            const signature = await signatureRepository
                .createQueryBuilder('signatures')
                .select([
                    'signatures.nickname',
                    'signatures.signature',
                    'signatures.role',
                ])
                .where('signatures.nickname = :nickname', {
                    nickname: nickname,
                })
                .andWhere('signatures.status = :status', {
                    status: config.enable,
                })
                .andWhere('signatures.role = :role', {
                    role: role,
                })

            result = await signature.getOne()
            nodeCache.set(cacheKey, result, config.ttlCache)
        } catch (e) {
            // console.log(e)
        } finally {
            // disconnect database
            await AppDataSource.destroy()
        }

        return result
    }
}
