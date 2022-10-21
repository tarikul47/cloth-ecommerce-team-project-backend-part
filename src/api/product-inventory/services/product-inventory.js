'use strict';

/**
 * product-inventory service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product-inventory.product-inventory');
