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

    it('converts boolean string ( true ) to a boolean', () => {

        const { boolean } = Lib;
        const ast = { kind: 'StringValue', value: 'true' };

        boolean().parseLiteral(ast).should.equal(ast.value);
    });

    it('converts boolean string ( TRUE ) to a boolean', () => {

        const { boolean } = Lib;
        const ast = { kind: 'StringValue', value: 'TRUE' };

        boolean().parseLiteral(ast).should.equal(ast.value);
    });

    it('converts boolean string ( false ) to a boolean', () => {

        const { boolean } = Lib;
        const ast = { kind: 'StringValue', value: 'false' };

        boolean().parseLiteral(ast).should.equal(ast.value);
    });

    it('converts boolean string ( FALSE ) to a boolean', () => {

        const { boolean } = Lib;
        const ast = { kind: 'StringValue', value: 'FALSE' };

        boolean().parseLiteral(ast).should.equal(ast.value);
    });

    it('throws when attempting to convert boolean string to a boolean and insensitive disabled', () => {

        const { boolean } = Lib;
        const ast = { kind: 'StringValue', value: 'TRUE' };
        const subject = () => {

            boolean().options({ insensitive: false }).parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'value must be a boolean');
    });

    it('throws an error when value is not a boolean type', () => {

        const { boolean } = Lib;
        const ast = { kind: 'FloatValue', value: 90.9 };
        const subject = () => {

            return boolean().parseLiteral(ast);
        };

        expect(subject).to.throw(Error, 'KindError: expected BooleanValue, but got FloatValue');
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

        it('should accept a single value to be used as whitelist of truthy values', () => {

            const { boolean } = Lib;
            const value = 'yes';
            const ast = { kind: 'StringValue', value };

            boolean().truthy('yes').parseLiteral(ast).should.equal(value);
        });

        it('should accept a single value to be used as a whitelist of truthy values and be case insensitve', () => {

            const { boolean } = Lib;
            const value = 'Yes';
            const ast = { kind: 'StringValue', value };

            boolean().truthy('yes').parseLiteral(ast).should.equal('yes');
        });

        it('throws when passed a single value whitelist and insensitve is disabled', () => {

            const { boolean } = Lib;

            expect(() => {

                const ast = { kind: 'StringValue', value: 'Yes' };

                boolean().truthy('yes').options({ insensitive: false }).parseLiteral(ast);

            }).to.throw(Error, 'value must be a boolean');
        });

        it('should accept an array of values to be used as a whitelist of truthy values', () => {

            const { boolean } = Lib;
            const whitelist = ['oui', 'si', 'yes'];

            boolean().truthy(whitelist).parseLiteral({ kind: 'StringValue', value: 'oui' }).should.equal('oui');
            boolean().truthy(whitelist).parseLiteral({ kind: 'StringValue', value: 'si' }).should.equal('si');
            boolean().truthy(whitelist).parseLiteral({ kind: 'StringValue', value: 'yes' }).should.equal('yes');
        });

        it('should accept an array of values to be used as a whitelist of truthy values and be case insensitive', () => {

            const { boolean } = Lib;
            const value = 'Oui';
            const ast = { kind: 'StringValue', value };

            boolean().truthy(['oui']).parseLiteral(ast).should.equal('oui');
        });

        it('throws when passed a whitelist array and insensitve is disabled', () => {

            const { boolean } = Lib;

            expect(() => {

                const ast = { kind: 'StringValue', value: 'Oui' };

                boolean().truthy(['oui']).options({ insensitive: false }).parseLiteral(ast);

            }).to.throw(Error, 'value must be a boolean');
        });

        it('throws when passed whitelist and provided value is not included', () => {

            const { boolean } = Lib;
            const value = 'yes';
            const ast = { kind: 'StringValue', value };

            expect(() => {

                boolean().truthy('oui').parseLiteral(ast);

            }).to.throw(Error, 'value: "yes" is not truthy');

        });

        it('validates and returns a boolean value', () => {

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

        it('throws when value is not boolean type and whitelist is not provided', () => {

            const { boolean } = Lib;
            const value = 'ok';
            const ast = internals.buildAST({ value });
            const subject = () => {

                return boolean().truthy().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'value must be truthy');
        });
    });

    describe('falsy()', () => {

        it('should accept a single value to be used as whitelist of falsy values', () => {

            const { boolean } = Lib;
            const value = 'no';
            const ast = { kind: 'StringValue', value };

            boolean().falsy('no').parseLiteral(ast).should.equal(value);
        });

        it('should accept a single value to be used as a whitelist of falsy values and be case insensitive', () => {

            const { boolean } = Lib;
            const value = 'No';
            const ast = { kind: 'StringValue', value };

            boolean().falsy('no').parseLiteral(ast).should.equal('no');
        });

        it('throws when passed a single value whitelist and insensitive is disabled', () => {

            const { boolean } = Lib;

            expect(() => {

                const ast = { kind: 'StringValue', value: 'No' };

                boolean().falsy('no').options({ insensitive: false }).parseLiteral(ast);

            }).to.throw(Error, 'value must be a boolean');
        });

        it('should accept an array of values to be used asa whitelist of falsy values', () => {

            const { boolean } = Lib;
            const kind = 'StringValue';
            const whitelist = ['no', 'nope', 'nah'];

            boolean().falsy(whitelist).parseLiteral({ kind, value: 'no' }).should.equal('no');
            boolean().falsy(whitelist).parseLiteral({ kind, value: 'nah' }).should.equal('nah');
            boolean().falsy(whitelist).parseLiteral({ kind, value: 'nope' }).should.equal('nope');
        });

        it('should accept an array of values to be used asa whitelist of falsy values and be case insensitive', () => {

            const { boolean } = Lib;
            const value = 'No';
            const ast = { kind: 'StringValue', value };

            boolean().falsy(['no']).parseLiteral(ast).should.equal('no');
        });

        it('throws when passed a whitelist array and insensitive is disabled', () => {

            const { boolean } = Lib;

            expect(() => {

                const ast = { kind: 'StringValue', value: 'No' };

                boolean().falsy(['no']).options({ insensitive: false }).parseLiteral(ast);

            }).to.throw(Error, 'value must be a boolean');
        });

        it('throws when passed a whitelist and provided value is not included', () => {

            const { boolean } = Lib;
            const value = 'no';
            const ast = { kind: 'StringValue', value };

            expect(() => {

                boolean().falsy(['nope']).parseLiteral(ast);
            }).to.throw(Error, 'value: "no" is not falsy');
        });

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

        it('should throw an error when value is falsy and not a boolean type', () => {

            const { boolean } = Lib;
            const value = 'naw';
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

                return boolean().options({ convert: false }).binary().parseLiteral(ast);
            };

            expect(subject).to.throw(Error, 'TODO');
        });

        it('should support binary with string values', () => {

            const { boolean } = Lib;
            const ast1 = { kind: 'StringValue', value: '1' };
            const ast2 = { kind: 'StringValue', value: '0' };

            boolean().binary().parseLiteral(ast1).should.equal(true);
            boolean().binary().parseLiteral(ast2).should.equal(false);
        });

        it('should throw when using binary with convert set to true and val is NaN', () => {

            const { boolean } = Lib;
            const ast = { kind: 'ListValue', value: [] };
            const subject = () => {

                return boolean().binary().parseLiteral(ast);
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
