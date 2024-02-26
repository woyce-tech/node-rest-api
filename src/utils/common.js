const { RESPONSE_STATUS, MESSAGES } = require('../constants');

exports.apiResponse = async ({ status, data, message, others, responseCode }, res) => {
  let statusMSG = '';
  try {
    if (status === RESPONSE_STATUS.FAIL) {
      statusMSG = message;
    } else if (status === RESPONSE_STATUS.UNAUTHORIZED) {
      statusMSG = message;
      return res.status(401).json({
        status,
        message,
        data,
        others,
        responseCode,
      });
    } else if (status === RESPONSE_STATUS.ERROR) {
      if (new RegExp('.*:[0-9]*').test(res.req.headers.host)) {
        statusMSG = message;
      } else {
        statusMSG = MESSAGES.COMMON.SOMETHING_WENT_WRONG;
      }
      return res.status(500).json({
        status,
        message: statusMSG,
        data,
        others,
        responseCode,
      });
    } else if (status === RESPONSE_STATUS.NOT_FOUND) {
      statusMSG = message;
      return res.status(404).json({
        status,
        message,
        data,
        others,
        responseCode,
      });
    } else if (status === RESPONSE_STATUS.BAD_REQUEST) {
      statusMSG = message;
      return res.status(400).json({
        status,
        message,
        data,
        others,
        responseCode,
      });
    } else if (status === RESPONSE_STATUS.SUCCESS) {
      statusMSG = RESPONSE_STATUS.SUCCESS;
      return res.status(200).json({
        status,
        data,
        message,
        others,
        responseCode,
      });
    }
  } catch (error) {
    return { status: RESPONSE_STATUS.ERROR, message: error.message };
  }
};
