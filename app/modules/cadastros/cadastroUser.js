angular
  .module("cadastrosUserModule", [])

  .controller("cadastrosUserController", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    "$state",
    "$timeout",
    "$stateParams",
    "$q",
    "uiGridConstants",
    function(
      $scope,
      $http,
      $rootScope,
      sysServicos,
      $cookieStore,
      $state,
      $timeout,
      $stateParams,
      $q,
      uiGridConstants
    ) {
      $scope.perfisList;
      $scope.aovList = [];
      $scope.dealerList = [];
      $scope.dealersID = [];
      $scope.listaDeDealers = [];
      $scope.selectedAov = null;
      $scope.selectedDealer = null;
      $scope.editingDealer = -1;
      $scope.hideDealerList = true;

      $scope.showAddDealer = false;
      $scope.showAddRegiao = false;

      $scope.items = [];
      $scope.dealerSelected = [];
      $scope.dealer = {};
      $scope.regioesSelected = {};
      $scope.userData = {
        perfil: null,
        acesso: {
          toyota: false,
          lexus: false
        }
      };

      $scope.getApplications = function() {
        let promise = $http.get(rootURL + "v1/contaAplicacao?todos=true");
        promise.then(
          function(ret) {
            $scope.applications = ret.data;
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $scope.getUserDetail = function() {
        let promise = $http.get(rootURL + "conta/" + $stateParams.id);
        promise.then(
          function(ret) {
            $scope.appIDs = ret.data.apps.map(i => i.applicationId);

            if ($scope.applications) {
              $scope.applications.forEach(application => {
                application.checked = $scope.appIDs.includes(
                  application.applicationId
                );
              });
            }

            $scope.userData = ret.data;
            $scope.dealer = {};
            $scope.apps = {};
            $scope.id = ret.data.id;
            $scope.apps.list = ret.data.apps;
            $scope.dealer.nome = ret.data.nome;
            $scope.dealer.email = ret.data.email;
            $scope.dealer.status = ret.data.ativo;
            $scope.dealer.dealers = ret.data.dealers;
            $scope.dealer.login = ret.data.login;
            $scope.dealer.telefone = ret.data.telefone;
            $scope.dealer.perfil = ret.data.perfil;
            $scope.dealer.perfil.nome = ret.data.perfil.nome;
            $scope.dealer.senha = null;
            $scope.listaDeDealers = ret.data.dealers.sort(function (a, b) {
              if (a.dealerNome > b.dealerNome) {
                return 1;
              }
              if (a.dealerNome < b.dealerNome) {
                return -1;
              }
              // a must be equal to b
              return 0;
            });

            if ($scope.dealer.perfil.nome !== ("Agencia" || "Consultor")) {
              $scope.selectedDealer = ret.data.dealers[0].dealerNome;
              $scope.selectedDealerName = ret.data.dealers[0].dealerNome;
              $scope.selectedDealerID = ret.data.dealers[0].dealerID;
            } else {
              $scope.selectedDealerName = "";
              $scope.selectedDealerID = "";
            }
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $scope.selectedApplications = [];

      $scope.hanldePerfilName = function(nome) {
        $scope.perfil = nome;
      };

      $scope.selectAppID = function(app) {
        app.checked = !app.checked;
      };

      $scope.voltarClickHandler = function() {
        $state.go("cadastros", { aba: "user" });
      };

      $scope.acessoChange = function() {
        $scope.showAddDealer = false;
        $scope.showAddRegiao = false;
        if ($scope.userData.perfil === "AC8E7486-A21B-41D6-B9EC-C30FD260F363") {
          // é agencia
          $scope.showAddDealer = true;
        } else if (
          $scope.userData.perfil === "ebb88ee6-1adc-4fb0-b8e3-879e18578dff" ||
          $scope.userData.perfil === "1e0396fa-5eb7-4ff8-a2d8-287377c9a0a0"
        ) {
          $scope.showAddRegiao = true;
        }
      };

      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 0,

        enableRowSelection: true,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,

        enableGridMenu: false,

        rowHeight: 40,

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //recebe numero do ato quando selecionado
          gridApi.selection.on.rowSelectionChanged($scope, function(row) {});

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions1.paginationPageSize = pageSize;
          });
        },

        columnDefs: [
          {
            name: "AOV",
            field: "aovName"
          },
          {
            name: "Dealers",
            field: "dealerName"
          },
          {
            name: "",
            field: "dealerName",
            width: 100,
            enableFiltering: false,
            cellClass: "text-right",
            cellTemplate:
              '<div><button class="btn btn-primary btn-table" type="button" title="Detalhes" ng-click="grid.appScope.editDealer(row.entity, rowRenderIndex)"><i class="fas fa-edit font-18"></i></button> <button class="btn btn-primary btn-table" type="button" title="Remover" ng-click="grid.appScope.removeDealer(row.entity, rowRenderIndex)"><i class="fas fa-close font-18"></i></button></div>'
          }
        ]
      };

      $scope.getAllDealers = function() {
        let promise = $http.get(rootURL + "dealer/consultar");
        promise.then(
          function(ret) {
            $scope.dealers = ret.data;
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $scope.choiceDealer = function() {
        $scope.hideDealerList = false;
      };

      $scope.selectDealer = function(nomeFantasia, dealerID) {
        $scope.selectedDealerName = nomeFantasia;
        $scope.selectedDealerID = dealerID;
        $scope.hideDealerList = true;
      };

      $scope.selectDealerToAgency = function(nomeFantasia, dealerID) {
        $scope.hideDealerList = true;
        $scope.listaDeDealers.push({
          dealerID: dealerID,
          dealerNome: nomeFantasia
        });
        //console.log($scope.listaDeDealers,"Lista de Dealers IDs",$scope.dealersID);
      };

      $scope.removeDealerFromList = function(obj) {
        //console.log($scope.listaDeDealers);
        var index = $scope.listaDeDealers.indexOf(obj);
        // //console.log("Remove >>> ", obj.dealerNome, obj.dealerID);
        $scope.listaDeDealers.splice(index,1);
        // //console.log("Array atualizado", $scope.listaDeDealers);
      };

      $scope.selectAnotherDealer = function() {
        $scope.selectedDealerName = "";
        $scope.selectedDealerID = "";
      };

      // SELECIONAR REGIAO E DELAER

      $scope.toggle = function(id, value, idPai) {
        let item = id;
        let acessoToSend = false;

        if (value === false) {
          // push dealer to array
          $scope.dealerSelected.push(id);

          // set checked dealer to true
          $scope.vinculos.forEach(i => {
            if (i.regiaoId == idPai) {
              i.dealers.forEach(x => {
                if (x.dealerId === id) {
                  x.temAcesso = true;
                }

                if ($scope.dealerSelected.includes(x.dealerId)) {
                  i.temAcesso = true;
                }
              });

              // check regiao
              i.adicionarNovosDealersAutomaticamente = i.dealers.every(
                dealer => dealer.temAcesso
              );

              if (i.adicionarNovosDealersAutomaticamente) {
                i.temAcesso = false;
                acessoToSend = true;
              }
            }
          });

          $scope.regioesSelected[idPai] = {
            regiaoId: idPai,
            adicionarNovosDealersAutomaticamente: acessoToSend
          };
        } else {
          let removeDealer = $scope.dealerSelected.filter(id => id !== item);
          $scope.dealerSelected = removeDealer.map(id => id);

          delete $scope.regioesSelected[idPai];

          // set checked dealer to false
          $scope.vinculos.forEach(i => {
            i.temAcesso = false;

            if (i.regiaoId == idPai) {
              i.dealers.forEach(x => {
                if (x.dealerId === id) {
                  x.temAcesso = false;
                }

                if ($scope.dealerSelected.includes(x.dealerId)) {
                  i.temAcesso = true;
                  $scope.regioesSelected[idPai] = {
                    regiaoId: idPai,
                    adicionarNovosDealersAutomaticamente: acessoToSend
                  };
                }
              });

              // discheck regiao
              i.adicionarNovosDealersAutomaticamente = i.dealers.every(
                dealer => dealer.temAcesso
              );

              if (i.adicionarNovosDealersAutomaticamente) {
                i.temAcesso = false;
              }
            }
          });
        }
      };

      $scope.toggleAll = function(regiao, value) {
        if (value === false) {
          $scope.vinculos.forEach(i => {
            if (i.regiaoId == regiao) {
              i.adicionarNovosDealersAutomaticamente = true;
              i.temAcesso = false;

              $scope.regioesSelected[regiao] = {
                regiaoId: regiao,
                adicionarNovosDealersAutomaticamente:
                  i.adicionarNovosDealersAutomaticamente
              };

              i.dealers.forEach(x => {
                $scope.dealerSelected.push(x.dealerId);
                x.temAcesso = true;
              });
            }
          });
        } else {
          $scope.vinculos.forEach(i => {
            if (i.regiaoId == regiao) {
              i.adicionarNovosDealersAutomaticamente = false;
              delete $scope.regioesSelected[regiao];

              i.dealers.forEach(x => {
                let item = x.dealerId;

                let removeDealer = $scope.dealerSelected.filter(
                  dealerId => dealerId !== item
                );
                $scope.dealerSelected = removeDealer.map(dealerId => dealerId);
                x.temAcesso = false;
              });
            }
          });
        }
      };
      // SELECIONAR REGIAO E DELAER FIM

        $scope.newUser = function () {
        if ($scope.dealer.login) {
          if ($scope.dealer.login.indexOf(' ') >= 0) {
              sysServicos.sendWarnMsg("Login inválido, informe um nome de usuário sem espaços.");
              return;
          }
        }

        if (!$scope.perfil){
            sysServicos.sendWarnMsg("Informe a Categoria de Acesso.");
            return;
        }

        let regioesIds = Object.values($scope.regioesSelected);

        objEnvio = {};

        if (
          $scope.dealer.perfil.nome !== "Agencia" &&
          $scope.dealer.perfil.nome !== "Colsultor"
        ) {
          objEnvio.dealerID = $scope.selectedDealerID;
        } else {
          objEnvio.dealerIDs = $scope.listaDeDealers.map(i => i.dealerID);
        }
        objEnvio.nome = $scope.dealer.nome;
        objEnvio.nomeUsuario = $scope.dealer.login;
        objEnvio.email = $scope.dealer.email;
        objEnvio.senha = $scope.dealer.senha;
        objEnvio.senhaConfirmacao = $scope.dealer.confirmaSenha;
        objEnvio.telefone = $scope.dealer.telefone;
        objEnvio.applicationIDs = $scope.applications
          .filter(app => app.checked)
          .map(app => app.applicationId);

        objEnvio.regioes = regioesIds;
        objEnvio.dealerIDs = $scope.dealerSelected;

        switch ($scope.perfil) {
          case "Dealer":
            $scope.perfil = "dealer";
            break;
          case "Agencia":
            $scope.perfil = "agencia";
            break;
          case "Financeiro":
            $scope.perfil = "financeiro";
            break;
          case "Auditor":
            $scope.perfil = "auditor";
            break;
          case "Administrator":
            $scope.perfil = "administrador";
            break;
          case "Consultor":
            $scope.perfil = "Consultor";
            break;
        }

        let promise = $http.post(
          rootURL + "conta/" + $scope.perfil + "/criar",
          objEnvio
        );
        promise.then(
          function(ret) {
            sysServicos.sendSuccessMsg("Usuário criado com sucesso!");
            $state.go("cadastros");
          },
          function(error) {
            if (error.data == null){
                sysServicos.sendErrorMsg(
                    error.status,
                    error.statusText,
                    error.config.url,
                    "Falha ao criar usuário."
                );
            }
            else {
                sysServicos.sendErrorMsg(
                    error.status,
                    error.statusText,
                    error.config.url,
                    error.data.message
                );
            }
          }
        );
      };

      $scope.updateUser = function() {
        let regioesIds = Object.values($scope.regioesSelected);
        objEnvio = {};

        if (
          $scope.dealer.perfil.nome !== "Agencia" &&
          $scope.dealer.perfil.nome !== "Consultor"
        ) {
          objEnvio.dealerIDs = $scope.selectedDealerID;
        } else {
          objEnvio.dealerIDs = $scope.listaDeDealers.map(i => i.dealerID);
        }

        objEnvio.nome = $scope.dealer.nome;
        objEnvio.nomeUsuario = $scope.dealer.login;
        objEnvio.email = $scope.dealer.email;
        objEnvio.senha = $scope.dealer.senha || null;
        objEnvio.senhaConfirmacao = $scope.dealer.confirmaSenha || null;
        objEnvio.telefone = $scope.dealer.telefone;
        objEnvio.applicationIDs = $scope.applications
          .filter(app => app.checked)
          .map(app => app.applicationId);

        objEnvio.regioes = regioesIds;

        switch ($scope.dealer.perfil.nome) {
          case "Dealer":
            $scope.perfil = "dealer";
            break;
          case "Agencia":
            $scope.perfil = "agencia";
            break;
          case "Financeiro":
            $scope.perfil = "financeiro";
            break;
          case "Auditor":
            $scope.perfil = "auditor";
            break;
          case "Administrator":
            $scope.perfil = "administrador";
            break;
        }

        let promise = $http.patch(
          rootURL +
            "conta/" +
            $scope.dealer.perfil.nome +
            "/" +
            $stateParams.id +
            "/alterar",
          objEnvio
        );

        promise.then(
          function(ret) {
            sysServicos.sendSuccessMsg("Dados atualizados com sucesso!");
            $state.go("cadastrosUser", {
              id: $stateParams.id
            });
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.message
            );
          }
        );
      };

      $scope.inactivateUser = function() {
        let promise = $http.patch(
          rootURL + "conta/" + $stateParams.id + "/inativar"
        );
        promise.then(
          function() {
            sysServicos.sendSuccessMsg("Usuário inativado com sucesso!");
            $scope.getUserDetail();
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $scope.activateUser = function() {
        let promise = $http.patch(
          rootURL + "conta/" + $stateParams.id + "/ativar"
        );
        promise.then(
          function() {
            sysServicos.sendSuccessMsg("Usuário ativado com sucesso!");
            $scope.getUserDetail();
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $scope.editDealer = function(item, index) {
        $scope.editingDealer = index;
        $scope.selectedAov = {
          label: item.aovName,
          value: item.aovId
        };
        $scope.selectedAov = JSON.stringify($scope.selectedAov);
        $scope.selectedDealer = {
          label: item.dealerName,
          value: item.dealerId
        };
        $scope.selectedDealer = JSON.stringify($scope.selectedDealer);
      };

      $scope.removeDealer = function(item, index) {
        $scope.gridOptions1.data.splice(index, 1);
      };

      $scope.aovChange = function(item) {
        //console.log("aovChange", $scope.selectedAov);
      };

      $scope.dealerChange = function(item) {
        //console.log("dealerChange", $scope.selectedDealer);
      };

      $scope.getPerfis = function() {
        return $q(function(resovle, reject) {
          let promise = $http.get(rootURL + "v1/perfis/");
          promise.then(
            function(ret) {
              $scope.perfisList = ret.data;
              resovle();
            },
            function(err) {
              sysServicos.sendErrorMsg(
                err.status,
                err.statusText,
                err.config.url
              );
              reject();
            }
          );
        });
      };

      $scope.getRegionais = function() {
        return $q(function(resovle, reject) {
          let promise = $http.get(rootURL + "v1/regionais/");
          promise.then(
            function(ret) {
              $scope.aovList = ret.data;
              $scope.aovList.forEach(function(element) {
                element.selected = false;
              });
              resovle();
            },
            function(err) {
              sysServicos.sendErrorMsg(
                err.status,
                err.statusText,
                err.config.url
              );
              reject();
            }
          );
        });
      };

      $scope.getAllVinculos = function() {
        let promise = $http({
          method: "GET",
          url: rootURL + "dealer//pra-vincular",
          params: {
            userId: $stateParams.id || null
          }
        });
        promise.then(
          function(ret) {
            $scope.vinculos = ret.data;

            $scope.vinculos.forEach(i => {
              if (i.temAcesso === true) {
                $scope.regioesSelected[i.regiaoId] = {
                  regiaoId: i.regiaoId,
                  adicionarNovosDealersAutomaticamente:
                    i.adicionarNovosDealersAutomaticamente
                };
              }

              i.dealers.forEach(x => {
                if (x.temAcesso === true) {
                  $scope.dealerSelected.push(x.dealerId);
                }
              });

              if (i.adicionarNovosDealersAutomaticamente === true) {
                i.temAcesso = false;
              }
            });

            // //console.log($scope.regioesSelected);
            // //console.log($scope.dealerSelected);
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $scope.init = function() {
        $scope.getApplications();
        if ($stateParams.id)
            $scope.getUserDetail();
        $scope.getAllDealers();
        $scope.getAllVinculos();

        $scope
          .getPerfis()
          .then(function(res) {
            return $scope.getRegionais();
          });
      };
      $scope.init();

      $scope.openListTable = function(id) {
        $("#listRegiao_" + id).toggleClass("hide");
        $("#btnPlusR_" + id).toggleClass("plus-minus");
      };
    }
  ]);
