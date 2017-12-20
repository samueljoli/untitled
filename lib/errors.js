'use strict';

const Hoek = require('hoek');
const internals = {};

module.exports = (type, rule, value) => {

    Hoek.assert(typeof type === 'string', 'Can not create proper error without type');
    Hoek.assert(typeof rule === 'string', 'Can not create proper error without rule');

    return internals.create(type, rule, value);

};

internals.dictionary = {
    string: {
        max: 'string exceeds maximum length allowed',
        min: 'string does not meet the minimum length specified', //TODO pass in length
        emptyString: 'string can not be empty',
        disallow: 'value is not allowed',
        guid: 'string is not a valid guid', //TODO guid version,
        hex: 'string is not a valid hex code'
    },
    number: {
        max: 'number exceeds maximum allowed',
        min: 'number does not meet the minimum value specified',
        disallow: 'number is not allowed', //TODO number and float?
        positive: 'number is not positive',
        negative: 'number is not negative',
        range: 'number must fall within specified range',
        integer: 'number must be an integer',
        multiple(value) { 
            return `number must be a multiple of: ${value}`;
        }
    }
};

internals.create = (type, rule, value) => {

    return internals.dictionary[type][rule](value);
};
