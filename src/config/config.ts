export default {
    jwtSecret: '@QEGTUI',
    userTable: 'tnv_user',
    categoryTable: 'tnv_category',
    signatureTable: 'tnv_data_signature',
    topicTable: 'tnv_topic',
    tagTable: 'tnv_tag',
    pageItem: 10,
    exitCode: {
        success: 0,
        contentIsEmpty: 1,
        invalidParams: 2,
        invalidSignature: 3,
        outdatedSignature: 4,
        invalidService: 5,
        paramsIsEmpty: 6,
        duplicatePrimaryKey: 7,
        notFound: 8,
        notChange: 9,
        notUnique: 10,
        failed: 11,
        apiVersionNotMatch: 12,
    },
    message: {
        invalidSignature: 'Sai chu ky xac thuc',
        success: 'Ghi nhan thanh cong',
        failed: 'Ghi nhan that bai',
        invalidParams: 'Sai hoac thieu tham so',
        duplicate: 'Duplicate value',
        notFound: 'Khong ton tai ban ghi tuong ung',
        fieldNotFound: 'khong ton tai',
        notChange: 'Update that bai, data khong thay doi',
        notUnique: 'da ton tai, hay thu lai',
        apiVersionNotMatch: 'API version does not match.',
    },
    action: {
        create: 'create',
        getAll: 'list',
        update: 'update',
        read: 'show',
        delete: 'delete',
        login: 'login',
        register: 'register',
    },
    exitCodeKey: 'exitCode',
    desKey: 'desc',
    inputDataKey: 'inputData',
    dataKey: 'data',
    insertIdKey: 'insert_id',
    validKey: 'valid',
    disable: 0,
    enable: 1,
    ttlCache: 259200, //3 days
}
