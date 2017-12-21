'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect } = lab;
assertions.should();

const Lib = require('../lib');
const internals = {};

describe('BooleanScalar', () => {

    it('should create a custom scalar type', () => {

        const { boolean } = Lib;
        const subject = () => {

            return boolean();
        };

        expect(subject).to.not.throw();
        boolean().name.should.equal('BooleanScalar');
    });

    it('should throw an error when value is not a boolean type', () => {

        const { boolean } = Lib;
        const ast = { kind: 'StringValue', value: 'true' };
        const subject = () => {

            return boolean().parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'KindError: expected BooleanValue, but got StringValue');
    });

    it('should support default value setting', () => {

        const { boolean } = Lib;

        boolean().default(true).parseLiteral().should.equal(true);
    });

    it('should not use default if valid value was provided', () => {

        const { boolean } = Lib;
        const value = true;
        const ast = internals.buildAST({ value });

        boolean().default(false).parseLiteral(ast).should.equal(true);
    });

    describe('truthy()', () => {

        it('should support truthy values', () => {

            const { boolean } = Lib;
            const value = true;
            const ast = internals.buildAST({ value });

            boolean().truthy().parseLiteral(ast).should.equal(true);
        });

        it('should throw when value is not truthy and a boolean type', () => {

            const { boolean } = Lib;
            const value = false;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return boolean().truthy().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be truthy');
        });
    });

    describe('falsy()', () => {

        it('should support falsy values', () => {

            const { boolean } = Lib;
            const value = false;
            const ast = internals.buildAST({ value });

            boolean().falsy().parseLiteral(ast).should.equal(value);
        });

        it('should throw an error when value is falsy and not a boolean type', () => {

            const { boolean } = Lib;
            const value = true;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return boolean().falsy().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be falsy');
        });
    });

    describe('indifferent()', () => {

        it('should support truthy or falsy values', () => {

            const { boolean } = Lib;
            const ast1 = internals.buildAST({ value: true });
            const ast2 = internals.buildAST({ value: false });

            boolean().indifferent().parseLiteral(ast1).should.equal(true);
            boolean().indifferent().parseLiteral(ast2).should.equal(false);
        });
    });

    describe('binary()', () => {

        it('should return true when given 1', () => {

            const { boolean } = Lib;
            const ast = { kind: 'IntValue', value: 1 };

            boolean().binary().parseLiteral(ast).should.equal(true);
        });

        it('should return false when given 0', () => {

            const { boolean } = Lib;
            const ast = { kind: 'IntValue', value: 0 };

            boolean().binary().parseLiteral(ast).should.equal(false);
        });

        it('should throw an error when not given a number value and convert is not true', () => {

            const { boolean } = Lib;
            const ast = { kind: 'StringValue', value: '1' };
            const subject = () => {

                return boolean().binary().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'TODO');
        });

        it('should support binary with string values', () => {

            const { boolean } = Lib;
            const ast1 = { kind: 'StringValue', value: '1' };
            const ast2 = { kind: 'StringValue', value: '0' };

            boolean().binary().convert().parseLiteral(ast1).should.equal(true);
            boolean().binary().convert().parseLiteral(ast2).should.equal(false);
        });

        it('should throw when using binary with convert set to true and val is NaN', () => {

            const { boolean } = Lib;
            const ast = { kind: 'ListValue', value: [] };
            const subject = () => {

                return boolean().binary().convert().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'TODO');
        });
    });
});

internals.buildAST = (args) => {

    const base = {
        value: null,
        kind: 'BooleanValue'
    };

    return Object.assign(base, args);
};
