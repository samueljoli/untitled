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

    this._allowed = [];

    Base.call(this, internals.defaults);
};

internals.guidRegex = (guid) => {

    const regex = new RegExp(
        `^([\\[{\\(]?)[0-9A-F]{8}([:-]?)[0-9A-F]{4}\\2?[0-9A-F][0-9A-F]{3}\\2?[0-9A-F][0-9A-F]{3}\\2?[0-9A-F]{12}([\\]}\\)]?)$`,
        'i'
    );

    return regex.exec(guid);
};

Hoek.inherits(internals.StringScalar, Base);

Hoek.merge(internals.StringScalar.prototype, {

    parseLiteral(ast) {

        if (this._defaultValue && !ast) {
            return this._defaultValue;
        }

        if (ast.kind !== Kind.STRING) {
            return null;
        }

        // Empty string
        if ((!ast.value.length && !(this._allowed.indexOf(ast.value) > -1))) {
            return null;
        }

        return this.validate(ast);
    },

    min(value) {

        return this._test('min', (ast) => {

            const { length } = ast.value;

            return length >= value ? ast.value : null;
        });
    },

    max(value) {

        return this._test('max', (ast) => {

            const { length } = ast.value;

            return length <= value ? ast.value : null;
        });
    },

    guid(value) {

        return this._test('guid', (ast) => {

            const guid = ast.value;

            return internals.guidRegex(guid) ? ast.value : null;
        });
    }
});

module.exports = function () {

    return new internals.StringScalar();
};
