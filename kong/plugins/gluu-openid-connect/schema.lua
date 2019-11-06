local common = require "gluu.kong-common"
local typedefs = require "kong.db.schema.typedefs"
local json_cache = require "gluu.json-cache"
local cjson = require "cjson.safe"

return {
    name = "gluu-openid-connect",
    fields = {
        { run_on = typedefs.run_on_first },
        { consumer = typedefs.no_consumer },
        {
            config = {
                type = "record",
                fields = {
                    { oxd_id = { required = true, type = "string" }, },
                    { oxd_url = typedefs.url { required = true }, },
                    { client_id = { required = true, type = "string" }, },
                    { client_secret = { required = true, type = "string" }, },
                    { op_url = typedefs.url { required = true }, },
                    { authorization_redirect_path = { required = true, type = "string" }, },
                    { logout_path = { required = false, type = "string" }, },
                    { post_logout_redirect_path_or_url = { required = false, type = "string" }, },
                    { requested_scopes = { type = "array", elements = { type = "string" }, }, },
                    { max_id_token_age = typedefs.timeout  { required = true }, },
                    { max_id_token_auth_age = typedefs.timeout  { required = true }, },
                    { required_acrs_expression = { required = false, type = "string" }, },
                    { method_path_tree = { required = false, type = "string" }, },
                },
                custom_validator = function(config)
                    if not config.required_acrs_expression then
                        config.method_path_tree = nil
                        return true
                    end
                    local required_acrs_expression = json_cache(config.required_acrs_expression)
                    local ok, err = common.check_expression(required_acrs_expression)
                    if not ok then
                        return false, err
                    end

                    local method_path_tree = common.convert_scope_expression_to_path_wildcard_tree(required_acrs_expression)
                    config.method_path_tree = cjson.encode(method_path_tree)
                    return true
                end
            },
        },
    }
}
