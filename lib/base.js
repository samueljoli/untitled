'use strict';

const Hoek = require('hoek');
const { GraphQLScalarType } = require('../../toy-graphql-server/node_modules/graphql');
//const { GraphQLScalarType } = require('graphql');

// Declare internals

const internals = {};

internals.Base = Hoek.clone(GraphQLScalarType);

Hoek.merge(internals.Base.prototype, {

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
                return null;
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

        this._defaultValue = value;

        return this._clone();
    },

    allow() {

        for (const prop in arguments) {
            this._allowed.push(arguments[prop]);
        }

        return this._clone();
    }

});

module.exports = internals.Base;
