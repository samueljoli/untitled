'use strict';

const Hoek = require('hoek');
const { GraphQLScalarType, GraphQLError } = require('../../toy-graphql-server/node_modules/graphql');
//const { GraphQLScalarType } = require('graphql');

// Declare internals

const internals = {};

internals.Base = Hoek.clone(GraphQLScalarType);

internals.errors = {
    max: `Value exceeds max`,
    min: 'Value does not meet min',
    emptyString: 'String can not be empty',
    disallow: 'Value is disallowed',
    guid: 'Value must be a valid guid',
    hex: 'Value must be a valid hex code',
    positive: 'Value must be a positive int',
    negative: 'Value must be a negative int',
    range: 'Value must fall within a specific range',
    integer: 'Value must be an integer',
    multiple: 'Value is not a multiple' //TODO
};

Hoek.merge(internals.Base.prototype, { //Calling to super??

    createError(rule) {

        return `ValidationError: ${internals.errors[rule]}`;
    },

    serialize(value) {

        return this.validate({ value });
    },

    parseValue(value) {

        return this.validate({ value });
    },

    _tests: [],

    _clone() {

        const obj = Hoek.clone(this);
        obj._tests = this._tests.slice();
        obj._allowed = this._allowed.slice();

        return obj;
    },

    _test(name, method) {

        const obj = this._clone();
        obj._tests.push({ name, method });

        return obj;
    },

    validate(ast) {

        for (let i = 0; i < this._tests.length; ++i) {

            const result = this._tests[i].method(ast);

            if (!result) {
                throw new GraphQLError(this.createError(this._tests[i].name));
            }

        }

        return ast.value;
    },

    describe(desc) {

        const obj = this._clone();
        obj.description = desc;

        return obj;
    },

    default(value) {

        const obj = this._clone();
        obj._defaultValue = value;

        return obj;
    },

    allow() {

        for (const prop in arguments) {

            this._allowed.push(arguments[prop]);
        }

        return this._clone();
    },

    disallow() {

        for (const prop in arguments) {

            this._disallowed.push(arguments[prop]);
        }

        return this._clone();
    }

});

module.exports = internals.Base;
