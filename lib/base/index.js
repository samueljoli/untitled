'use strict';

const Hoek = require('hoek');
const Joi = require('joi');
//const { GraphQLScalarType, GraphQLError } = require('../../toy-graphql-server/node_modules/graphql');
const CustomErrors = require('./errors');
const { GraphQLScalarType, GraphQLError } = require('graphql');

// Declare internals

const internals = {};

//TODO: Root of the problem is that there is a name and instance discrep
//TODO: Solution, each instance needs to be given a new name and on top of that
//I need to build an internal cache system that would reference the same
//instance if it has the same rules
//TODO: Check how GraphQL is doing this, is a GraphQLString with a desc the same as a
//GraphQLString that does not have a desc
//SHould note that every instantiation will be a new defined type in your
//GraphQl data world

internals.configSchema = Joi.object().keys({
    convert    : Joi.boolean(),
    insensitive: Joi.boolean()
});

internals.rename = (obj) => {

    obj.name = obj.name + String((Math.random() * 10)).replace('.', 'z');
};

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

        internals.rename(obj);

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
