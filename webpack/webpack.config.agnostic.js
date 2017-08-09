export default {
    module: {
        rules: [
            {
                test: /\.graphql?$/,
                loader: 'graphql-tag/loader'
            }
        ]
    }
}
