'use strict';

const Base = require('./base');
const Hoek = require('hoek');
const { Kind, GraphQLError } = require('graphql');

// Declare internals

const internals = {};

internals.defaults = {
    name: 'DateScalar',
    serialize: Function,
    parseLiteral: Function,
    parseValue: Function
};

internals.DateScalar = function DateScalar() {

    if (DateScalar._instance) { // Enforce singleton

        DateScalar._instance._allowed = [];
        DateScalar._instance._disallowed = [];
        DateScalar._instance._defaultValue = null;

        return DateScalar._instance;
    }

    this._allowed = [];
    this._disallowed = [];
    this._defaultValue = null;

    Base.call(this, internals.defaults);

    DateScalar._instance = this;
};

internals.toDate = function (value) {

    return new Date(value).getTime();
};

Hoek.inherits(internals.DateScalar, Base);

Hoek.merge(internals.DateScalar.prototype, {

    parseLiteral(ast) {

        if (ast.kind !== Kind.STRING) {

            const msg = `KindError: expected DateValue, but got ${ast.kind}`;

            throw new GraphQLError(msg);
        }

        return this.validate(ast);
    },

    before(date) {

        return this._test('date.before', (ast) => {

            const targetDate = internals.toDate(ast.value);
            const beforeDate = internals.toDate(date);

            return targetDate <= beforeDate;
        });
    },

    after(date) {

        return this._test('date.after', (ast) => {

            const targetDate = internals.toDate(ast.value);
            const beforeDate = internals.toDate(date);

            return targetDate >= beforeDate;
        });
    }
});

module.exports = function () {

    return new internals.DateScalar();
};
