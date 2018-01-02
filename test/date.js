'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect } = lab;
assertions.should();

const Lib = require('../lib');
const internals = {};

describe('DateScalar', () => {

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

    it('should validate date string', () => {

        const { date } = Lib;
        const value = '1-2-2018';
        const ast = internals.buildAST({ value });

        date().parseLiteral(ast).should.deep.equal(new Date(value));
    });

    it('should validate milisecond date', () => {

        const { date } = Lib;
        const now = new Date();
        const value = now.getTime();
        const ast = internals.buildAST({ kind: 'IntValue', value });

        date().parseLiteral(ast).should.deep.equal(now);
    });

    it('should validate milisecond date as string', () => {

        const { date } = Lib;
        const now = new Date();
        const value = now.getTime();
        const ast = internals.buildAST({ value: value.toString() });

        date().parseLiteral(ast).should.deep.equal(now);
    });

    it('should throw when milisecond date is wrong', () => {

        const { date } = Lib;
        const value = '343904832904832094832048';
        const ast = internals.buildAST({ value });
        const subject = () => {

            return date().parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'Invalid Date');
    });

    it('should throw when given an invalid date', () => {

        const { date } = Lib;
        const value = 'dfkjcxmreuf';
        const ast = internals.buildAST({ value });
        const subject = () => {

            date().parseLiteral(ast).should.equal(value);
        };

        expect(subject).to.throw(Error, 'Invalid Date');
    });

    it('should throw for NaN', () => {

        const { date } = Lib;
        const value = NaN;
        const ast = internals.buildAST({ value });
        const subject = () => {

            date().parseLiteral(ast).should.equal(value);
        };

        expect(subject).to.throw(Error, 'Invalid Date');
    });

    describe('before()', () => {

        it('throws when input is not a string', () => {

            const { date } = Lib;
            const subject = () => {

                return date().before(true);
            };

            expect(subject).to.throw(Error);
        });

        it('throws when input is not an integer', () => {

            const { date } = Lib;
            const subject = () => {

                return date().before(34.344);
            };

            expect(subject).to.throw(Error);
        });

        it('should validate dates that are before a specific date', () => {

            const { date } = Lib;
            const past = new Date('1-1-2018') - 100000;
            const ast = internals.buildAST({ value: past });

            date().before('1-1-2018').parseLiteral(ast).should.deep.equal(new Date(past));
        });

        it('should throw if date is note before the date specified', () => {

            const { date } = Lib;
            const future = Date.now() + 100000;
            const ast = internals.buildAST({ value: future });
            const subject = () => {

                date().before(Date.now()).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'Date must be before');
        });
    });

    describe('after()', () => {

        it('throws when input is not a string', () => {

            const { date } = Lib;
            const subject = () => {

                return date().after(true);
            };

            expect(subject).to.throw(Error);
        });

        it('throws when input is not an integer', () => {

            const { date } = Lib;
            const subject = () => {

                return date().after(34.344);
            };

            expect(subject).to.throw(Error);
        });

        it('should validate dates that are after a specific date', () => {

            const { date } = Lib;
            const future = Date.now() + 1000000;
            const ast = internals.buildAST({ value: future });

            date().after(Date.now()).parseLiteral(ast).should.deep.equal(new Date(future));
        });

        it('should throw if date is not after the date specified', () => {

            const { date } = Lib;
            const past = Date.now() - 100000;
            const ast = internals.buildAST({ value: past });
            const subject = () => {

                return date().after(Date.now()).parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'Date must be after');
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
