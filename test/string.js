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

        it('should support guid', () => {

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

        it('should support hex', () => {

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
});

internals.buildAST = (args) => {

    const base = {
        value: null,
        kind: 'StringValue'
    };

    return Object.assign(base, args);
};
