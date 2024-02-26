const express = require('express');
const communicayionRoute = require('./communication.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/communication',
    route: communicayionRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
