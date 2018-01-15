'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
//const { GraphQLScalarType, GraphQLError } = require('../../toy-graphql-server/node_modules/graphql');
const CustomErrors = require('./errors');
const { GraphQLScalarType, GraphQLError } = require('graphql');

// Declare internals

const internals = {};

internals.configSchema = Joi.object().keys({
    convert    : Joi.boolean(),
    insensitive: Joi.boolean()
});

internals.Base = class extends GraphQLScalarType {

    constructor(props) {

        super(props);

        this._tests = [];

        this._allowed = [];
        this._disallowed = [];
        this._defaultValue = null;
    }

    createError(teststring) {

        const type = teststring.split('.')[0];
        const rule = teststring.split('.')[1];

        return CustomErrors(type, rule);
    }

    serialize(value) {

        return this.validate({ value });
    }

    parseValue(value) {

        return this.validate({ value });
    }

    _clone() {

        const obj = Hoek.clone(this);
        obj._tests = this._tests.slice();
        obj._allowed = this._allowed.slice();
        obj._disallowed = this._disallowed.slice();

        return obj;
    }

    _test(name, method) {

        const obj = this._clone();
        obj._tests.push({ name, method });

        return obj;
    }

    allow() {

        const obj = this._clone();

        for (const prop in arguments) {

            obj._allowed.push(arguments[prop]);
        }

        return obj;
    }

    disallow() {

        const obj = this._clone();

        for (const prop in arguments) {

            obj._disallowed.push(arguments[prop]);
        }

        return obj;
    }

    validate(ast) {

        if (this._disallowed.length) {

            const normalized = this._options.insensitive ? ast.value.toLocaleLowerCase() : ast.value;

            for (const item of this._disallowed) {

                if (item === normalized) {

                    throw new GraphQLError(ast.value === '' ? 'value can not be empty' : 'value is not allowed');
                }
            }
        }

        for (let i = 0; i < this._tests.length; ++i) {

            const test = this._tests[i];

            const result = test.method(ast, this._options);

            if (result instanceof Error) { // Helpful for more specific errors

                throw result;
            }

            if (!result) {

                throw new GraphQLError(this.createError(test.name));
            }

        }

        return ast.value;
    }

    options(config) {

        Joi.assert(config, internals.configSchema, new GraphQLError('Invalid config options'));

        const obj = this._clone();

        obj._options = Hoek.merge(obj._options, config);

        return obj;
    }

    describe(desc) {

        const obj = this._clone();
        obj.description = desc;

        return obj;
    }

    default(value) {

        const obj = this._clone();
        obj._defaultValue = value;

        return obj;
    }
};

module.exports = internals.Base;
