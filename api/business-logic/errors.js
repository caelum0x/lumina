/**
 * Custom Error class with status code and detailed serialization
 */
class ApiError extends Error {
    constructor(message, status = 0, code = null, details = null) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.details = details
        Error.captureStackTrace(this, this.constructor)
    }

    toString() {
        let result = `[${this.status || 'ERROR'}] ${this.message}`
        if (this.code) {
            result += ` (Code: ${this.code})`
        }
        if (this.details) {
            result += ` - Details: ${this.details}`
        }
        return result
    }

    toJSON() {
        return {
            error: this.message,
            status: this.status,
            code: this.code,
            details: this.details
        }
    }
}

function generateError({message, status, code, details}) {
    return new ApiError(message, status || 0, code, details)
}

function withDetails(message, details) {
    if (!details)
        return message
    return message + ' ' + details
}

module.exports = {
    ApiError,
    handleSystemError: function (error) {
        console.error(error)
    },
    genericError: function (internalError) {
        return generateError({
            message: 'Error occurred. If this error persists, please contact our support.',
            status: 0,
            internalError: internalError
        })
    },
    badRequest: function (details = null) {
        return generateError({
            message: withDetails('Bad request.', details),
            status: 400
        })
    },
    forbidden: function (details = null) {
        return generateError({
            message: withDetails('Forbidden.', details),
            status: 403
        })
    },
    notFound: function (details = null) {
        return generateError({
            message: withDetails('Not found.', details),
            status: 404
        })
    },
    validationError: function (invalidParamName, details = null) {
        return this.badRequest(withDetails(`Invalid parameter: "${invalidParamName}".`, details))
    },
    serviceUnavailable: function (details = null) {
        return generateError({
            message: withDetails('Service unavailable.', details),
            status: 503
        })
    }
}