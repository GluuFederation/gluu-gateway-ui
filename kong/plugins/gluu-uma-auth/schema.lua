local kong_auth_pep_common = require"gluu.kong-common"

return {
    no_consumer = true,
    fields = {
        oxd_url = { required = true, type = "url" },
        client_id = { required = true, type = "string" },
        client_secret = { required = true, type = "string" },
        oxd_id = { required = true, type = "string" },
        op_url = { required = true, type = "url" },
        anonymous = { type = "string", func = kong_auth_pep_common.check_user, default = "" },
        pass_credentials = { type = "string", enum = {"pass", "hide", "phantom_token"}, default = "pass" },
    }
}
