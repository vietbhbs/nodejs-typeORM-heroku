import {Response} from "express";

export default class Utils {
    /**
     * get version api
     * @param baseUrl
     * @param res
     */
    static getApiVersion(baseUrl: string, res: Response): string | boolean {
        const splitUrl = baseUrl.split('/')
        const version = splitUrl[2]
        const regex = /^v\d{1,3}$/g;

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
}
