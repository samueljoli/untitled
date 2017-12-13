'use strict';

const Hoek = require('hoek');
const { GraphQLScalarType, Kind } = require('../../toy-graphql-server/node_modules/graphql');
//const { GraphQLScalarType } = require('graphql');

// Declare internals

const internals = {};

internals.Base = Hoek.clone(GraphQLScalarType);

Hoek.merge(internals.Base.prototype, {

    parseLiteral(ast) { // Move this to base class

        if (this._defaultValue && !ast) {
            return this._defaultValue;
        }

        if (ast.kind !== Kind.STRING) {
            return null;
        }

        return this.validate(ast);
    },

    _tests: [],

    _clone() {

        const obj = Hoek.clone(this);
        obj._tests = this._tests.slice();

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
    }

});

module.exports = internals.Base;
