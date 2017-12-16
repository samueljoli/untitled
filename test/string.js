'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const Lib = require('../lib');
const internals = {};

describe('StringScalar', () => {

    it('should create a custom scalar type', () => {

        const { string } = Lib;

        string.bind(null).should.not.throw();
        string().name.should.equal('StringScalar');
    });

    it('should return null for non string values', () => {

        const { string } = Lib;
        const ast = { value: true, kind: 'BooleanValue' };

        (string().parseLiteral(ast) === null).should.equal(true);
    });

    it('should return null for empty strings', () => {

        const { string } = Lib;
        const value = '';
        const ast = internals.buildAST({ value });
        ast.test = true;

        (string().parseLiteral(ast) === null).should.equal(true);
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

            (string().min(2).parseLiteral(ast) === null).should.equal(true);
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

            (string().max(2).parseLiteral(ast) === null).should.equal(true);
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

            (string().guid().parseLiteral(ast) === null).should.equal(true);
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
