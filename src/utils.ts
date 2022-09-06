import { Response } from 'express'
import config from './config/config'

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
}
