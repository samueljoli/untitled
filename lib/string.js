'use strict';

const Base = require('./base');
const Hoek = require('hoek');
const Joi = require('joi');
const { Kind, GraphQLError } = require('graphql');
const Isemail = require('isemail');

// Declare internals

const internals = {};

internals.defaults = {
    name: 'StringScalar',
    serialize: Function,
    parseLiteral: Function,
    parseValue: Function
};

internals.StringScalar = function StringScalar() {

    if (StringScalar._instance) { // Enforce singleton

        StringScalar._instance._allowed = [];
        StringScalar._instance._disallowed = [];
        StringScalar._instance._defaultValue = null;

        return StringScalar._instance;
    }

    this._allowed = [];
    this._disallowed = [];
    this._defaultValue = null;

    StringScalar._instance = this;

    Base.call(this, internals.defaults);
};

internals.guidRegex = (guid, versions) => {

    versions = versions || [];

    const guidVersions = {
        uuidv1: '1',
        uuidv2: '2',
        uuidv3: '3',
        uuidv4: '4',
        uuidv5: '5'
    };

    let versionNumbers = '';


    if (versions.length) {

        const versionSet = new Set();

        for (const version of versions) {

            const versionNumber = guidVersions[version];

            Hoek.assert(!(versionSet.has(versionNumber)), `version ${versionNumber}, can not be a duplicate`);

            versionNumbers += versionNumber;
            versionSet.add(versionNumber);
        }
    }


    const regex = new RegExp(`^([\\[{\\(]?)[0-9A-F]{8}([:-]?)[0-9A-F]{4}\\2?[${versionNumbers || '0-9A-F'}][0-9A-F]{3}\\2?[${versionNumbers ? '89AB' : '0-9A-F'}][0-9A-F]{3}\\2?[0-9A-F]{12}([\\]}\\)]?)$`, 'i');

    return regex.exec(guid);
};

internals.hexRegex = (hex) => {

    const regex = new RegExp(/^#[0-9a-f]{3,6}$/i);

    return regex.exec(hex);
};

internals.emailConfigSchema = Joi.object().keys({
    errorLevel    : Joi.alternatives().try(Joi.number().integer().positive(), Joi.boolean()),
    tldWhitelist  : Joi.alternatives().try(Joi.array(), Joi.object()),
    minDomainAtoms: Joi.number().integer().positive()
}).options({ presence: 'optional' });

internals.guidConfigSchema = Joi.array().items(Joi.string().lowercase().valid(['uuidv1', 'uuidv2', 'uuidv3', 'uuidv4', 'uuidv5']));

Hoek.inherits(internals.StringScalar, Base);

Hoek.merge(internals.StringScalar.prototype, {

    parseLiteral(ast) {

        if ((this._defaultValue && !ast)) {

            return this._defaultValue;
        }

        if (ast.kind !== Kind.STRING) {

            const msg = `KindError: expected ${Kind.STRING}, but got ${ast.kind}`;

            throw new GraphQLError(msg);
        }

        // Empty string
        if ((!ast.value.length && !(this._allowed.indexOf(ast.value) > -1))) {

            throw new GraphQLError(this.createError('string.emptyString'));
        }

        if (this._disallowed.indexOf(ast.value) > -1) {

            throw new GraphQLError(this.createError('string.disallow'));
        }

        return this.validate(ast);
    },

    min(value) {

        return this._test('string.min', (ast) => {

            const { length } = ast.value;

            return length >= value ? ast.value : null;
        });
    },

    max(value) {

        return this._test('string.max', (ast) => {

            const { length } = ast.value;

            return length <= value ? ast.value : null;
        });
    },

    guid(versions) {

        versions = Joi.attempt(versions, internals.guidConfigSchema);

        return this._test('string.guid', (ast) => {

            const guid = ast.value;

            return internals.guidRegex(guid, versions) ? ast.value : null;
        });
    },

    hex() {

        return this._test('string.hex', (ast) => {

            const hex = ast.value;

            return internals.hexRegex(hex) ? ast.value : null;
        });
    },

    email(opts) {

        opts = Joi.attempt(opts, internals.emailConfigSchema);

        return this._test('string.email', (ast) => {

            try {

                const email = ast.value;
                const result = Isemail.validate(email, opts);

                if (result === true || result === 0) {
                    return email;
                }
            }
            catch (e) { }

            return null;
        });
    }
});

module.exports = function () {

    return new internals.StringScalar();
};
