'use strict';

const Base = require('./base');
const Hoek = require('hoek');
const { Kind, GraphQLError } = require('graphql');

// Declare internals

const internals = {};

internals.defaults = {
    name        : 'BooleanScalar',
    serialize   : Function,
    parseLiteral: Function,
    parseValue  : Function
};

internals.configDefaults = {
    convert    : true,
    insensitive: true
};

internals.BooleanScalar = class BooleanScalar extends Base {

    constructor() {

        super(internals.defaults);

        if (BooleanScalar._instance) { // Enforce singleton

            BooleanScalar._flags = {
                isBinary: false
            };

            BooleanScalar._instance._defaultValue = null;
            BooleanScalar._instance._options = Hoek.clone(internals.configDefaults);

            return BooleanScalar._instance;
        }

        this._flags = {
            isBinary: false
        };

        this._defaultValue = null;
        this._options = Hoek.clone(internals.configDefaults);

        BooleanScalar._instance = this;
    }

    parseLiteral(ast) {

        if (this._defaultValue && !ast) { //TODO: Check for ast.value?

            return this._defaultValue;
        }

        if (ast.kind !== Kind.BOOLEAN && ast.kind !== Kind.STRING && !this._flags.isBinary) {

            throw new GraphQLError(`KindError: expected ${Kind.BOOLEAN}, but got ${ast.kind}`);
        }

        if (ast.kind === Kind.STRING) {

            if (this._options.convert && !this._flags.isBinary) {

                if (this._options.insensitive) {

                    const normalized = ast.value.toLocaleLowerCase();

                    if (normalized === 'true') {

                        ast.value = true;
                    }

                    if (normalized === 'false') {

                        ast.value = false;
                    }

                    ast.value = normalized;
                }
                else {

                    throw new GraphQLError('value must be a boolean');
                }

            }
        }

        if (this._flags.isBinary) {

            if (typeof ast.value === 'number') {

                ast.value = ast.value === 1 ? true : false;

                return this.validate(ast);
            }

            if (this._options.convert) {

                if (typeof ast.value === 'string') {

                    const newVal = parseInt(ast.value);

                    ast.value = newVal === 1 ? true : false;

                    return this.validate(ast);
                }

                throw new GraphQLError('TODO');

            }

            throw new GraphQLError('TODO');
        }

        return this.validate(ast);
    }

    truthy(...values) {

        values = Hoek.flatten(values);

        return this._test('boolean.truthy', (ast) => {

            if (typeof ast.value === 'boolean') {

                return ast.value === true;
            }

            if (values.length) {

                if (values.indexOf(ast.value) <= -1) {

                    return new GraphQLError(`value: "${ ast.value }" is not truthy`);
                }

                return ast.value;
            }
        });
    }

    falsy(...values) {

        values = Hoek.flatten(values);

        return this._test('boolean.falsy', (ast) => {

            if (typeof ast.value === 'boolean') {

                return ast.value === false;
            }

            if (values.length) {

                if (values.indexOf(ast.value) <= -1) {

                    return new GraphQLError(`value: "${ ast.value }" is not falsy`);
                }

                return ast.value;
            }
        });
    }

    indifferent() {

        return this._test('boolean.indifferent', (ast) => {

            return true;
        });
    }

    binary() {

        const obj = this._clone();
        obj._flags.isBinary = true;

        return obj;
    }
};

module.exports = function () {

    return new internals.BooleanScalar();
};
