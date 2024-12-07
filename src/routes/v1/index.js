const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const contactRoute = require('./contact.route');
const companyRoute = require('./company.route');
const eventSubmissionRoute = require('./eventSubmission.route');
const eventApiRoute = require('./eventApi.route');
const blogApiRoute = require('./blogApi.route');
const blogRoute = require('./blog.route');
const campaignApiRoute = require('./campaignApi.route');
const campaignRoute = require('./campaign.route');
const websiteRoute = require('./website.route')
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/companies',
    route: companyRoute,
  },
  {
    path: '/eventsApi',
    route: eventApiRoute,
  },
  {
    path: '/contact',
    route: contactRoute,
  },
  {
    path: '/events',
    route: eventSubmissionRoute,
  },
  {
    path: '/blogApi',
    route: blogApiRoute,
  },
  {
    path: '/blog',
    route: blogRoute,
  },
  {
    path: '/campaignApi',
    route: campaignApiRoute,
  },
  {
    path: '/campaign',
    route: campaignRoute,
  },

  {
    path: '/websites',
    route: websiteRoute, // New Website route
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
