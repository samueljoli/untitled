'use strict';

const Base = require('./base');
const Hoek = require('hoek');
const Joi = require('joi');
const { Kind, GraphQLError } = require('graphql');

// Declare internals

const internals = {};

internals.defaults = {
    name        : 'DateScalar',
    serialize   : Function,
    parseLiteral: Function,
    parseValue  : Function
};

internals.configDefaults = {
    convert: true
};

internals.inputSchema = Joi.alternatives().try(Joi.number().integer(), Joi.string());

internals.toDate = (value) => {

    let date;
    const isString = typeof value === 'string';
    const isIntAndFinite = (typeof value === 'number' && !isNaN(value) && isFinite(value));

    if (value instanceof Date) {

        return value;
    }

    if (isString || isIntAndFinite) {

        const miliSecRegex = /^[+-]?\d+(\.\d+)?$/;

        if (isString && miliSecRegex.test(value)) {

            value = parseFloat(value);
        }

        date = new Date(value);

        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    throw new GraphQLError('Invalid Date');
};

internals.DateScalar = class DateScalar extends Base {

    constructor() {

        super(internals.defaults);

        if (DateScalar._instance) { // Enforce singleton

            DateScalar._instance._options = Hoek.clone(internals.configDefaults);

            return DateScalar._instance;
        }

        this._options = Hoek.clone(internals.configDefaults);

        DateScalar._instance = this;
    }

    parseLiteral(ast) {

        if ((ast.kind === Kind.STRING || ast.kind === Kind.INT)) {

            ast.value = internals.toDate(ast.value);

            return this.validate(ast);
        }

        throw new GraphQLError(`KindError: expected DateValue, but got ${ast.kind}`);
    }

    before(date) {

        date = Joi.attempt(date, internals.inputSchema);

        return this._test('date.before', (ast) => {

            const targetDate = internals.toDate(ast.value);
            const beforeDate = internals.toDate(date);

            return targetDate <= beforeDate;
        });
    }

    after(date) {

        date = Joi.attempt(date, internals.inputSchema);

        return this._test('date.after', (ast) => {

            const targetDate = internals.toDate(ast.value);
            const afterDate = internals.toDate(date);

            return targetDate >= afterDate;
        });
    }
};

module.exports = function () {

    return new internals.DateScalar();
};
