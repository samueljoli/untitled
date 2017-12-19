'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect } = lab;
assertions.should();

const Lib = require('../lib');
const internals = {};

describe('NumberScalar', () => {

    it('should create a custom scalar type', () => {

        const { number } = Lib;
        const subject = () => {

            return number();
        };

        expect(subject).to.not.throw();
        number().name.should.equal('NumberScalar');
    });

    it('should return null for non number values', () => {

        const { number } = Lib;
        const ast = { value: true, kind: 'BooleanValue' };
        const subject = () => {

            return number().parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'KindError: expected IntValue but got BooleanValue');
    });

    it('should support default', () => {

        const { number } = Lib;

        number().default('default value').parseLiteral().should.equal('default value');
    });

    it('should not use default value if target is provided', () => {

        const { number } = Lib;
        const ast = { kind: 'IntValue', value: 'test' };

        number().default('me').parseLiteral(ast).should.equal('test');
    });

    describe('min()', () => {

        it('should support min value', () => {

            const { number } = Lib;
            const value = 2;
            const ast = internals.buildAST({ value });

            number().min(1).parseLiteral(ast).should.equal(value);
        });

        it('should return null when value does not meet min rule', () => {

            const { number } = Lib;
            const value = 1;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return number().min(2).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'ValidationError: Value does not meet min');
        });
    });

    describe('max()', () => {

        it('should support max value', () => {

            const { number } = Lib;
            const value = 2;
            const ast = internals.buildAST({ value });

            number().max(3).parseLiteral(ast).should.equal(value);
        });

        it('should return null when value exceeds max rule', () => {

            const { number } = Lib;
            const value = 3;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return number().max(2).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'ValidationError: Value exceeds max');
        });
    });

    it('should support both min and max rules', () => {

        const { number } = Lib;
        const value = 4;
        const ast = internals.buildAST({ value });

        number().min(2).max(5).parseLiteral(ast).should.equal(value);
    });

    describe('positive()', () => {

        it('should support positive numbers', () => {

            const { number } = Lib;
            const value = 2;
            const ast = internals.buildAST({ value });

            number().positive().parseLiteral(ast).should.equal(value);
        });

        it('should return null when number is not positive', () => {

            const { number } = Lib;
            const value = -4;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return number().positive().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'Value must be a positive int');
        });
    });

    describe('negative()', () => {

        it('should support negative numbers', () => {

            const { number } = Lib;
            const value = -4;
            const ast = internals.buildAST({ value });

            number().negative().parseLiteral(ast).should.equal(value);
        });

        it('should support negative numbers', () => {

            const { number } = Lib;
            const value = 2;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return number().negative().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'Value must be a negative int');
        });
    });

    describe('multiple()', () => {

        it('should support multiple', () => {

            const { number } = Lib;
            const value = 8;
            const ast = internals.buildAST({ value });

            number().multiple(4).parseLiteral(ast).should.equal(value);
        });

        it('should return null if value is not a multiple of base', () => {

            const { number } = Lib;
            const value = 2;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return number().multiple(5).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'ValidationError: Value is not a multiple');
        });
    });

    describe('range()', () => {

        it('should support range', () => {

            const { number } = Lib;
            const value = 4;
            const ast = internals.buildAST({ value });

            number().range(2, 4).parseLiteral(ast).should.equal(value);
        });

        it('should return null when value does not fall within provided range', () => {

            const { number } = Lib;
            const ast1 = internals.buildAST({ value: 4 });
            const ast2 = internals.buildAST({ value: 0 });
            const subject1 = () => {

                return number().range(1, 3).parseLiteral(ast1);
            };
            const subject2 = () => {

                return number().range(1, 3).parseLiteral(ast2);
            };

            expect(subject1).to.throw(Error, 'ValidationError: Value must fall within a specific range');
            expect(subject2).to.throw(Error, 'ValidationError: Value must fall within a specific range');
        });
    });

    describe('integer()', () => {

        it('should support integer', () => {

            const { number } = Lib;
            const value = 2;
            const ast = internals.buildAST({ value });

            number().integer().parseLiteral(ast).should.equal(value);
        });

        it('should return null when value is a float', () => {

            const { number } = Lib;
            const value = 4.35;
            const ast = internals.buildAST({ value });
            const subject = () => {

                return number().integer().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'ValidationError: Value must be an integer');
        });
    });
});

internals.buildAST = (args) => {

    const base = {
        value: null,
        kind: 'IntValue'
    };

    return Object.assign(base, args);
};
