import {Response} from "express";

export default class Utils {
    static getApiVersion(baseUrl: string, res: Response): string | boolean {
        const splitUrl = baseUrl.split('/')
        const version = splitUrl[2]
        const regex = /^v\d{1,3}$/g;

        if (!regex.test(version)) {
            res.status(400).send('API version is not in the correct.')
        }

        return version
    }
}
