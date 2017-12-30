'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect } = lab;
assertions.should();

const Lib = require('../lib');
const internals = {};

describe('StringScalar', () => {

    it('should create a custom scalar type', () => {

        const { string } = Lib;
        const subject = () => {

            return string();
        };

        expect(subject).to.not.throw();
        string().name.should.equal('StringScalar');
    });

    it('should return null for non string values', () => {

        const { string } = Lib;
        const ast = { value: true, kind: 'BooleanValue' };
        const subject = () => {

            return string().parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'KindError: expected StringValue, but got BooleanValue');
    });

    it('should return null for empty strings', () => {

        const { string } = Lib;
        const value = '';
        const ast = internals.buildAST({ value });
        const subject = function () {

            return string().parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'string can not be empty');
    });

    it('should support default', () => {

        const { string } = Lib;

        string().default('default value').parseLiteral().should.equal('default value');
    });

    it('should not use default value if target is provided', () => {

        const { string } = Lib;
        const ast = { kind: 'StringValue', value: 'test' };

        string().default('me').parseLiteral(ast).should.equal('test');
    });

    describe('min()', () => {

        it('throws if passed invalid input', () => {

            const { string } = Lib;
            const subject = () => {

                return string().min(true);
            };

            expect(subject).to.throw(Error);
        });

        it('should support min string length', () => {

            const { string } = Lib;
            const value = '123';
            const ast = internals.buildAST({ value });

            string().min(2).parseLiteral(ast).should.equal(value);
        });

        it('should return null when lenght does not meet min', () => {

            const { string } = Lib;
            const value = '1';
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().min(2).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'string does not meet the minimum length specified');
        });
    });

    describe('max()', () => {

        it('throws if passed invalid input', () => {

            const { string } = Lib;
            const subject = () => {

                return string().max(true);
            };

            expect(subject).to.throw(Error);
        });

        it('should support max string length', () => {

            const { string } = Lib;
            const value = '1';
            const ast = internals.buildAST({ value });

            string().max(2).parseLiteral(ast).should.equal(value);
        });

        it('should return null when length exceeds max', () => {

            const { string } = Lib;
            const value = '123';
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().max(2).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'string exceeds maximum length allowed');
        });
    });

    it('should support min and max', () => {

        const { string } = Lib;
        const value = '1234';
        const ast = internals.buildAST({ value });

        string().min(2).max(5).parseLiteral(ast).should.equal('1234');
    });

    describe('guid()', () => {

        it('throws when passed a bad config', () => {

            const { string } = Lib;
            const subject = () => {

                return string().guid(true);
            };

            expect(subject).to.throw(Error, '"value" must be an array');
        });

        it('throws when uuid option is not valid', () => {

            const { string } = Lib;
            const subject = () => {

                return string().guid(['uuidv9']);
            };

            expect(subject).to.throw(Error, 'must be one of [uuidv1, uuidv2, uuidv3, uuidv4, uuidv5]');
        });

        it('throw when passed duplicate uuid versions', () => {

            const value = 'a09ececf-0514-4329-b7e7-acbd24ef53c8';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().guid(['uuidv4', 'uuidv4']).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'version 4, can not be a duplicate');
        });

        it('should validate and return a valid uuidv1 guid', () => {

            const value = 'd48d222c-eb48-11e7-8c3f-9a214cf093ae';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().guid(['uuidv1']).parseLiteral(ast).should.equal(value);
        });

        it('should validate and return a valid uuidv2 guid', () => {

            const value = '69593d62-71ea-2548-85e4-04fc71357423';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().guid(['uuidv2']).parseLiteral(ast).should.equal(value);
        });

        it('should validate and return a valid uuidv3 guid', () => {

            const value = '69593d62-71ea-3548-85e4-04fc71357423';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().guid(['uuidv3']).parseLiteral(ast).should.equal(value);
        });

        it('should validate and return a valid uuidv4 guid', () => {

            const value = 'df7cca36-3d7a-40f4-8f06-ae03cc22f045';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().guid(['uuidv4']).parseLiteral(ast).should.equal(value);
        });

        it('should validate and return a valid uuidv5 guid', () => {

            const value = 'fdda765f-fc57-5604-a269-52a7df8164ec';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().guid(['uuidv5']).parseLiteral(ast).should.equal(value);
        });

        it('validates and returns multiple valid versions (1,4,5)', () => {

            const value = 'a09ececf-0514-4329-b7e7-acbd24ef53c8';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().guid(['uuidv1', 'uuidv4', 'uuidv5']).parseLiteral(ast).should.equal(value);
        });

        it('validates and return a valid guid', () => {

            const value = 'fd65b094-321a-456c-bd9e-f251b96f72ec';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().guid().parseLiteral(ast).should.equal(value);
        });

        it('should return null when guid is invalid', () => {

            const value = '000-000';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().guid().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'string is not a valid guid');
        });
    });

    describe('hex()', () => {

        it('should validate and return valid hex codes', () => {

            const value = '#ffff';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().hex().parseLiteral(ast).should.equal(value);
        });

        it('should return null when string is not a valid hex', () => {

            const value = '#f0';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().hex().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'string is not a valid hex code');
        });
    });

    describe('email()', () => {

        it('should validate and return a valid email address', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().email().parseLiteral(ast).should.equal(value);
        });

        it('should throw when string is not a valid address', () => {

            const value = 'fodder untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value is not a valid email address');
        });

        it('should throw when email is passed a bad config', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ exact: true }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '"exact" is not allowed');
        });

        it('throws when tldWhitelist is not an object or array', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ tldWhitelist: true }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '"tldWhitelist" must be an array\n[2] "tldWhitelist" must be an object');
        });

        it('throws when minDomainAtoms is not a number', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ minDomainAtoms: true }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '"minDomainAtoms" must be a number');
        });

        it('throws when minDomainAtoms is not an integer', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ minDomainAtoms: 90.4 }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '"minDomainAtoms" must be an integer');
        });

        it('throws when minDomainAtoms is not a positive number', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ minDomainAtoms: -90.0 }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '"minDomainAtoms" must be a positive number');
        });

        it('throws when errorLevel is not an integer', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ errorLevel: -9.5 }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '"errorLevel" must be an integer');
        });

        it('throws when errorLevel is not a positive number', () => {

            const value = 'untitled@gmail.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ errorLevel: -9 }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '"errorLevel" must be a positive number');
        });

        it('validates and return a valid email with tldWhitelist as an array', () => {

            const value = 'untitled@gmail.io';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().email({ tldWhitelist: ['com', 'io'] }).parseLiteral(ast).should.equal(value);
        });

        it('validates and return a valid email with tldWhitelist as an object', () => {

            const value = 'untitled@gmail.io';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().email({ tldWhitelist: { com: true, io: true } }).parseLiteral(ast).should.equal(value);
        });

        it('enforces tldWhitelist and throws if tld is not included in list', () => {

            const value = 'untitled@gmail.nyc';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ tldWhitelist: ['com', 'io'] }).parseLiteral(ast).should.equal(value);
            };

            expect(subject).to.throw(Error, 'value is not a valid email address');
        });

        it('should enforce minDomainAtoms and throw if condition is not met', () => {

            const value = 'untitled@gmail.nyc';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ minDomainAtoms: 3 }).parseLiteral(ast).should.equal(value);
            };

            expect(subject).to.throw(Error, 'value is not a valid email address');
        });

        it('should enforce errorLevel as boolean', () => {

            const value = 'untitled@';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ errorLevel: true }).parseLiteral(ast).should.equal(value);
            };

            expect(subject).to.throw(Error, 'value is not a valid email address');
        });

        it('should enforce errorLevel as an integer', () => {

            const value = 'untitled@';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().email({ errorLevel: 2 }).parseLiteral(ast).should.equal(value);
            };

            expect(subject).to.throw(Error, 'value is not a valid email address');
        });
    });

    describe('uri()', () => {

        it('throws when passed a bad config', () => {

            const { string } = Lib;
            const subject = () => {

                return string().uri(true);
            };

            expect(subject).to.throw(Error, '"value" must be an object');
        });

        it('validates and returns a valid uri', () => {

            const value = 'http://lostinthesauce.nyc';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uri().parseLiteral(ast).should.equal(value);
        });

        it('thows when uri is not valid', () => {

            const value = 'ldap://2001:db8::7/c=GB?objectClass?one';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().uri().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be a valid uri');
        });

        it('validates and returns a valid uri using a single scheme', () => {

            const value = 'http://google.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uri({ scheme: 'http' }).parseLiteral(ast).should.equal(value);
        });

        it('throws when uri does not match provided scheme', () => {

            const value = 'ftp://google.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().uri({ scheme: 'http' }).parseLiteral(ast).should.equal(value);
            };

            expect(subject).to.throw(Error, 'must be a valid uri with a scheme matching the http pattern');
        });

        it('validates and returns a valid uri using a single regex scheme', () => {

            const value = 'https://abc.con';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uri({ scheme: /https?/ }).parseLiteral(ast).should.equal(value);
        });

        it('throws when uri does not match a regex scheme', () => {

            const value = 'ftp://abc.con';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().uri({ scheme: /https?/ }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'must be a valid uri with a scheme matching the https? pattern');
        });

        it('validates and returns a valid uri using multiple schemes', () => {

            const value = 'https://google.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uri({ scheme: [/https?/, 'ftp', 'file'] }).parseLiteral(ast).should.equal(value);
        });

        it('throws when passed an emtpy scheme array', () => {

            const value = 'https://google.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().uri({ scheme: [] }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'scheme must have at least 1 scheme specified');
        });

        it('throws when passed an emtpy scheme object', () => {

            const value = 'https://google.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().uri({ scheme: {} }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '\"scheme\" must be a string\n[2] \"scheme\" must be an array\n[3] \"scheme\" must be an instance of \"RegExp\"\u001b[0m');
        });

        it('throws if all schemes are not valid', () => {

            const value = 'https://google.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().uri({ scheme: [/https?/, '~!@#$%~'] }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, '~!@#$%~  must be a valid scheme');
        });

        it('validates and returns a valid relative uri', () => {

            const value = 'foo://example.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uri({ allowRelative: true }).parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid relative only uri', () => {

            const value = 'one/two/three?value=abc&value2=123#david-rules';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uri({ relativeOnly: true }).parseLiteral(ast).should.equal(value);
        });

        it('description', () => {

            const value = 'foo://example.com:8042/over/there?name=ferret#nose';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().uri({ relativeOnly: true }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be a valid relative uri');
        });
    });

    describe('lowercase()', () => {

        it('throws when string is not lowercased and convert is set to false', () => {

            const value = 'UPPERCASE';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().options({ convert: false }).lowercase().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must only contain lowercase characters');
        });

        it('validates and returns a valid lowercased string', () => {

            const value = 'all lowercase';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().lowercase().parseLiteral(ast).should.equal(value);
        });

        it('coerces string to lowercase before returning value', () => {

            const value = 'LOWERCASE ME';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().lowercase().parseLiteral(ast).should.equal('lowercase me');
        });
    });

    describe('uppercase()', () => {

        it('throws when string is not uppercased and convert is set to false', () => {

            const value = 'lowercase';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().options({ convert: false }).uppercase().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must only contain uppercase characters');
        });

        it('validates and returns a valid uppercased string', () => {

            const value = 'ALL UPPERCASE';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uppercase().parseLiteral(ast).should.equal(value);
        });

        it('coerces string to uppercase before returning value', () => {

            const value = 'uppercase me';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().uppercase().parseLiteral(ast).should.equal('UPPERCASE ME');
        });
    });

    describe('alphanum', () => {

        it('throws when passed an invalid alphanumeric string', () => {

            const value = 'dfje dsf_df45_343';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().alphanum().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must only contain alphanumeric characters');
        });

        it('validates and returns a valid alphanumeric string', () => {

            const value = 'adfjfsdf344fdf';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().alphanum().parseLiteral(ast).should.equal(value);
        });
    });

    describe('token', () => {

        it('throws when passed an invalid token string', () => {

            const value = 'dfje#@ dsf_df45_343';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().token().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must only contain alphanumeric and underscore characters');
        });

        it('validates and returns a valid alphanumeric string', () => {

            const value = 'adfjfsdf_34_4fdf';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().token().parseLiteral(ast).should.equal(value);
        });
    });

    describe('base64()', () => {

        it('throws when passed an invalid input', () => {

            const { string } = Lib;
            const subject = () => {

                return string().base64(true);
            };

            expect(subject).to.throw(Error, '"value" must be an object');
        });

        it('validates and returns a valid base64 string with no options', () => {

            const value = 'aGFwaWpzIGlzIGZ1Y2tpbmcgYXdlc29tZQ==';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().base64().parseLiteral(ast).should.equal(value);
        });

        it('throws when passed an invalid base64 string with no options', () => {

            const value = '==aGFwaWpzIGlzIGZ1Y2tpbmcgYXdlc29tZQ';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().base64().parseLiteral(ast).should.equal(value);
            };

            expect(subject).to.throw(Error, 'value must be a valid base64 string');
        });

        it('validates and returns a valid base64 string with padding explicitly required', () => {

            const value = 'YW55IGNhcm5hbCBwbGVhc3VyZS4=';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().base64({ paddingRequired: true }).parseLiteral(ast).should.equal(value);
        });

        it('throws when passsed an invalid base64 string  with padding explicitly required', () => {

            const value = '=YW55IGNhcm5hbCBwbGVhc3VyZS4';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().base64({ paddingRequired: true }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be a valid base64 string');

        });

        it('validates and returns a valid base64 string with padding not required', () => {

            const value = 'YW55IGNhcm5hbCBwbGVhc3VyZS4=';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().base64({ paddingRequired: false }).parseLiteral(ast).should.equal(value);
        });

        it('throws when passed an invalid base64 string with padding not required', () => {

            const value = 'YW55IGNhcm5hbCBwbGVhc3VyZS4==';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().base64({ paddingRequired: false }).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be a valid base64 string');
        });
    });

    describe('hostname()', () => {

        it('validates and returns a valid hostname', () => {

            const value = 'www.example.com';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().hostname().parseLiteral(ast).should.equal(value);
        });

        it('throws when passed an invalid hostname', () => {

            const value = 'host:name';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return string().hostname().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be a valid hostname');
        });
    });

    describe('creditcard()', () => {

        it('validates and returns a valid credit card ( american express )', () => {

            const value = '378734493671000';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( australian bank )', () => {

            const value = '5610591081018250';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( dankort pbs )', () => {

            const value = '5019717010103742';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( diners club )', () => {

            const value = '38520000023237';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( discover )', () => {

            const value = '6011000990139424';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( jbc )', () => {

            const value = '3566002020360505';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( mastercard )', () => {

            const value = '5105105105105100';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( switch/solo paymentech )', () => {

            const value = '6331101999990016';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card ( visa )', () => {

            const value = '4012888888881881';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('validates and returns a valid credit card', () => {

            const value = '378734493671000';
            const { string } = Lib;
            const ast = internals.buildAST({ value });

            string().creditCard().parseLiteral(ast).should.equal(value);
        });

        it('throws when string is not a valid credit card', () => {

            const value = '422222222';
            const { string } = Lib;
            const ast = internals.buildAST({ value });
            const subject = () => {

                string().creditCard().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be a valid credit card');
        });
    });
});

internals.buildAST = (args) => {

    const base = {
        value: null,
        kind: 'StringValue'
    };

    return Object.assign(base, args);
};
