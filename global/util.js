module.exports = {
    responseHandler: (res, success, message, data) => {
        // console.log("-------------------- response message -------------------")
        // console.log(message);
        res.status(200).json({
            success: success,
            message: message,
            data: data
        });
    }
}