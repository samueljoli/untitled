'use strict';

const Base = require('../base');
const Hoek = require('hoek');
const Joi = require('joi');
const { Kind, GraphQLError } = require('graphql');
const Isemail = require('isemail');
const Uri = require('./uri');

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

internals.uriRegex = Uri.createUriRegex();

internals.guidRegex = (guid, versions) => { //TODO: Matching bracket logic

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

internals.inputSchema = Joi.alternatives().try(Joi.string(), Joi.number());

internals.guidConfigSchema = Joi.array().items(Joi.string().lowercase().valid(['uuidv1', 'uuidv2', 'uuidv3', 'uuidv4', 'uuidv5']));

internals.uriConfigSchema = Joi.object().keys({
    scheme: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object().type(RegExp)),
    allowRelative: Joi.boolean(),
    relativeOnly: Joi.boolean()
}).options({ presence: 'optional' });

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

        value = Joi.attempt(value, internals.inputSchema);

        return this._test('string.min', (ast) => {

            const { length } = ast.value;

            return length >= value ? ast.value : null;
        });
    },

    max(value) {

        value = Joi.attempt(value, internals.inputSchema);

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
    },

    uri(opts) {

        opts = Joi.attempt(opts, internals.uriConfigSchema);

        let customScheme = '';
        let allowRelative = false;
        let relativeOnly = false;
        let regex = internals.uriRegex;

        if (opts) {

            if (opts.scheme) {

                if (!Array.isArray(opts.scheme)) {

                    opts.scheme = [opts.scheme];
                }

                Hoek.assert(opts.scheme.length >= 1, 'scheme must have at least 1 scheme specified');

                for (const scheme of opts.scheme) {

                    Hoek.assert(scheme instanceof RegExp || typeof scheme === 'string', `${scheme} must be a RegExp or String`);

                    // Add OR separators if a value already exists
                    customScheme = customScheme + (customScheme ? '|' : '');

                    // If someone wants to match HTTP or HTTPS for example then we need to support both RegExp and String so we don't escape their pattern unknowingly
                    if (scheme instanceof RegExp) {

                        customScheme = customScheme + scheme.source;
                    }
                    else {

                        Hoek.assert(/[a-zA-Z][a-zA-Z0-9+-\.]*/.test(scheme), `${scheme}  must be a valid scheme`);
                        customScheme = customScheme + Hoek.escapeRegex(scheme);
                    }
                }
            }

            if (opts.allowRelative) {
                allowRelative = true;
            }

            if (opts.relativeOnly) {
                relativeOnly = true;
            }
        }

        if (customScheme || allowRelative || relativeOnly) {

            regex = Uri.createUriRegex(customScheme, allowRelative, relativeOnly);
        }

        return this._test('string.uri', (ast) => {

            if (regex.test(ast.value)) {

                return ast.value;
            }

            if (relativeOnly) {
                return new GraphQLError('value must be a valid relative uri');
            }

            if (customScheme) {
                return new GraphQLError(`value must be a valid uri with a scheme matching the ${customScheme} pattern`);
            }
        });
    }
});

module.exports = function () {

    return new internals.StringScalar();
};
