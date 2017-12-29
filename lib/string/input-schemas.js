'use strict';

const Joi = require('joi');


exports.email = Joi.object().keys({
    errorLevel    : Joi.alternatives().try(Joi.number().integer().positive(), Joi.boolean()),
    tldWhitelist  : Joi.alternatives().try(Joi.array(), Joi.object()),
    minDomainAtoms: Joi.number().integer().positive()
}).options({ presence: 'optional' });

exports.input = Joi.alternatives().try(Joi.string(), Joi.number());

exports.guid = Joi.array().items(Joi.string().lowercase().valid(['uuidv1', 'uuidv2', 'uuidv3', 'uuidv4', 'uuidv5']));

exports.uri = Joi.object().keys({
    scheme: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object().type(RegExp)),
    allowRelative: Joi.boolean(),
    relativeOnly: Joi.boolean()
}).options({ presence: 'optional' });

exports.base64 = Joi.object().keys({
    paddingRequired: Joi.boolean().default(true)
});
