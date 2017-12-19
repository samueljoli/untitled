'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab;
assertions.should();

const Lib = require('../lib');
const {
    graphql,
    GraphQLObjectType,
    GraphQLSchema
} = require('graphql');

const internals = {};

describe('Integration', () => {

    it('string()', async () => {

        const query = '{ subject( arg: "a") { key1 } }';
        const querySchema = new GraphQLObjectType({
            name: 'Query',
            fields: {
                subject: {
                    type: internals.Subject,
                    args: {
                        arg: {
                            type: Lib.string()
                        }
                    },
                    resolve(_, { arg }) {

                        return internals.DB[ arg ];
                    }
                }
            }
        });
        const Schema = new GraphQLSchema({ query: querySchema });

        const res = await graphql( Schema, query );
        res.data.subject.key1.should.equal('A');
    });

    it('number()', async () => {

        const query = '{ subject( arg: 2 ) { key2 } }';
        const querySchema = new GraphQLObjectType({
            name: 'Query',
            fields: {
                subject: {
                    type: internals.Subject,
                    args: {
                        arg: {
                            type: Lib.number()
                        }
                    },
                    resolve(_, { arg }) {

                        return internals.DB[ arg ];
                    }
                }
            }
        });
        const Schema = new GraphQLSchema({ query: querySchema });

        const res = await graphql( Schema, query );
        res.data.subject.key2.should.equal(2);
    });
});

internals.DB = {
    a: {
        key1: 'A'
    },
    2: {
        key2: 2
    }
};

internals.Subject = new GraphQLObjectType({
    name: 'Subject',
    fields: {
        key1: {
            type: Lib.string()
        },
        key2: {
            type: Lib.number()
        }
    }
});
