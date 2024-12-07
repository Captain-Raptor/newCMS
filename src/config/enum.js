const permissions = {
  DASHBOARD: {
    VIEW: 'viewDashboard',
  },
  USER: {
    ADD: 'addUser',
    VIEW: 'getUsers',
    EDIT: 'editUser',
    DELETE: 'deleteUser',
  },
  BLOG: {
    CREATE: 'createBlog',
    VIEW: 'getBlog',
    EDIT: 'editBlog',
    DELETE: 'deleteBlog',
    CREATE_API: 'createBlogApi',
    VIEW_API: 'getBlogApi',
    EDIT_API: 'editBlogApi',
    DELETE_API: 'deleteBlogApi',
  },
  EVENT: {
    ADD: 'addEvent',
    VIEW: 'getEvent',
    EDIT: 'editEvent',
    DELETE: 'deleteEvent',
    CREATE_API: 'createEventApi',
    VIEW_API: 'getEventApi',
    EDIT_API: 'updateEventApi',
    DELETE_API: 'deleteEventApi',
  },
  CAMPAIGN: {
    CREATE_API: 'createCampaignApi',
    VIEW_API: 'getCampaignApi',
    EDIT_API: 'editCampaignApi',
    DELETE_API: 'deleteCampaignApi',
    UPLOAD: 'uploadCampaign',
    EXPORT: 'exportCampaign',
    VIEW: 'getCampaign',
    DELETE: 'deleteCampaign',
  },
  WEBSITE: {
    CREATE_API: 'createWebsiteApi',
    VIEW_API: 'getWebsiteApi',
    EDIT_API: 'editWebsiteApi',
    DELETE_API: 'deleteWebsiteApi',
    VIEW_API_BY_ID: 'getWebsiteApiById',
    CREATE: 'createWebsite',
    VIEW: 'listWebsites',
    EDIT: 'editWebsite',
    DELETE: 'deleteWebsite',
    VIEW_BY_ID: 'getWebsiteById',
  },
};

const userRoles = {
  CMS_ADMIN_USER: 'cmsAdminUser',
  CMS_SUB_USER: 'cmsSubUser',
  SUPER_ADMIN: 'superAdmin',
};

module.exports = {
  permissions,
  userRoles,
};
