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
});

internals.buildAST = (args) => {

    const base = {
        value: null,
        kind: 'StringValue'
    };

    return Object.assign(base, args);
};
