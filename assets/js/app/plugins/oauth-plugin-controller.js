(function () {
  'use strict';

  angular.module('frontend.plugins')
    .controller('OAuthPluginController', [
      '_', '$scope', '$log', '$state', 'PluginsService', 'MessageService',
      '$uibModal', 'DialogService', 'PluginModel', 'ListConfig', 'UserService', 'PluginHelperService', '_context_name', '_context_data', '_plugins', '$compile', 'InfoService', '$localStorage',
      function controller(_, $scope, $log, $state, PluginsService, MessageService,
                          $uibModal, DialogService, PluginModel, ListConfig, UserService, PluginHelperService, _context_name, _context_data, _plugins, $compile, InfoService, $localStorage) {
        $scope.globalInfo = $localStorage.credentials.user;
        $scope.context_data = (_context_data && _context_data.data) || null;
        $scope.context_name = _context_name || null;
        $scope.context_upstream = '';
        $scope.plugins = _plugins.data.data;
        $scope.oauthPlugin = null;
        $scope.addNewCondition = addNewCondition;
        $scope.addNewPath = addNewPath;
        $scope.showResourceJSON = showResourceJSON;
        $scope.managePlugin = managePlugin;
        $scope.loadMethods = loadMethods;
        $scope.loadScopes = loadScopes;
        $scope.addGroup = addGroup;
        $scope.removeGroup = removeGroup;
        $scope.fetchData = fetchData;
        $scope.showPathPossibilities = showPathPossibilities;
        $scope.addCustomHeader = addCustomHeader;
        $scope.showCustomHeadersGuide = showCustomHeadersGuide;
        $scope.passCredentials = ['pass', 'hide', 'phantom_token'];
        $scope.headerFormats = ["string", "jwt", "base64", "urlencoded", "list"];
        $scope.isAllowPEP = true;

        if (_context_name == 'service') {
          $scope.context_upstream = $scope.context_data.protocol + "://" + $scope.context_data.host;
        } else if (_context_name == 'route') {
          $scope.context_upstream = $scope.context_data.protocols[0] + "://" + (($scope.context_data.hosts && $scope.context_data.hosts[0]) || ($scope.context_data.paths && $scope.context_data.paths[0]) || ($scope.context_data['methods'] && $scope.context_data['methods'][0]));
        } else if (_context_name == 'api') {
          $scope.context_upstream = $scope.context_data.upstream_url;
        }

        $scope.modelPlugin = {
          tags: [],
          isPEPEnabled: true,
          config: {
            oxd_url: $scope.globalInfo.oxdWeb,
            op_url: $scope.globalInfo.opHost,
            oxd_id: $scope.globalInfo.oxdId,
            client_id: $scope.globalInfo.clientId,
            client_secret: $scope.globalInfo.clientSecret,
            oauth_scope_expression: [],
            deny_by_default: true,
            pass_credentials: "pass",
            consumer_mapping: true,
            custom_headers: [{
              header_name: 'x-consumer-id',
              value_lua_exp: 'consumer.id',
              format: 'string',
              sep: ' ',
              iterate: false,
            }, {
              header_name: 'x-oauth-client-id',
              value_lua_exp: 'introspect_data.client_id',
              format: 'string',
              sep: ' ',
              iterate: false,
            }, {
              header_name: 'x-consumer-custom-id',
              value_lua_exp: 'introspect_data.client_id',
              format: 'string',
              iterate: false,
              sep: ' ',
            }, {
              header_name: 'x-oauth-expiration',
              value_lua_exp: 'introspect_data.exp',
              format: 'string',
              iterate: false,
              sep: ' ',
            }, {
              header_name: 'x-authenticated-scope',
              value_lua_exp: 'introspect_data.scope',
              format: 'list',
              iterate: false,
              sep: ',',
            }]
          }
        };

        if ($scope.context_name) {
          $scope.modelPlugin[$scope.context_name] = {
            id: $scope.context_data.id
          }
        } else {
          $scope.plugins = $scope.plugins.filter(function (item) {
            return (!((item.service && item.service.id) || (item.route && item.route.id)))
          });
        }

        $scope.isPluginAdded = false;
        var authPlugin, pepPlugin;

        $scope.plugins.forEach(function (o) {
          if (o.name === "gluu-opa-pep") {
            $scope.isAllowPEP = false;
            $scope.modelPlugin.isPEPEnabled = false;
          }
          if (o.name === "gluu-oauth-auth") {
            authPlugin = o;
          }
          if (o.name === "gluu-oauth-pep") {
            pepPlugin = o;
          }
        });

        if (authPlugin) {
          $scope.modelPlugin = authPlugin;
          $scope.modelPlugin.authId = authPlugin.id;
          $scope.modelPlugin.isPEPEnabled = false;
          $scope.isPluginAdded = true;
          $scope.modelPlugin.config.oauth_scope_expression = [];
        }

        if (pepPlugin) {
          $scope.modelPlugin.pepId = pepPlugin.id;
          $scope.modelPlugin.config.deny_by_default = pepPlugin.config.deny_by_default;
          $scope.modelPlugin.isPEPEnabled = true;

          $scope.ruleScope = {};
          $scope.ruleOauthScope = {};
          $scope.modelPlugin.config.oauth_scope_expression = JSON.parse(pepPlugin.config.oauth_scope_expression) || [];
          setTimeout(function () {
            if ($scope.modelPlugin.config.oauth_scope_expression && $scope.modelPlugin.config.oauth_scope_expression.length > 0) {
              $scope.modelPlugin.config.oauth_scope_expression.forEach(function (path, pIndex) {
                path.conditions.forEach(function (cond, cIndex) {
                  var pRule = cond.scope_expression.rule;
                  var op = '';
                  if (pRule['and']) {
                    op = 'and'
                  } else if (pRule['or']) {
                    op = 'or'
                  } else if (pRule['!']) {
                    op = '!'
                  }

                  _repeat(pRule[op], op, 0);

                  function _repeat(rule, op, id) {
                    if (op == "!") {
                      rule = rule['or'];
                    }

                    $("input[name=hdScopeCount" + pIndex + cIndex + "]").val(id + 1);
                    rule.forEach(function (oRule, oRuleIndex) {
                      if (oRule['var'] == 0 || oRule['var']) {
                        if (!$scope.ruleScope["scope" + pIndex + cIndex + id]) {
                          $scope.ruleScope["scope" + pIndex + cIndex + id] = [];
                        }

                        $scope.ruleScope["scope" + pIndex + cIndex + id].push({text: cond.scope_expression.data[oRule['var']]});
                      }

                      if (rule.length - 1 == oRuleIndex) {
                        // show remove button
                        var removeBtn = " <button type=\"button\" class=\"btn btn-xs btn-danger\" data-add=\"rule\" data-ng-click=\"removeGroup('" + pIndex + cIndex + "', " + id + ")\"><i class=\"mdi mdi-close\"></i> Delete</button>";
                        if (id == 0) {
                          removeBtn = "";
                        }
                        // render template
                        var htmlRender = "<input type=\"radio\" value=\"or\" name=\"condition" + pIndex + cIndex + id + "\" " + (op == "or" ? "checked" : "") + ">or | " +
                          "<input type=\"radio\" value=\"and\" name=\"condition" + pIndex + cIndex + id + "\" " + (op == "and" ? "checked" : "") + ">and | " +
                          "<input type=\"radio\" value=\"!\" name=\"condition" + pIndex + cIndex + id + "\" " + (op == "!" ? "checked" : "") + ">not " +
                          "<button type=\"button\" class=\"btn btn-xs btn-success\" data-add=\"rule\" data-ng-click=\"addGroup('" + pIndex + cIndex + "', " + (id + 1) + ")\" name=\"btnAdd" + pIndex + cIndex + id + "\"><i class=\"mdi mdi-plus\"></i> Add Group</button> " +
                          removeBtn +
                          "<div class=\"form-group has-feedback\"> " +
                          "<input type=\"hidden\" value=\"{{ruleScope['scope" + pIndex + cIndex + id + "']}}\" name=\"hdScope" + pIndex + cIndex + id + "\" /> " +
                          "<tags-input min-length=\"1\" ng-model=\"ruleScope['scope" + pIndex + cIndex + id + "']\" required name=\"scope" + pIndex + cIndex + id + "\" id=\"scope" + pIndex + cIndex + id + "\" placeholder=\"Enter scopes\"></tags-input> " +
                          "</div>" +
                          "<div class=\"col-md-12\" id=\"dyScope" + pIndex + cIndex + (id + 1) + "\"></div>";

                        $("#dyScope" + pIndex + cIndex + id).append(htmlRender);
                        $compile(angular.element("#dyScope" + pIndex + cIndex + id).contents())($scope)
                        $("button[name=btnAdd" + pIndex + cIndex + id + "]").hide();
                        // end
                      }

                      if (oRule['and']) {
                        _repeat(oRule['and'], 'and', ++id);
                      } else if (oRule['or']) {
                        _repeat(oRule['or'], 'or', ++id);
                      } else if (oRule['!']) {
                        _repeat(oRule['!'], '!', ++id);
                      } else {
                        $("button[name=btnAdd" + pIndex + cIndex + id + "]").show();
                      }
                    });
                  }
                });
                path.pathIndex = pIndex;
              });
            }
          }, 500);
        }

        /**
         * ----------------------------------------------------------------------
         * Functions
         * ----------------------------------------------------------------------
         */
        function fetchData() {
          InfoService
            .getInfo()
            .then(function (resp) {
              $scope.info = resp.data;
              if (!$scope.context_name) {
                $scope.context_upstream = "http://" + $scope.info.hostname + ":" + $scope.info.configuration.proxy_listeners[0].port;
              }
              $log.debug("DashboardController:fetchData:info", $scope.info);
            })
        }

        function removeGroup(parent, id) {
          $("#dyScope" + parent + id).html('');
          $("input[name=hdScopeCount" + parent + "]").val(id);
          $("button[name=btnAdd" + parent + (id - 1) + "]").show();
        }

        function addGroup(parent, id) {
          $("input[name=hdScopeCount" + parent + "]").val(id + 1);
          $("button[name=btnAdd" + parent + (id - 1) + "]").hide();
          var htmlRender = "<div class=\"col-md-12\">" +
            "<input type=\"radio\" value=\"or\" name=\"condition" + parent + id + "\" checked>or | <input type=\"radio\" value=\"and\" name=\"condition" + parent + id + "\">and | <input type=\"radio\" value=\"!\" name=\"condition" + parent + id + "\">not" +
            "<button type=\"button\" class=\"btn btn-xs btn-success\" data-add=\"rule\" data-ng-click=\"addGroup('" + parent + "', " + (id + 1) + ")\" name=\"btnAdd" + parent + id + "\"><i class=\"mdi mdi-plus\"></i> Add Group</button> " +
            "<button type=\"button\" class=\"btn btn-xs btn-danger\" data-add=\"rule\" data-ng-click=\"removeGroup('" + parent + "', " + id + ")\"><i class=\"mdi mdi-close\"></i> Delete</button>" +
            "<input type=\"hidden\" value=\"{{cond['scopes" + parent + id + "']}}\" name=\"hdScope" + parent + id + "\" />" +
            "<div class=\"form-group has-feedback\">" +
            "<tags-input min-length=\"1\" type=\"url\" required ng-model=\"cond['scopes" + parent + id + "']\" name=\"scope" + id + "\" id=\"scopes{{$parent.$index}}{{$index}}\" placeholder=\"Enter scopes\"> </tags-input>" +
            "</div>" +
            "<div class=\"col-md-12\" id=\"dyScope" + parent + (id + 1) + "\"></div>" +
            "</div>";
          $("#dyScope" + parent + id).append(htmlRender);
          $compile(angular.element("#dyScope" + parent + id).contents())($scope)
        }

        function addNewCondition(pIndex) {
          $scope.modelPlugin.config.oauth_scope_expression[pIndex].conditions.push(
            {
              httpMethods: [{text: 'GET'}],
              scope_expression: [],
              ticketScopes: []
            });

          if ($scope.isPluginAdded) {
            var parent = pIndex + '' + ($scope.modelPlugin.config.oauth_scope_expression[pIndex].conditions.length - 1);
            var id = 0;
            setTimeout(function () {
              var htmlRender = "<input type=\"radio\" value=\"or\" name=\"condition" + parent + "0\" checked>or | <input type=\"radio\" value=\"and\" name=\"condition" + parent + "0\">and | <input type=\"radio\" value=\"!\" name=\"condition" + parent + "0\">not " +
                "<button type=\"button\" class=\"btn btn-xs btn-success\" data-add=\"rule\" data-ng-click=\"addGroup('" + parent + "',1)\" name=\"btnAdd" + parent + id + "\"><i class=\"mdi mdi-plus\"></i> Add Group </button>" +
                "<input type=\"hidden\" value=\"{{cond['scopes' + " + parent + " + '0']}}\" name=\"hdScope" + parent + "0\"/>" +
                "<div class=\"form-group has-feedback\">" +
                "<tags-input min-length=\"1\" ng-model=\"cond['scopes' + " + parent + " + '0']\" required name=\"scope" + parent + "0\" id=\"scopes" + parent + "\" placeholder=\"Enter scopes\"></tags-input>" +
                "</div>" +
                "<div class=\"col-md-12\" id=\"dyScope" + parent + (id + 1) + "\"></div>";

              $("#dyScope" + parent + '' + id).append(htmlRender);
              $compile(angular.element("#dyScope" + parent + id).contents())($scope)
            });
          }
        }

        function showResourceJSON() {
          var model = angular.copy($scope.modelPlugin);
          model.config.oauth_scope_expression = makeExpression(model);
          if (model.config.oauth_scope_expression == null) {
            return
          }
          if (!model) {
            return false;
          }

          $uibModal.open({
            animation: true,
            templateUrl: 'js/app/plugins/modals/show-resource-json-modal.html',
            size: 'lg',
            controller: ['$uibModalInstance', '$scope', 'modelPlugin', ShowScriptController],
            resolve: {
              modelPlugin: function () {
                return model;
              }
            }
          }).result.then(function (result) {
          });
        }

        function ShowScriptController($uibModalInstance, $scope, modelPlugin) {
          $scope.model = angular.copy(modelPlugin);
        }

        function addNewPath() {
          $scope.modelPlugin.config.oauth_scope_expression.push({
            path: '',
            pathIndex: $scope.modelPlugin.config.oauth_scope_expression.length,
            conditions: [
              {
                httpMethods: [{text: 'GET'}],
                scope_expression: [],
                ticketScopes: []
              }
            ]
          });

          if ($scope.isPluginAdded) {
            var parent = $scope.modelPlugin.config.oauth_scope_expression.length - 1 + '0';
            var id = 0;
            setTimeout(function () {
              var htmlRender = "<input type=\"radio\" value=\"or\" name=\"condition" + parent + "0\" checked>or | <input type=\"radio\" value=\"and\" name=\"condition" + parent + "0\">and | <input type=\"radio\" value=\"!\" name=\"condition" + parent + "0\">not" +
                "<button type=\"button\" class=\"btn btn-xs btn-success\" data-add=\"rule\" data-ng-click=\"addGroup('" + parent + "',1)\" name=\"btnAdd" + parent + id + "\"><i class=\"mdi mdi-plus\"></i> Add Group </button>" +
                "<input type=\"hidden\" value=\"{{cond['scopes' + " + parent + " + '0']}}\" name=\"hdScope" + parent + "0\"/>" +
                "<div class=\"form-group has-feedback\">" +
                "<tags-input min-length=\"1\" ng-model=\"cond['scopes' + " + parent + " + '0']\" required name=\"scope" + parent + "0\" id=\"scopes" + parent + "\" placeholder=\"Enter scopes\"> </tags-input>" +
                "</div>" +
                "<div class=\"col-md-12\" id=\"dyScope" + parent + (id + 1) + "\"></div>" +
                "</div>";
              $("#dyScope" + parent + '' + id).append(htmlRender);
              $compile(angular.element("#dyScope" + parent + id).contents())($scope)
            });
          }
        }

        function managePlugin(fElement) {
          var isFormValid = true;
          if (fElement && fElement.$error && fElement.$error.required) {
            fElement.$error.required.forEach(function (o) {
              if (document.getElementById(o.$name)) {
                isFormValid = false;
              }
            });
          }

          if (!isFormValid) {
            MessageService.error("Please fill all the fields marked in red");
            return false;
          }

          if (checkDuplicatePath()) {
            MessageService.error("PATH must be unique (but occurs more than one once).");
            return false;
          }

          if (checkDuplicateMethod()) {
            MessageService.error("HTTP method must be unique within the given PATH (but occurs more than one once).");
            return false;
          }

          if ($scope.isPluginAdded) {
            updatePlugin();
          } else {
            addPlugin();
          }
        }

        function addPlugin() {
          var model = angular.copy($scope.modelPlugin);
          var oauthScopeExpression = makeExpression($scope.modelPlugin);
          if (oauthScopeExpression && oauthScopeExpression.length > 0) {
            model.config.oauth_scope_expression = JSON.stringify(oauthScopeExpression);
          } else {
            delete model.config.oauth_scope_expression
          }

          if (model.isPEPEnabled && !model.config.oauth_scope_expression) {
            MessageService.error("OAuth scope expression is required");
            return;
          }

          var authModel = {
            name: 'gluu-oauth-auth',
            tags: model.tags || null,
            config: {
              oxd_id: "schema_testing",
              client_id: "schema_testing",
              client_secret: "schema_testing",
              op_url: model.config.op_url,
              oxd_url: model.config.oxd_url,
              anonymous: model.config.anonymous,
              pass_credentials: model.config.pass_credentials,
              custom_headers: model.config.custom_headers || [],
              consumer_mapping: model.config.consumer_mapping,
            }
          };

          var pepModel = {
            name: 'gluu-oauth-pep',
            config: {
              oxd_id: "schema_testing",
              client_id: "schema_testing",
              client_secret: "schema_testing",
              op_url: model.config.op_url,
              oxd_url: model.config.oxd_url,
              oauth_scope_expression: model.config.oauth_scope_expression,
              deny_by_default: model.config.deny_by_default || false
            }
          };

          if ($scope.context_name) {
            authModel[$scope.context_name] ={
              id: $scope.context_data.id
            };
            pepModel[$scope.context_name] ={
              id: $scope.context_data.id
            }
          }

          PluginsService.validateSchema('plugins', authModel)
            .then(function (response) {
              if(model.isPEPEnabled) {
                return PluginsService.validateSchema('plugins', pepModel)
              }
            })
            .then(function (response) {
              return PluginsService.addOAuthClient({
                oxd_id: model.config.oxd_id || null,
                client_id: model.config.client_id || null,
                client_secret: model.config.client_secret || null,
                client_name: 'gluu-oauth-client',
                op_host: model.config.op_url,
                oxd_url: model.config.oxd_url
              })
            })
            .then(function (response) {
              var oauthClient = response.data;
              authModel.config.oxd_id = oauthClient.oxd_id;
              authModel.config.client_id = oauthClient.client_id;
              authModel.config.client_secret = oauthClient.client_secret;

              return new Promise(function (resolve, reject) {
                return PluginHelperService.addPlugin(
                  authModel,
                  function success(res) {
                    return resolve(oauthClient);
                  }, function (err) {
                    return reject(err);
                  });
              });
            })
            .then(function (oauthClient) {
              if (!model.isPEPEnabled) {
                MessageService.success('Gluu OAuth Auth Plugin added successfully!');
                $state.go(($scope.context_name || "plugin") + "s");
                return
              }
              pepModel.config.oxd_id = oauthClient.oxd_id;
              pepModel.config.client_id = oauthClient.client_id;
              pepModel.config.client_secret = oauthClient.client_secret;

              return PluginHelperService.addPlugin(
                pepModel,
                function success(res) {
                  $state.go(($scope.context_name || "plugin") + "s");
                  MessageService.success('Gluu OAuth Auth and PEP Plugin added successfully!');
                }, function (err) {
                  return Promise.reject(err);
                });
            })
            .catch(function (error) {
              $scope.busy = false;
              $log.error("create plugin", error);
              console.log(error);
              if (error.data.body) {
                Object.keys(error.data.body).forEach(function (key) {
                  MessageService.error(key + " : " + error.data.body[key]);
                });
                return
              }
              MessageService.error("Failed!");
            });
        }

        function updatePlugin() {
          var model = angular.copy($scope.modelPlugin);
          var oauth_scope_expression = makeExpression($scope.modelPlugin);

          if (oauth_scope_expression && oauth_scope_expression.length > 0) {
            model.config.oauth_scope_expression = JSON.stringify(oauth_scope_expression);
          } else {
            model.config.oauth_scope_expression = null;
          }

          if (model.isPEPEnabled && !model.config.oauth_scope_expression) {
            MessageService.error("OAuth scope expression is required");
            return;
          }

          var authModel = {
            name: 'gluu-oauth-auth',
            config: {
              oxd_id: model.config.oxd_id,
              client_id: model.config.client_id,
              client_secret: model.config.client_secret,
              op_url: model.config.op_url,
              oxd_url: model.config.oxd_url,
              anonymous: model.config.anonymous,
              pass_credentials: model.config.pass_credentials,
              custom_headers: model.config.custom_headers || [],
              consumer_mapping: model.config.consumer_mapping,
            }
          };
          if ($scope.context_name) {
            authModel[$scope.context_name] = {
              id: $scope.context_data.id
            };
          }
          if (model.tags) {
            authModel.tags = model.tags
          }
          return new Promise(function (resolve, reject) {
            return PluginHelperService.updatePlugin(model.authId,
              authModel,
              function success(res) {
                return resolve();
              }, function (err) {
                return reject(err);
              });
          })
            .then(function () {
              if (!model.isPEPEnabled) {
                MessageService.success('Gluu OAuth Auth Plugin updated successfully!');
                $state.go(($scope.context_name || "plugin") + "s");
                return
              }

              var pepModel = {
                name: 'gluu-oauth-pep',
                config: {
                  oxd_id: model.config.oxd_id,
                  client_id: model.config.client_id,
                  client_secret: model.config.client_secret,
                  op_url: model.config.op_url,
                  oxd_url: model.config.oxd_url,
                  oauth_scope_expression: model.config.oauth_scope_expression,
                  deny_by_default: model.config.deny_by_default || false
                }
              };
              if ($scope.context_name) {
                pepModel[$scope.context_name] = {
                  id: $scope.context_data.id
                };
              }

              if (model.pepId) {
                return PluginHelperService.updatePlugin(model.pepId, pepModel,
                  success,
                  error);
              } else {
                return PluginHelperService.addPlugin(
                  pepModel,
                  success,
                  error);
              }

              function success(res, msg) {
                $state.go(($scope.context_name || "plugin") + "s");
                if (model.pepId) {
                  MessageService.success('Gluu OAuth Auth and PEP Plugin updated successfully!');
                } else {
                  MessageService.success('Gluu OAuth Auth updated and PEP Plugin added successfully!');
                }
              }

              function error(err) {
                return Promise.reject(err);
              }
            })
            .catch(function (error) {
              $scope.busy = false;
              $log.error("create plugin", error);
              console.log(error);
              if (error.data.body) {
                Object.keys(error.data.body).forEach(function (key) {
                  MessageService.error(key + " : " + error.data.body[key]);
                });
                return
              }
              MessageService.error("Failed!");
            });
        }

        function loadMethods(query) {
          var arr = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS', 'CONNECT', 'TRACE', 'HEAD', '?'];
          arr = arr.filter(function (o) {
            return o.indexOf(query.toUpperCase()) >= 0;
          });
          return arr;
        }

        function loadScopes(query) {
          return [];
        }

        function makeExpression(data) {
          try {
            var model = angular.copy(data);
            var dIndex = 0;
            var sData = [];
            model.config.oauth_scope_expression.forEach(function (path, pIndex) {
              if(PluginHelperService.isMultipleQuestions(path.path || "")) {
                MessageService.error("Multiple ?? patterns in path are not supported " + path.path);
                throw "Multiple ?? patterns in path are not supported ";
              }

              path.conditions.forEach(function (cond, cIndex) {
                dIndex = 0;
                sData = [];
                pIndex = path.pathIndex;
                var str = '{%s}';
                for (var i = 0; i < parseInt($("input[name=hdScopeCount" + pIndex + cIndex + "]").val()); i++) {
                  var op = $("input[name=condition" + pIndex + cIndex + i + "]:checked").val();
                  var scopes = JSON.parse($("input[name=hdScope" + pIndex + cIndex + i + "]").val()).map(function (o) {
                    sData.push(o.text);
                    return {"var": dIndex++};
                  });
                  var s = "";
                  scopes.forEach(function (item) {
                    s += JSON.stringify(item) + ","
                  });

                  if (op == '!') {
                    str = str.replace('%s', "\"" + op + "\":{\"or\":[" + s + " {%s}]}");
                  } else {
                    str = str.replace('%s', "\"" + op + "\":[" + s + " {%s}]");
                  }

                  if (!!cond["scopes" + pIndex + cIndex + i]) {
                    delete cond["scopes" + pIndex + cIndex + i]
                  }
                }

                cond.httpMethods = cond.httpMethods.map(function (o) {
                  return o.text;
                });
                str = str.replace(', {%s}', '');
                cond.scope_expression = {rule: JSON.parse(str), data: angular.copy(sData)};

                if (cond.ticketScopes && cond.ticketScopes.length > 0) {
                  cond.ticketScopes = cond.ticketScopes.map(function (o) {
                    return o.text;
                  });
                } else {
                  delete cond.ticketScopes;
                }
              });
              delete path.pathIndex
            });
            return model.config.oauth_scope_expression;
          } catch (e) {
            MessageService.error("Invalid OAuth scope expression");
            return null;
          }
        }

        function checkDuplicateMethod() {
          var model = angular.copy($scope.modelPlugin);
          var methodFlag = false;

          model.config.oauth_scope_expression.forEach(function (path, pIndex) {
            var methods = [];
            path.conditions.forEach(function (cond, cIndex) {
              if (!cond.httpMethods) {
                return
              }
              cond.httpMethods.forEach(function (m) {
                if (methods.indexOf(m.text) >= 0) {
                  methodFlag = true
                }
                methods.push(m.text);
              })
            });
          });
          return methodFlag;
        }

        function checkDuplicatePath() {
          var model = angular.copy($scope.modelPlugin);
          var pathFlag = false;
          var paths = [];
          model.config.oauth_scope_expression.forEach(function (path, pIndex) {
            if (!path.path) {
              return
            }
            if (paths.indexOf(path.path) >= 0) {
              pathFlag = true
            }
            paths.push(path.path);
          });
          return pathFlag;
        }

        function showPathPossibilities() {
          $uibModal.open({
            animation: true,
            templateUrl: 'js/app/plugins/modals/path-possibilities-modal.html',
            size: 'lg',
            controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
              $scope.paths = [
                {
                  path: '/??',
                  allow: ['/folder/file.ext', '/folder/file2', 'Apply security on all the paths'],
                  deny: []
                }, {
                  path: '/folder/file.ext',
                  allow: ['/folder/file.ext'],
                  deny: ['/folder/file']
                }, {
                  path: '/folder/file',
                  allow: ['/folder/file'],
                  deny: ['/folder/file/', '/folder/file/123', '/folder/file/xyx', 'So it will be good to use /?? wild card if you want to secure sub folders']
                }, {
                  path: '/folder/?/file',
                  allow: ['/folder/123/file', '/folder/xxx/file'],
                  deny: []
                }, {
                  path: '/path/??',
                  allow: ['/path', '/path/', '/path/xxx', '/path/xxx/yyy/file'],
                  deny: []
                }, {
                  path: '/path/??/image.jpg',
                  allow: ['/path/one/two/image.jpg', '/path/image.jpg'],
                  deny: []
                }, {
                  path: '/path/?/image.jpg',
                  allow: ['/path/xxx/image.jpg - ? has higher priority than ??'],
                  deny: []
                }, {
                  path: '/path/{abc|xyz}/image.jpg',
                  allow: ['/path/abc/image.jpg', '/path/xyz/image.jpg'],
                  deny: []
                }, {
                  path: '/users/?/{todos|photos}',
                  allow: ['/users/123/todos', '/users/xxx/photos'],
                  deny: []
                }, {
                  path: '/users/?/{todos|photos}/?',
                  allow: ['/users/123/todos/', '/users/123/todos/321', '/users/123/photos/321'],
                  deny: []
                }
              ]
            }],
          }).result.then(function (result) {

          });
        }

        function addCustomHeader() {
          $scope.modelPlugin.config.custom_headers = $scope.modelPlugin.config.custom_headers || [];
          var custom_headers = $scope.modelPlugin.config.custom_headers;
          custom_headers.push({
            header_name: 'http-kong-custom',
            value_lua_exp: 'any_value',
            format: 'string',
            iterate: false,
            sep: ' ',
          })
        }

        function showCustomHeadersGuide() {
          $uibModal.open({
            animation: true,
            templateUrl: 'js/app/plugins/modals/custom-headers-guide.html',
            size: 'lg',
            controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
              $scope.examples = [{
                headerName: 'x-consumer-id',
                value: 'consumer.id',
                format: 'string',
                separator: ' ',
                Iterate: 'No',
              }, {
                headerName: 'x-oauth-client-id',
                value: 'introspect_data.client_id',
                format: 'string',
                separator: ' ',
                Iterate: 'No',
              }, {
                headerName: 'x-consumer-custom-id',
                value: 'introspect_data.client_id',
                format: 'string',
                Iterate: 'No',
                separator: ' ',
              }, {
                headerName: 'x-oauth-expiration',
                value: 'introspect_data.exp',
                format: 'string',
                Iterate: 'No',
                separator: ' ',
              }, {
                headerName: 'x-authenticated-scope',
                value: 'introspect_data.scope',
                format: 'list',
                Iterate: 'No',
                separator: ', (comma)',
              },{
                headerName: 'x-oauth-token-{*}',
                value: 'introspect_data',
                format: '[string | urlencoded | base64]',
                separator: '',
                Iterate: 'Yes'
              },{
                headerName: 'kong-version',
                value: '"version 1.3", Note: double quotes required for custom values.',
                format: '[string | urlencoded | base64]',
                separator: '',
                Iterate: 'No'
              }]
            }],
          }).result.then(function (result) {
          });
        }

        //init
        $scope.fetchData()
      }
    ]);
}());
