'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect } = lab;
assertions.should();

const Lib = require('../lib');

describe('Implementation', () => {

    it('should be immutable', () => {

        const { string } = Lib;

        const firstSchema = string();
        const secondSchema = firstSchema.min(4);

        firstSchema._tests.length.should.equal(0);
        secondSchema._tests.length.should.equal(1);
    });

    it('should be able to validate itself', () => {

        const { string } = Lib;
        const ast = { kind: 'StringValue', value: '123' };

        string().min(2).validate(ast).should.equal('123');
    });

    it('should be able to serialize itself', () => {

        const { string } = Lib;

        string().serialize('123').should.equal('123');
    });

    it('should be able to parse it\'s value', () => {

        const { string } = Lib;

        string().parseValue('123').should.equal('123');
    });

    describe('options()', () => {

        it('should support setting configuration options', () => {

            const { string } = Lib;

            const subject = string().options({ convert: false });
            subject._options.convert.should.equal(false);
        });

        it('should merge existing options with new', () => {

            const { string } = Lib;

            const subject = string();
            const initialOptionsKeys = Object.keys(subject._options);

            const modifiedSubject = subject.options({ insensitive: false });
            const modifiedOptionsKeys = Object.keys(modifiedSubject._options);

            initialOptionsKeys.should.deep.equal(modifiedOptionsKeys);
        });

        it('should throw when passed a bad config', () => {

            const { string } = Lib;
            const subject = () => {

                string().options({ badKey: 'should not be here' });
            };

            expect(subject).to.throw(Error, 'Invalid config options');
        });
    });

    describe('allow()', () => {

        it('supports a whitelist of values and by default is case insensitive', () => {

            const { string } = Lib;
            const ast = { kind: 'StringValue', value: 'STRING' };

            string().allow('string').parseLiteral(ast).should.equal('STRING');
        });
    });

    describe('disallow()', () => {

        it('should support a blacklist of values and be case insensitive and throw an Error', () => {

            const { string } = Lib;
            const ast = { kind: 'StringValue', value: 'A' };
            const subject = function () {

                string().disallow('a').parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value is not allowed');
        });

        it('supports a blacklist of values but ignores value if insensitive is disabled', () => {

            const { string } = Lib;
            const ast = { kind: 'StringValue', value: 'A' };

            string().options({ insensitive: false }).disallow('a').parseLiteral(ast).should.equal(ast.value);
        });
    });

    describe('empty()', () => {

        it('should return undefined for any value matching the provied schema', () => {

            const { string } = Lib;
            const ast = { kind: 'StringValue', value: 'test' };

           (string().empty('test').parseLiteral(ast) === undefined).should.equal(true);
        });

        it('should work in combination with default()', () => {

            const { string } = Lib;
            const ast = { kind: 'StringValue', value: 'test' };

            string().empty('test').default('me').parseLiteral(ast).should.equal('me');
        });
    });

    it('should support descriptions', () => {

        const { string } = Lib;

        string().describe('Thing that of which I am').description.should.equal('Thing that of which I am');
    });
});
