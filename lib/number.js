'use strict';

const Base = require('./base');
const Hoek = require('hoek');
const { Kind } = require('graphql');

// Declare internals

const internals = {};

internals.defaults = {
    name: 'NumberScalar',
    serialize: Function,
    parseLiteral: Function,
    parseValue: Function
};

internals.NumberScalar = function NumberScalar() {

    if (NumberScalar._instance) { // Enforce singleton

        NumberScalar._instance._allowed = [];
        NumberScalar._instance._defaultValue = null;

        return NumberScalar._instance;
    }

    this._allowed = [];
    this._defaultValue = null;

    Base.call(this, internals.defaults);

    NumberScalar._instance = this;
};

Hoek.inherits(internals.NumberScalar, Base);

Hoek.merge(internals.NumberScalar.prototype, {

    parseLiteral(ast) {

        if ((this._defaultValue && !ast)) {
            return this._defaultValue;
        }

        if (ast.kind !== Kind.INT) {
            return null;
        }

        return this.validate(ast);
    },

    min(value) {

        return this._test('min', (ast) => {

            return ast.value >= value ? ast.value : null;
        });
    },

    max(value) {

        return this._test('max', (ast) => {

            return ast.value <= value ? ast.value : null;
        });
    },

    positive() {

        return this._test('positive', (ast) => {

            return ast.value > 0 ? ast.value : null;
        });
    },

    negative() {

        return this._test('negative', (ast) => {

            return ast.value < 0 ? ast.value : null;
        });
    },

    multiple(value) {

        return this._test('multiple', (ast) => {

            return ast.value % value === 0 ? ast.value : null;
        });
    }
});

module.exports = function () {

    return new internals.NumberScalar();
};
