const express = require('express');
const { API_URLS } = require('../../constants');
const { apiResponse } = require('../../utils/common');
const { sendDataToExchanges, outReach } = require('../../services/index');

const router = express.Router();

router.post(API_URLS.COMMUNICATION.OUT_REACH, async (req, res) => apiResponse(await sendDataToExchanges(req.body), res));

router.get(API_URLS.COMMUNICATION.OUT_REACH, async (req, res) => apiResponse(await outReach(), res));

module.exports = router;
