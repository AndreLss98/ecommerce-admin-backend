const {
    GraphQLInt,
    GraphQLList,
    GraphQLFloat,
    GraphQLString,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLObjectType,
} = require('graphql');

const UserRepo = require('./../repositorys/user');
const CreditRepo = require('./../repositorys/credits');
const DownloadUrlRepo = require('./../repositorys/download_url');

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
            resolve({ ShopifyCustomerNumber }, _) {
                return CreditRepo.getAllByCustomerID(ShopifyCustomerNumber);
            }
        },
        LinksDownload: {
            type: new GraphQLList(DownloadUrls),
            resolve({ ShopifyCustomerNumber }, _) {
                return DownloadUrlRepo.getAllByUserId(ShopifyCustomerNumber);
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

const DownloadUrls = new GraphQLObjectType({
    name: "DownloadUrl",
    fields: () => ({
        ItemTitle: {
            type: GraphQLString
        },
        LinkGuid: {
            type: GraphQLString
        },
        CreditsUsed: {
            type: GraphQLString
        },
        Used: {
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
                    return UserRepo.getByEmail(args.CustomerEmail);
                }
            },
            credits: {
                type: new GraphQLList(CreditLog),
                args: {
                    start: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    end: {
                        type: GraphQLString
                    }
                },
                resolve(_, args) {
                    return CreditRepo.getAllInInteval(args.start, args.end);
                }
            }
        }
    })
});

module.exports = schema;