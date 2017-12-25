'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect } = lab;
assertions.should();

const Lib = require('../lib');
const internals = {};

describe.only('DateScalar', () => {

    it('should create a custom scalar', () => {

        const { date } = Lib;
        const subject = () => {

            return date();
        };

        expect(subject).to.not.throw();
        date().name.should.equal('DateScalar');
    });

    it('should return null for non date values', () => {

        const { date } = Lib;
        const ast = { value: true, kind: 'BooleanValue' };
        const subject = () => {

            return date().parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'KindError: expected DateValue, but got BooleanValue');
    });

    describe('before()', () => {

        it('should validate dates that are before a specific date', () => {

            const { date } = Lib;
            const past = Date.now() - 100000;
            const ast = internals.buildAST({ value: past });

            date().before('1-1-2018').parseLiteral(ast).should.equal(past);
        });

        it('should throw if date is note before the date specified', () => {

            const { date } = Lib;
            const future = Date.now() + 100000;
            const ast = internals.buildAST({ value: future });
            const subject = () => {

                date().before(Date.now()).parseLiteral(ast)
            };

            expect(subject).to.throw(Error);
        });
    });

    describe('after()', () => {

        it('should validate dates that are after a specific date', () => {

            const { date } = Lib;
            const future = Date.now() + 1000000;
            const ast = internals.buildAST({ value: future });

            date().after(Date.now()).parseLiteral(ast).should.equal(future);
        });

        it('should throw if date is not after the date specified', () => {

            const { date } = Lib;
            const past = Date.now() - 100000;
            const ast = internals.buildAST({ value: past });
            const subject = () => {

                return date().after(Date.now()).parseLiteral(ast);
            };

            expect(subject).to.throw(Error);
        });
    });
});

internals.buildAST = (args) => {

    const base = {
        kind: 'StringValue',
        value: null
    };

    return Object.assign(base, args);
};
