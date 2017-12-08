'use strict';

const Base = require('./base');
const Hoek = require('hoek');
const { Kind } = require('graphql');

// Declare internals

const internals = {};

internals.defaults = {
    name: 'StringScalar',
    serialize: Function,
    parseLiteral: Function,
    parseValue: Function
};

internals.StringScalar = function StringScalar() {

    Base.call(this, internals.defaults);
};

Hoek.inherits(internals.StringScalar, Base);

Hoek.merge(internals.StringScalar.prototype, {
    parseLiteral(ast) {

        if (!ast.kind !== Kind.STRING) {
            return null;
        }
    },

    min(value) {

        return this._test('min', (ast) => {

            const { length } = ast.value;

            return length >= value ? ast.value : null;
        });
    }
});

module.exports = function () {

    return new internals.StringScalar();
};
