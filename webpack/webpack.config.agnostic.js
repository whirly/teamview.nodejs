module.exports = {
    module: {
        rules: [
            {
                test: /\.graphql?$/,
                loader: 'graphql-tag/loader'
            }
        ]
    }
};
