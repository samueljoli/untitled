'use strict';

const Base = require('./base');
const Hoek = require('hoek');
const { Kind, GraphQLError } = require('graphql');

// Declare internals

const internals = {};

internals.defaults = {
    name: 'NumberScalar',
    serialize: Function,
    parseLiteral: Function,
    parseValue: Function
};

internals.configDefaults = {
    convert: true
};

internals.NumberScalar = function NumberScalar() {

    if (NumberScalar._instance) { // Enforce singleton

        NumberScalar._instance._allowed = [];
        NumberScalar._instance._defaultValue = null;
        NumberScalar._instance._options = Hoek.clone(internals.configDefaults);

        return NumberScalar._instance;
    }

    this._allowed = [];
    this._defaultValue = null;
    this._options = Hoek.clone(internals.configDefaults);

    NumberScalar._instance = this;

    Base.call(this, internals.defaults);
};

Hoek.inherits(internals.NumberScalar, Base);

Hoek.merge(internals.NumberScalar.prototype, {

    parseLiteral(ast) {

        if ((this._defaultValue && !ast)) {

            return this._defaultValue;
        }

        if (ast.kind !== Kind.INT) {

            if (ast.kind === Kind.STRING && this._options.convert) {

                ast.value = parseInt(ast.value);
            }
            else {

                const msg = `KindError: expected ${Kind.INT} but got ${ast.kind}`;
                throw new GraphQLError(msg);
            }
        }

        return this.validate(ast);
    },

    min(value) {

        return this._test('number.min', (ast) => {

            return ast.value >= value ? ast.value : null;
        });
    },

    max(value) {

        return this._test('number.max', (ast) => {

            return ast.value <= value ? ast.value : null;
        });
    },

    positive() {

        return this._test('number.positive', (ast) => {

            return ast.value > 0 ? ast.value : null;
        });
    },

    negative() {

        return this._test('number.negative', (ast) => {

            return ast.value < 0 ? ast.value : null;
        });
    },

    multiple(value) {

        return this._test('number.multiple', (ast) => {

            return ast.value % value === 0 ? ast.value : null;
        });
    },

    range(min, max) {

        return this._test('number.range', (ast) => {

            return (( ast.value >= min ) && ( ast.value <= max )) ? ast.value : null;
        });
    },

    integer() {

        return this._test('number.integer', (ast) => {

            return ast.value % 1 === 0 ? ast.value : null;
        });
    }
});

module.exports = function () {

    return new internals.NumberScalar();
};
