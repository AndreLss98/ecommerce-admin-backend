const {
    GraphQLInt,
    GraphQLList,
    GraphQLFloat,
    GraphQLString,
    GraphQLSchema,
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLObjectType
} = require('graphql');

const Users = require('./../repositorys/user');
const Credits = require('./../repositorys/credits');

const User = new GraphQLObjectType({
    name: "Usuario",
    fields: () => ({
        CustomerID: {
            type: GraphQLInt
        },
        ShopifyCustomerNumber: {
            type: GraphQLInt
        },
        CustomerName: {
            type: GraphQLString
        },
        CustomerEmail: {
            type: GraphQLString
        },
        Credits: {
            type: GraphQLInt
        },
        CreditosUsados: {
            type: new GraphQLList(CreditLog),
            resolve({ShopifyCustomerNumber}, _) {
                return Credits.getAllByCustomerID(ShopifyCustomerNumber);
            }

        }
    })
});

const CreditLog = new GraphQLObjectType({
    name: "CreditLog",
    fields: () => ({
        ItemTitle: {
            type: GraphQLString
        },
        CreditsUsed: {
            type: GraphQLInt
        },
        UsageDate: {
            type: GraphQLString
        },
        CreditsUsed: {
            type: GraphQLInt
        }
    })
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "RootQueryType",
        fields: {
            user: {
                type: User,
                args: {
                    CustomerEmail: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve(_, args) {
                    return Users.getByEmail(args.CustomerEmail);
                }
            }
        }
    })
});

module.exports = schema;