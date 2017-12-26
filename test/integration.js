'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect } = lab;
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

    it('boolean()', async () => {

        const query = '{ subject( arg: true ) { key3 } }';
        const querySchema = new GraphQLObjectType({
            name: 'Query',
            fields: {
                subject: {
                    type: internals.Subject,
                    args: {
                        arg: {
                            type: Lib.boolean()
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
        res.data.subject.key3.should.equal(true);
    });

    it('date()', async () => {

        const query = '{ subject( arg: "1-1-2018" ) { key4 } }';
        const querySchema = new GraphQLObjectType({
            name: 'Query',
            fields: {
                subject: {
                    type: internals.Subject,
                    args: {
                        arg: {
                            type: Lib.date()
                        }
                    },
                    resolve(_, { arg }) {

                        return internals.DB.date(arg);
                    }
                }
            }
        });
        const Schema = new GraphQLSchema({ query: querySchema });

        const res = await graphql( Schema, query );
        const { subject } = res.data;

        expect( subject.key4 ).to.be.an.instanceof(Date);
    });
});

internals.DB = {
    a: {
        key1: 'A'
    },
    2: {
        key2: 2
    },
    true: {
        key3: true
    },
    date: function (arg) {

        return {
            key4: arg
        };
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
        },
        key3: {
            type: Lib.boolean()
        },
        key4: {
            type: Lib.date()
        }
    }
});
