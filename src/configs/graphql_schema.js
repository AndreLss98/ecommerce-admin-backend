const {
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLFloat,
    GraphQLString,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLObjectType
} = require('graphql');

const UserRepo = require('./../repositorys/user');
const CreditRepo = require('./../repositorys/credits');
const ProductRepo = require('./../repositorys/products');
const DownloadUrlRepo = require('./../repositorys/download_url');

async function paginator(mainQuery, getTotalItemsQuery, pageNumber, pageSize) {
    const totalItems = await getTotalItemsQuery();
    const data = await mainQuery(pageNumber, pageSize);
    return {
        data,
        totalItems,
        nextPage: pageNumber < totalItems / pageSize? pageNumber + 1 : null,
        previousPage: pageNumber > 1? pageNumber - 1 : null
    }
}

const Paginator = (dataType) => {
    return new GraphQLObjectType({
        name: 'Paginator',
        fields: () => ({
            previousPage: {
                type: GraphQLInt
            },
            nextPage: {
                type: GraphQLInt
            },
            totalItems: {
                type: GraphQLInt
            },
            data: {
                type: new GraphQLList(dataType)
            }
        })
    })
}

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
        ItemID: {
            type: GraphQLString
        },
        Customer: {
            type: User,
            resolve({ CustomerID }, _) {
                return UserRepo.search({ ShopifyCustomerNumber: CustomerID });
            }
        }
    })
});

const DownloadUrls = new GraphQLObjectType({
    name: "DownloadUrl",
    fields: () => ({
        ItemTitle: {
            type: GraphQLString
        },
        LinkID: {
            type: GraphQLInt
        },
        LinkGuid: {
            type: GraphQLString
        },
        CreditsUsed: {
            type: GraphQLString
        },
        Used: {
            type: GraphQLInt
        },
        OrderDate: {
            type: GraphQLString
        }
    })
});

const ProductMetaField = new GraphQLObjectType({
    name: 'ProductMetaField',
    fields: () => ({
        id: {
            type: GraphQLID
        },
        key: {
            type: GraphQLString
        },
        value: {
            type: GraphQLString
        },
        namespace: {
            type: GraphQLString
        }
    })
})

const Product = new GraphQLObjectType({
    name: "Plugin",
    fields: () => ({
        ProductID: {
            type: GraphQLFloat
        },
        Handle: {
            type: GraphQLString
        },
        RetailPrice: {
            type: GraphQLFloat
        },
        Title: {
            type: GraphQLString
        },
        Version: {
            type: GraphQLString
        },
        UpgradedVersionAt: {
            type: GraphQLString
        },
        metafields: {
            type: new GraphQLList(ProductMetaField),
            resolve({ ProductID }, _) {
                return ProductRepo.getMetafields(ProductID);
            }
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
            users: {
                type: Paginator(User),
                args: {
                    pageNumber: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    limit: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve(_, { pageNumber, limit }) {
                    return paginator(UserRepo.getAll, UserRepo.getCount, pageNumber, limit);
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
                    },
                    itemID: {
                        type: GraphQLFloat
                    }
                },
                resolve(_, args) {
                    return CreditRepo.getAllInInteval(args.start, args.end, args.itemID);
                }
            },
            product: {
                type: Product,
                args: {
                    id: {
                        type: new GraphQLNonNull(GraphQLID)
                    }
                },
                resolve(_, args) {
                    return ProductRepo.getById(args.id);
                }
            },
            products: {
                type: new GraphQLList(Product),
                resolve(_, args) {
                    return ProductRepo.getAll();
                }
            }
        }
    })
});

module.exports = schema;