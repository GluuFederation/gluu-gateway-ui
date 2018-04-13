(function () {
  'use strict';

  angular.module('frontend.apis')
    .controller('ManageUmaRsPluginController', [
      '_', '$scope', '$log', '$state', 'ApiService', 'PluginsService', 'MessageService',
      '$uibModal', 'DialogService', 'PluginModel', 'ListConfig', 'UserService', 'ApiModel', 'PluginHelperService', '_api', '_plugins', '$compile', 'InfoService', '$localStorage',
      function controller(_, $scope, $log, $state, ApiService, PluginsService, MessageService,
                          $uibModal, DialogService, PluginModel, ListConfig, UserService, ApiModel, PluginHelperService, _api, _plugins, $compile, InfoService, $localStorage) {
        $scope.globalInfo = $localStorage.credentials.user;
        $scope.api = _api.data
        $scope.plugins = _plugins.data.data
        $scope.rsPlugin = null;
        $scope.addNewCondition = addNewCondition
        $scope.addNewPath = addNewPath
        $scope.showResourceJSON = showResourceJSON
        $scope.managePlugin = managePlugin
        $scope.loadMethods = loadMethods
        $scope.loadScopes = loadScopes
        $scope.addGroup = addGroup
        $scope.removeGroup = removeGroup
        $scope.fetchData = fetchData
        $scope.modelPlugin = {
          api_id: $scope.api.id,
          name: 'gluu-oauth2-rs',
          config: {
            oxd_host: $scope.globalInfo.oxdWeb,
            uma_server_host: $scope.globalInfo.opHost,
            protection_document: [{
              path: '',
              conditions: [
                {
                  httpMethods: [{text: 'GET'}, {text: 'POST'}],
                  scope_expression: [],
                  ticketScopes: []
                }]
            }]
          }
        };

        $scope.isKongUMARSPluginAdded = false;

        $scope.plugins.forEach(function (o) {
          if (o.name == "gluu-oauth2-rs") {
            $scope.pluginConfig = o.config;
            $scope.rsPlugin = o;
            $scope.isKongUMARSPluginAdded = true;
            $scope.ruleScope = {};
            $scope.modelPlugin.config.protection_document = JSON.parse(o.config.protection_document);
            setTimeout(function () {
              $scope.modelPlugin.config.protection_document.forEach(function (path, pIndex) {
                path.conditions.forEach(function (cond, cIndex) {
                  var pRule = cond.scope_expression.rule;
                  var op = '';
                  if (pRule['and']) {
                    op = 'and'
                  } else if (pRule['or']) {
                    op = 'or'
                  } else if (pRule['not']) {
                    op = 'not'
                  }

                  _repeat(pRule[op], op, 0);

                  function _repeat(rule, op, id) {
                    $(`input[name=hdScopeCount${pIndex}${cIndex}]`).val(id + 1);
                    rule.forEach(function (oRule, oRuleIndex) {
                      if (oRule['var'] == 0 || oRule['var']) {
                        if (!$scope.ruleScope[`scope${pIndex}${cIndex}${id}`]) {
                          $scope.ruleScope[`scope${pIndex}${cIndex}${id}`] = [];
                        }

                        $scope.ruleScope[`scope${pIndex}${cIndex}${id}`].push({text: cond.scope_expression.data[oRule['var']]});
                      }

                      if (rule.length - 1 == oRuleIndex) {
                        // render template
                        var htmlRender = `
                          <input type="radio" value="or" name="condition${pIndex}${cIndex}${id}" ${op == "or" ? "checked" : ""}>or |
                          <input type="radio" value="and" name="condition${pIndex}${cIndex}${id}" ${op == "and" ? "checked" : ""}>and |
                          <input type="radio" value="not" name="condition${pIndex}${cIndex}${id}" ${op == "not" ? "checked" : ""}>not
                          <button type="button" class="btn btn-xs btn-success" data-add="rule" data-ng-click="addGroup('${pIndex}${cIndex}', ${id + 1})"><i class="mdi mdi-plus"></i> Add Group</button>
                          <button type="button" class="btn btn-xs btn-danger" data-add="rule" data-ng-click="removeGroup('${pIndex}${cIndex}', ${id})"><i class="mdi mdi-close"></i> Delete</button>
                          <div class="form-group has-feedback">
                           <input type="hidden" value="{{ruleScope['scope${pIndex}${cIndex}${id}']}}" name="hdScope${pIndex}${cIndex}${id}" />
                           <tags-input ng-model="ruleScope['scope${pIndex}${cIndex}${id}']" 
                           name="scope${pIndex}${cIndex}${id}" id="scope${pIndex}${cIndex}${id}">
                            </tags-input>
                          </div>
                          <div class="col-md-12" id="dyScope${pIndex}${cIndex}${id + 1}">
                          </div>`;
                        $("#dyScope" + pIndex + cIndex + id).append(htmlRender);
                        $compile(angular.element("#dyScope" + pIndex + cIndex + id).contents())($scope)
                        // end
                      }

                      if (oRule['and']) {
                        _repeat(oRule['and'], 'and', ++id);
                      } else if (oRule['or']) {
                        _repeat(oRule['or'], 'or', ++id);
                      } else if (oRule['not']) {
                        _repeat(oRule['not'], 'not', ++id);
                      }
                    });
                  }
                });
              });
            }, 500);
          }
        });

        /**
         * ----------------------------------------------------------------------
         * Functions
         * ----------------------------------------------------------------------
         */
        function fetchData() {
          InfoService
            .getInfo()
            .then(function (resp) {
              $scope.info = resp.data
              $log.debug("DashboardController:fetchData:info", $scope.info)
            })
        }

        function removeGroup(parent, id) {
          $("#dyScope" + parent + id).html('');
          $("input[name=hdScopeCount" + parent + "]").val(id);
        }

        function addGroup(parent, id) {
          $("input[name=hdScopeCount" + parent + "]").val(id + 1);
          $("#dyScope" + parent + id).append(`
                      <div class="col-md-12">
                        <input type="radio" value="or" name="condition${parent}${id}">or | <input type="radio" value="and" name="condition${parent}${id}">and | <input type="radio" value="not" name="condition${parent}${id}">not
                        <button type="button" class="btn btn-xs btn-success" data-add="rule" data-ng-click="addGroup('${parent}', ${id})"><i class="mdi mdi-plus"></i> Add Group</button>
                        <button type="button" class="btn btn-xs btn-danger" data-add="rule" data-ng-click="removeGroup('${parent}', ${id})"><i class="mdi mdi-close"></i> Delete</button>
                        <input type="hidden" value="{{cond['scopes${parent}${id}']}}" name="hdScope${parent}${id}" />
                        <div class="form-group has-feedback">
                          <tags-input type="url" ng-model="cond['scopes${parent}${id}']" name="scope${id}"
                                      id="scopes{{$parent.$index}}{{$index}}"
                                      placeholder="Enter scopes">
                            <auto-complete source="loadScopes($query)"
                                           min-length="0"
                                           template="my-custom-template"
                                           debounce-delay="0"></auto-complete>
                          </tags-input>
                          <script type="text/ng-template" id="my-custom-template">
                            <div>
                              <span>{{data.name}}</span>
                            </div>
                          </script>
                        </div>
                        <div class="col-md-12" id="dyScope${parent}${id + 1}">
                        </div>
                      </div>`);
          $compile(angular.element("#dyScope" + parent + id).contents())($scope)
        }

        function addNewCondition(pIndex) {
          $scope.modelPlugin.config.protection_document[pIndex].conditions.push(
            {
              httpMethods: [{text: 'GET'}],
              scope_expression: [],
              ticketScopes: []
            });

          if ($scope.isKongUMARSPluginAdded) {
            var parent = pIndex + '' + ($scope.modelPlugin.config.protection_document[pIndex].conditions.length - 1);
            var id = 0;
            setTimeout(function () {
              $("#dyScope" + parent + '' + id).append(`
                        <input type="radio" value="or" name="condition${parent}0">or |
                            <input type="radio" value="and" name="condition${parent}0">and |
                            <input type="radio" value="not" name="condition${parent}0">not
                            <button type="button" class="btn btn-xs btn-success" data-add="rule"
                                    data-ng-click="addGroup(${parent},1)"><i class="mdi mdi-plus"></i>
                              Add Group
                            </button>
                            <input type="hidden" value="{{cond['scopes' + ${parent} + '0']}}"
                                   name="hdScope${parent}0"/>
                            <div class="form-group has-feedback">
                              <tags-input ng-model="cond['scopes' + ${parent} + '0']"
                                          name="scope${parent}0"
                                          id="scopes${parent}"
                                          placeholder="Enter scopes">
                                <auto-complete source="loadScopes($query)"
                                               min-length="0"
                                               template="my-custom-template"
                                               debounce-delay="0"></auto-complete>
                              </tags-input>
                              <script type="text/ng-template" id="my-custom-template">
                                <div>
                                  <span>{{data.name}}</span>
                                </div>
                              </script>`);
              $compile(angular.element("#dyScope" + parent + id).contents())($scope)
            });
          }
        }

        function showResourceJSON() {
          var model = makeJSON($scope.modelPlugin);
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
          $scope.modelPlugin.config.protection_document.push({
            path: '',
            conditions: [
              {
                httpMethods: [{text: 'GET'}],
                scope_expression: [],
                ticketScopes: []
              }
            ]
          });

          if ($scope.isKongUMARSPluginAdded) {
            var parent = $scope.modelPlugin.config.protection_document.length - 1 + '0';
            var id = 0;
            setTimeout(function () {
              $("#dyScope" + parent + '' + id).append(`
                        <input type="radio" value="or" name="condition${parent}0">or |
                            <input type="radio" value="and" name="condition${parent}0">and |
                            <input type="radio" value="not" name="condition${parent}0">not
                            <button type="button" class="btn btn-xs btn-success" data-add="rule"
                                    data-ng-click="addGroup(${parent},1)"><i class="mdi mdi-plus"></i>
                              Add Group
                            </button>
                            <input type="hidden" value="{{cond['scopes' + ${parent} + '0']}}"
                                   name="hdScope${parent}0"/>
                            <div class="form-group has-feedback">
                              <tags-input ng-model="cond['scopes' + ${parent} + '0']"
                                          name="scope${parent}0"
                                          id="scopes${parent}"
                                          placeholder="Enter scopes">
                                <auto-complete source="loadScopes($query)"
                                               min-length="0"
                                               template="my-custom-template"
                                               debounce-delay="0"></auto-complete>
                              </tags-input>
                              <script type="text/ng-template" id="my-custom-template">
                                <div>
                                  <span>{{data.name}}</span>
                                </div>
                              </script>`);
              $compile(angular.element("#dyScope" + parent + id).contents())($scope)
            });
          }
        }

        function managePlugin(isValid) {
          if ($scope.isKongUMARSPluginAdded) {
            updatePlugin(isValid);
          } else {
            addPlugin(isValid);
          }
        }

        function addPlugin(isValid) {
          if (!isValid) {
            MessageService.error("Invalid UMA Resources");
            return false;
          }
          var model = makeJSON($scope.modelPlugin);

          if (!model) {
            return false;
          }

          model.config.protection_document = (JSON.stringify(model.config.protection_document));
          PluginHelperService.addPlugin(
            model,
            function success(res) {
              console.log("create plugin", res)
              $scope.busy = false;
              MessageService.success('Plugin added successfully!')
              $state.go('apis') // return to plugins page if specified
            }, function (err) {
              $scope.busy = false;
              $log.error("create plugin", err)
              var errors = {}

              if (err.data.customMessage) {
                Object.keys(err.data.customMessage).forEach(function (key) {
                  errors[key.replace('config.', '')] = err.data.customMessage[key];
                  MessageService.error(key + " : " + err.data.customMessage[key]);
                })
              } else if (err.data.body) {
                Object.keys(err.data.body).forEach(function (key) {
                  errors[key] = err.data.body[key];
                  MessageService.error(key + " : " + err.data.body[key]);
                })
              } else {
                MessageService.error("Invalid UMA Resources");
              }
              $scope.errors = errors
            }, function evt(event) {
              // Only used for ssl plugin certs upload
              var progressPercentage = parseInt(100.0 * event.loaded / event.total);
              $log.debug('progress: ' + progressPercentage + '% ' + event.config.data.file.name);
            });

        }

        function updatePlugin(isValid) {
          if (!isValid) {
            MessageService.error("Invalid UMA Resources");
            return false;
          }
          var model = makeJSON($scope.modelPlugin);

          if (!model) {
            return false;
          }
          var doc = (JSON.stringify(model.config.protection_document));
          model.config = angular.copy($scope.rsPlugin.config);
          model.config.protection_document = doc;
          PluginHelperService.updatePlugin($scope.rsPlugin.id,
            model,
            function success(res) {
              console.log("update plugin", res)
              $scope.busy = false;
              MessageService.success('Plugin updated successfully!')
              $state.go('apis') // return to plugins page if specified
            }, function (err) {
              $scope.busy = false;
              $log.error("update plugin", err)
              var errors = {}

              if (err.data.customMessage) {
                Object.keys(err.data.customMessage).forEach(function (key) {
                  errors[key.replace('config.', '')] = err.data.customMessage[key];
                  MessageService.error(key + " : " + err.data.customMessage[key]);
                })
              } else if (err.data.body) {
                Object.keys(err.data.body).forEach(function (key) {
                  errors[key] = err.data.body[key];
                  MessageService.error(key + " : " + err.data.body[key]);
                })
              } else {
                MessageService.error("Invalid UMA Resources");
              }
              $scope.errors = errors
            }, function evt(event) {
              // Only used for ssl plugin certs upload
              var progressPercentage = parseInt(100.0 * event.loaded / event.total);
              $log.debug('progress: ' + progressPercentage + '% ' + event.config.data.file.name);
            });
        }

        function loadMethods(query) {
          var arr = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];
          arr = arr.filter(function (o) {
            return o.indexOf(query.toUpperCase()) >= 0;
          });
          return arr;
        }

        function loadScopes(query) {
          return [];
        }

        function makeJSON(data) {
          try {
            var model = angular.copy(data);
            var dIndex = 0;
            var sData = [];
            model.config.protection_document.forEach(function (path, pIndex) {
              path.conditions.forEach(function (cond, cIndex) {
                dIndex = 0;
                sData = [];
                var str = '{%s}';
                for (var i = 0; i < parseInt($(`input[name=hdScopeCount${pIndex}${cIndex}]`).val()); i++) {
                  var op = $(`input[name=condition${pIndex}${cIndex}${i}]:checked`).val();
                  var scopes = JSON.parse($(`input[name=hdScope${pIndex}${cIndex}${i}]`).val()).map(function (o) {
                    sData.push(o.text);
                    return {"var": dIndex++};
                  });
                  var s = "";
                  scopes.forEach(function (item) {
                    s += JSON.stringify(item) + ","
                  });
                  str = str.replace('%s', `"${op}":[${s} {%s}]`);

                  if (!!cond[`scopes${pIndex}${cIndex}${i}`]) {
                    delete cond[`scopes${pIndex}${cIndex}${i}`]
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
            });
            model.config.protection_document = JSON.parse(angular.toJson(model.config.protection_document));
            return model;
          } catch (e) {
            MessageService.error("Invalid UMA resource");
            return null;
          }
        }

        //init
        $scope.fetchData()
      }
    ])
  ;
}());
