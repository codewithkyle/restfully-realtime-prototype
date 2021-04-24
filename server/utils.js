function buildSuccessResponse(data = null){
    return {
        success: true,
        data: data,
        error: null,
    };
}

function buildErrorResponse(error, data = null){
    return {
        success: false,
        data: data,
        error: error,
    };
}

module.exports = { buildSuccessResponse, buildErrorResponse };