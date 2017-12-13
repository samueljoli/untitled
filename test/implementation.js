'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
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

    it('should support descriptions', () => {

        const { string } = Lib;

        string().describe('Thing that of which I am').description.should.equal('Thing that of which I am');
    });
});
