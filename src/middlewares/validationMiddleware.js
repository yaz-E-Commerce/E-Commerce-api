const validateDto = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        
        // إذا البيانات فيها غلط، بنحيلها لمفتاح الترجمة العام بدل نص زود الخام
        if (!result.success) {
            const issue = result.error.issues[0];
            const errorKey = typeof issue.message === 'string' && issue.message.startsWith('common.')
                ? issue.message
                : 'common.errors.VALIDATION_FAILED';
            const error = new Error(errorKey);
            error.statusCode = 400; // Bad Request
            error.details = result.error.issues;
            return next(error);
        }
        
        // إذا صح، بنخزن الداتا المفحوصة ونمشي
        req.body = result.data;
        next();
    };
};

module.exports = validateDto;