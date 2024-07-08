//auditoria.controller.js
angular
  .module("auditoriaModule", [])
  .controller("auditoriaController", [
    "$scope",
    "$q",
    "$http",
    "$state",
    "$stateParams",
    "$location",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    function(
      $scope,
      $q,
      $http,
      $state,
      $stateParams,
      $location,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $cookieStore,
      applicationService,
      auditoriaService,
      uiGridConstants
    ) {
      $scope.abas = [
        {
          label: "Recebimento",
          value: "recebimento",
          quota: 0,
          showQuota: true,
          show: true
        },
        {
          label: "Validação",
          value: "validacao",
          quota: 0,
          showQuota: true,
          show: true
        },
        {
          label: "Inconsistência",
          value: "inconsistencia",
          showQuota: true,
          quota: 0,
          show: true
        },
        {
          label: "Tratativa de inconsistência",
          value: "tratativa",
          showQuota: true,
          quota: 0,
          show: true
        },
        {
          label: "Fechamento",
          value: "fechamento",
          showQuota: true,
          quota: 0,
          show: true
        },
        {
          label: "Processos",
          value: "processos",
          showQuota: false,
          quota: 0,
          show: true
        }
      ];

      //relaciona os status recebidos pela API com os elementos da ABA por index do array
      $scope.statusAbas = [[3], [4], [6], [20], [5]];
      $scope.abaActive = -1;

      $scope.gridConstantsChangeOptions = uiGridConstants.dataChange.OPTIONS;

      $scope.changeAba = function(aba) {
        $scope.abaActive = aba;
        $location.search({
          aba: $scope.abaActive
        });
      };

      $scope.updateChildrens = function() {
        if (window.onAuditoriaAbaChange) {
          window.onAuditoriaAbaChange();
        }
      };

      $scope.updateView = function() {
        return $q(function(resolve, reject) {
          auditoriaService
            .getContagem()
            .then(function(res) {
              $scope.statusAbas.forEach(function(element, index, array) {
                $scope.abas[index].quota = getContagemAba(element, res.data);
              });
              resolve(res);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(response);
            });
        });
      };

      function getContagemAba(status, statusList) {
        var result = 0;
        statusList.forEach(function(iten) {
          if (status.indexOf(iten.status) !== -1) {
            result += iten.contagem;
          }
        });
        return result;
      }

      function validaUsuarioAbaProcesso() {
        return $q(function(resolve, reject) {
          try {
            setTimeout(function() {
              resolve();
            }, 1500);
          } catch (error) {
            reject(error);
          }
        });
      }

      $scope.setAbaByQueryParams = function() {
        return $q(function(resolve, reject) {
          var queryParams = $location.search();
          console.log("setAbaByQueryParams >> ", queryParams);
          if (queryParams.aba) {
            $scope.abas.forEach(function(element, index) {
              if (element.value === queryParams.aba) {
                $scope.abaActive = element.value;
                console.log(queryParams.aba);
              }
            });
          } else {
            $scope.changeAba($scope.abas[0].value);
          }
        });
      };

      $scope.init = function() {
        validaUsuarioAbaProcesso()
          .then(function(res) {
            return $scope.updateView();
          })
          .then(function(res) {
            return $scope.setAbaByQueryParams();
          })
          .then(function(res) {
            console.log(" >> init complete ", queryParams);
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
            reject(error);
          });
      };

      $scope.init();
    }
  ])

  // CONTROLLER ABA DE RECEBIMENTO
  .controller("auditoriaRecebimentoController", [
    "$scope",
    "$q",
    "$http",
    "$state",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    function(
      $scope,
      $q,
      $http,
      $state,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $cookieStore,
      applicationService,
      auditoriaService,
      uiGridConstants
    ) {
      $scope.acaoRecebidaSelected = null;

      $scope.buscaData = {
        marca: "",
        dealer: "",
        nota: ""
      };

      // GRID AÇÕES RECEBIDAS
      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: true,
        enableSelectAll: true,
        enableRowHeaderSelection: true,

        multiSelect: true,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi1 = gridApi;
          $scope.gridApi1.selection.clearSelectedRows();
          $scope.gridApi1.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );
          //recebe numero do registro quando selecionado
          $scope.gridApi1.selection.on.rowSelectionChanged($scope, function(
            row
          ) {
            var itens = $scope.gridApi1.selection.getSelectedRows();
            if (itens.length === 0) {
              $scope.acaoRecebidaSelected = null;
            } else {
              $scope.acaoRecebidaSelected = itens;
            }
          });
          $scope.gridApi1.selection.on.rowSelectionChangedBatch(
            $scope,
            function(rows) {
              console.log("rowSelectionChangedBatch");
              // $scope.fecharLote();
            }
          );
          //evento de mudanca da qtde de registros visiveis na tabela
          $scope.gridApi1.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Nota Débito",
            field: "nota",
            width: 120,
            cellTemplate: "<div>{{row.entity.budgetDealerID}}</div>"
          },
          {
            name: "Ano",
            field: "anoFiscal",
            width: 80,
            cellTemplate: "<div>{{row.entity.anoFiscal}}</div>"
          },
          {
            name: "Mês",
            field: "mes",
            width: 80,
            cellTemplate: "<div>{{row.entity.mes}}</div>"
          },
          // {
          //   name: "Valor Total",
          //   width: 90,
          //   cellTemplate: "<div>{{row.entity.valorTotal | currency}}</div>"
          // },
          {
            name: "Cód. Dealer",
            field: "codigoDealer"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Data Emissão",
            field: "dataEmissao",
            width: 150,
            cellTemplate:
              '<div>{{row.entity.dataEmissao | date: "dd/MM/yyyy" }}</div>'
          },
          {
            name: "Dias Fila",
            field: "diasNoStatus"
          },
          {
            name: "Quantidade de Notas",
            field: "qtdNotas",
            width: 80
          },
          {
            name: "Ação",
            field: "budgetDealerID",
            enableFiltering: false,

            cellTemplate:
              '<button style="margin:1px" class="btn  btn-table btn-reopen" type="button" title="Reabrir" ng-click="grid.appScope.onReabrirClick(row.entity)"><i class="far fa-folder-open"></i> Reabrir</button>'
          }
        ]
      };

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onReabrirClick = function(value) {
        console.log(" >>> click", value);
        auditoriaService
          .pathReabrir(value.budgetDealerID)
          .then(function(res) {
            console.log(" >>> ", res);
            sysServicos.sendSuccessMsg("Reaberto com sucesso!");
            $scope.updateView();
            $scope.getListaReabertos();
            $scope.onBuscaClick();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      // GRID AÇÕES REABERTAS
      $scope.gridOptions2 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Data de Reabertura",
            field: "dataHoraReabertura",
            cellTemplate:
              '<div>{{row.entity.dataHoraReabertura | date: "dd/MM/yyyy" }}</div>'
          },
          {
            name: "Hora de Reabertura",
            field: "dataHoraReabertura",
            cellTemplate:
              '<div>{{row.entity.dataHoraReabertura | date: "HH:mm:ss" }}</div>'
          },
          {
            name: "Dealer",
            field: "dealer"
          }
        ]
      };

      $scope.getListaRecebimento = function() {
        return $q(function(resolve, reject) {
          $scope.buscaData.marca = $scope.$parent.$parent.marcaActive;
          console.log($scope.buscaData);
          auditoriaService
            .getListaRecebimento($scope.buscaData)
            .then(function(result) {
              console.log(" >>> result", result);
              $scope.gridOptions1.data = result.data;
              resolve();
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
            });
        });
      };

      $scope.getListaReabertos = function() {
        return $q(function(resolve, reject) {
          $scope.buscaData.marca = $scope.$parent.$parent.marcaActive;
          console.log($scope.buscaData);
          auditoriaService
            .getListaReabertos($scope.buscaData)
            .then(function(result) {
              console.log(" >>> result", result);
              $scope.gridOptions2.data = result.data;
              resolve();
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
            });
        });
      };

      function getContagemAba(status, statusList) {
        var result = 0;
        statusList.forEach(function(iten) {
          if (status.indexOf(iten.status) !== -1) {
            result += iten.contagem;
          }
        });
        return result;
      }

      $scope.updateView = function() {
        console.log("Chamou a ffunção de update da View");
        return $q(function(resolve, reject) {
          auditoriaService
            .getContagem($scope.marcaActive)
            .then(function(res) {
              $scope.statusAbas.forEach(function(element, index, array) {
                $scope.abas[index].quota = getContagemAba(element, res.data);
              });
              resolve(res);
              console.log($scope.marcaActive);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(response);
            });
        });
      };

      $scope.onReceberClick = function() {
        var requestBody = [];
        $scope.acaoRecebidaSelected.forEach(function(element) {
          requestBody.push(element.budgetDealerID);
        });

        auditoriaService
          .pathReceber({
            budgetDealerIDs: requestBody
          })
          .then(function(res) {
            console.log("pathReceber >> ", res.data.message);
            $scope.onBuscaClick();
            sysServicos.sendSuccessMsg(res.data.message);
            $scope.getListaRecebimento();
            $scope.updateView();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.onBuscaClick = function(param1, clear) {
        // console.log(" >> onBuscaClick ", $scope.$parent.$parent.marcaActive);
        if (clear && clear === true) {
          $scope.buscaData.dealer = "";
          $scope.buscaData.nota = "";
          $scope.buscaData.ano = null;
        }
        $scope.gridOptions2.data = [];
        $scope.gridOptions1.data = [];
        $scope.acaoRecebidaSelected = null;
        $scope.getListaRecebimento($scope.buscaData).then(function(res) {
          console.log("getListaRecebimento >>>", res);
        });;
      };

      $scope.pathReabrir = function() {
        auditoriaService
          .pathReabrir()
          .then(function(res) {
            sysServicos.sendSuccessMsg("Reaberto com sucesso!");
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.loadLists = function() {
        $scope
          .getListaRecebimento()
          .then(function(res) {
            return $scope.getListaReabertos();
          })
          .catch(function(error) {
            console.log("errior", error);
          });
      };

      $scope.init = function() {
        window.onAuditoriaAbaChange = $scope.init;
        $scope.loadLists();
      };

      $scope.init();
    }
  ])

  // CONTROLLER ABA DE VALIDAÇÃO
  .controller("auditoriaValidacaoController", [
    "$scope",
    "$q",
    "$http",
    "$state",
    "$location",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    "manipulaString",
    function(
      $scope,
      $q,
      $http,
      $state,
      $location,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $cookieStore,
      applicationService,
      auditoriaService,
      uiGridConstants,
      manipulaString
    ) {
      $scope.rowFormatter = function(row) {
        return row.entity.ativo == false;
      };

      $scope.buscaData = {
        marca: "",
        dealer: "",
        nota: "",
        ano: ""
      };

      $scope.detalheData = {};

      $scope.parecerData = {
        fileName: "Nenhum arquivo selecionado",
        budgetDealerNFID: "",
        contato: "",
        url: ""
      };

      $scope.abaActive = "validacao";
      // GRID PRINCIPAL
      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Nota Débito",
            field: "nota",
            cellTemplate: "<div>{{row.entity.budgetDealerID}}</div>"
          },
          {
            name: "Ano",
            field: "anoFiscal",
            cellTemplate: "<div>{{row.entity.anoFiscal}}</div>"
          },
          {
            name: "Mês",
            field: "mes",
            cellTemplate: "<div>{{row.entity.mes}}</div>"
          },
          {
            name: "Cód. Dealer",
            field: "codigoDealer"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Data Emissão",
            field: "dataEmissao",
            cellTemplate:
              '<div>{{row.entity.dataEmissao | date: "dd/MM/yyyy" }}</div>'
          },
          {
            name: "Dias Fila",
            field: "diasNoStatus",
            sort: {
              direction: uiGridConstants.ASC,
              priority: 1
            }
          },

          {
            name: "Itens",
            field: "qtdNotas"
          },
          {
            //botao editar
            name: "",
            width: 50,
            field: "mesano",
            enableFiltering: false,
            cellTemplate:
              '<button style="margin:1px" class="btn btn-table see-detail" type="button" title="Detalhes" ng-click="grid.appScope.onVerDetalheClick(row.entity)"><i class="fa fa-eye font-18"></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      $scope.acaoSelecionada = null;

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onVerDetalheClick = function(value) {
        $scope.abaActive = "detalhe";
        $location.search({
          aba: "validacao",
          detalhe: value.budgetDealerID
        });
        $scope.initDetalhe(value);
      };

      $scope.getListaValidacao = function() {
        return $q(function(resolve, reject) {
          $scope.buscaData.marca = $scope.$parent.$parent.marcaActive;
          auditoriaService
            .getListaValidacao($scope.buscaData)
            .then(function(result) {
              $scope.gridOptions1.data = result.data;
              resolve(result);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(error);
            });
        });
      };

      // GRID DETALHE
      $scope.gridOptions2 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Fornecedor",
            field: "fornecedor"
          },
          {
            name: "Descrição",
            field: "descricao"
          },
          {
            name: "Número PI",
            field: "numPI"
          },
          {
            name: "Número NF",
            field: "num_NF"
          },
          {
            name: "Valor",
            field: "valor",
            cellFilter: "currency"
          },
          {
            name: "Status",
            field: "status"
          },
          {
            name: "Ações",
            width: 100,
            enableFiltering: false,
            field: "budgetDealerNFID",
            cellTemplate:
              '<button class="btn-auditar" type="button" title="Ver ação" ng-click="grid.appScope.onAuditoriaClick(row.entity)"><i class="fas fa-search" font-18></i></button><button ng-class="{hasexcessao: row.entity.excessao !== 0}"  class="btn-verdetalhe" type="button" title="Adicionar Excessões" ng-click="grid.appScope.onParecerClick(row.entity)"><i class="fas fa-paperclip"></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onParecerClick = function(value) {
        $scope.abaActive = "parecer";
        $scope.initParecer(value);
      };

      $scope.onAuditoriaClick = function(value) {
        $cookieStore.put("lastAuditarAcao", $location.$$search);
        console.log(" >>> click", value, $location);
        $rootScope.auditarAcao(value);
      };

      $scope.onDetalheVoltarClick = function() {
        console.log("Chamou 3");
        $scope.abaActive = "validacao";
        $location.search({
          aba: "validacao"
        });
        $scope.init();
      };

      $scope.fileToUpload = null;

      $scope.uploadFiles = function(files, errFiles) {
        angular.forEach(files, function(file) {
          var nameFile = manipulaString.removeEspecialCaracteres(file.name);
          console.log(nameFile);
          $scope.parecerData.fileName = nameFile;

          $scope.fileToUpload = file;

          file.upload = Upload.upload({
            method: "POST",
            url: rootURL + "v2/enviar/contato",
            data: {
              files: file
            }
          });

          file.upload.then(
            function(response) {
              $timeout(function() {
                $scope.parecerData.url = response.data.result.filesUploaded[0];
                sysServicos.sendSuccessMsg("Arquivo enviado com sucesso");
              });
            },
            function(response) {
              if (response.status > 0)
                $scope.errorMsg = response.status + ": " + response.data;

              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
            },
            function(evt) {
              $scope.fileToUpload.progress = Math.min(
                100,
                parseInt((100.0 * evt.loaded) / evt.total)
              );
            }
          );
        });
      };

      $scope.removeEvidenciaFile = function() {
        $scope.parecerData.contato = null;
        $scope.parecerData.url = null;
        $scope.fileToUpload = null;
        $scope.parecerData.fileName = "Nenhum arquivo selecionado";
      };

      $scope.onParecerSalvarClick = function() {
        var requestParam = {
          budgetDealerNFID: $scope.acaoSelecionada.budgetDealerNFID,
          contato: $scope.parecerData.contato,
          url: $scope.parecerData.url
        };
        console.log(">>>> onParecerSalvarClick ", requestParam);
        auditoriaService
          .postContatoSalvar(requestParam)
          .then(function(result) {
            $scope.abaActive = "detalhe";
            $scope.removeEvidenciaFile();
            $scope.updateView();
            $scope.getListaValidacao();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
            reject(error);
          });
      };

      function getContagemAba(status, statusList) {
        var result = 0;
        statusList.forEach(function(iten) {
          if (status.indexOf(iten.status) !== -1) {
            result += iten.contagem;
          }
        });
        return result;
      }

      $scope.updateView = function() {
        return $q(function(resolve, reject) {
          auditoriaService
            .getContagem($scope.marcaActive)
            .then(function(res) {
              $scope.statusAbas.forEach(function(element, index, array) {
                $scope.abas[index].quota = getContagemAba(element, res.data);
              });
              resolve(res);
              console.log($scope.marcaActive);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(response);
            });
        });
      };

      $scope.onSalvarClickValidacoes = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };

        auditoriaService
          .pathProcessoSalvar(requestParam)
          .then(function(result) {
            console.log(" teste >> ", result);
            $scope.abaActive = "validacao";
            sysServicos.sendSuccessMsg(result.data.message);
            $scope.onDetalheVoltarClick();
            $scope.updateView();
            $scope.getListaValidacao();
          })
          .catch(function(error) {
            console.log(" >> ", error);
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.message
            );
          });
      };

      $scope.onSalvarLiberarClick = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };
        auditoriaService
          .pathProcessoSalvar(requestParam)
          .then(function(result) {
            console.log(" >> ", result);
            $scope.abaActive = "validacao";
            $scope.updateView();
            $scope.init();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
            reject(error);
          });
      };

      // GRID DETALHE
      $scope.gridOptions3 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Data",
            field: "dataContato",
            cellTemplate:
              '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.dataContato | date: "dd/MM/yyyy"}}</div>'
          },
          {
            name: "Hora",
            field: "dataContato",
            cellTemplate:
              '<div class="ui-grid-cell-contents ng-binding ng-scope">{{row.entity.dataContato | date: "HH:mm"}}</div>'
          },
          {
            name: "Contato",
            field: "contato"
          },
          {
            name: "Anexo",
            field: "url",
            cellTemplate:
              '<a href="{{ row.entity.url }}" target="_blank">Ver arquivo</a>'
          }
        ]
      };

      $scope.onParecerVoltarClick = function() {
        $scope.abaActive = "detalhe";
      };

      $scope.init = function() {
        $scope.abaActive = "validacao";
        window.onAuditoriaAbaChange = $scope.init;
        $scope.gridOptions2.data = [];
        $scope.gridOptions1.data = [];
        $scope.gridOptions3.data = [];
        var queryParams = $location.search();
        if (queryParams.detalhe) {
          $scope.abaActive = "detalhe";
          $scope.initDetalhe({
            budgetDealerID: queryParams.detalhe
          });
        } else {
          $scope.getListaValidacao().then(function(res) {});
        }
      };

      function getExt(nome) {
        let extInit = nome.lastIndexOf(".");
        let ext = nome.slice(extInit);
        return ext;
      }

      $scope.initDetalhe = function(item) {
        var requestParam = {
          BudgetDealerID: item.budgetDealerID
        };
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/cabecalho?BudgetDealerID=" +
            item.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.detalheData = response.data;
            console.log($scope.detalheData);
            $scope.getAcoesInDetail();
            $scope.getRodapeInDetail();
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };

      $scope.getAcoesInDetail = function() {
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/acoes?BudgetDealerID=" +
            $scope.detalheData.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.gridOptions2.data = response.data;
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };
      $scope.getRodapeInDetail = function() {
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/rodape?BudgetDealerID=" +
            $scope.detalheData.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.detalheData = angular.merge(
              $scope.detalheData,
              response.data
            );
            console.log("Merged data", $scope.detalheData);
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };

      //Método antigo síncrono para carregamento de informações
      //$scope.initDetalhe = function(item) {
      //  var requestParam = {
      //    BudgetDealerID: item.budgetDealerID
      //  };
      //
      //  auditoriaService
      //    .getCabecalhoAcao(requestParam)
      //    .then(function(result) {
      //      $scope.detalheData = result.data;
      //      return auditoriaService.getRodapeAcao(requestParam);
      //    })
      //    .then(function(result) {
      //      $scope.detalheData = angular.merge($scope.detalheData, result.data);
      //      return auditoriaService.getDetalhesAcao(requestParam);
      //    })
      //    .then(function(result) {
      //     $scope.gridOptions2.data = result.data;
      //    })
      //    .catch(function(response) {
      //      sysServicos.sendErrorMsg(
      //        response.status,
      //        response.statusText,
      //        response.url,
      //        response.data.message
      //      );
      //      reject(error);
      //    });
      //};

      $scope.initParecer = function(item) {
        $scope.acaoSelecionada = item;
        var requestParam = {
          BudgetDealerNFID: item.budgetDealerNFID
        };
        auditoriaService
          .getContatoListagem(requestParam)
          .then(function(result) {
            $scope.gridOptions3.data = result.data;
            console.log("Grid3", result.data);
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.onBuscaClick = function(param1, clear) {
        // console.log(" >> onBuscaClick ", $scope.$parent.$parent.marcaActive);
        if (clear && clear === true) {
          $scope.buscaData.dealer = "";
          $scope.buscaData.nota = "";
          $scope.buscaData.ano = "";
        }
        $scope.gridOptions2.data = [];
        $scope.gridOptions1.data = [];
        $scope.gridOptions3.data = [];
        $scope.getListaValidacao($scope.buscaData).then(function(res) {
          console.log("getListaValidacao >>>", res);
        });
      };

      $scope.init();
    }
  ])

  // CONTROLLER ABA DE INSCONSISTENCIA
  .controller("auditoriaInconsistenciaController", [
    "$scope",
    "$q",
    "$location",
    "$http",
    "$state",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    "manipulaString",
    function(
      $scope,
      $q,
      $location,
      $http,
      $state,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $cookieStore,
      applicationService,
      auditoriaService,
      uiGridConstants,
      manipulaString
    ) {
      $scope.rowFormatter = function(row) {
        return row.entity.ativo == false;
      };

      $scope.buscaData = {
        marca: "",
        dealer: "",
        ano: ""
      };

      $scope.detalheData = {};

      $scope.parecerData = {
        fileName: "Nenhum arquivo selecionado",
        budgetDealerNFID: "",
        contato: "",
        url: ""
      };

      $scope.abaActive = "validacao";
      // GRID PRINCIPAL
      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Nota Débito",
            field: "nota",
            width: 120,
            cellTemplate: "<div>{{row.entity.budgetDealerID}}</div>"
          },
          {
            name: "Ano",
            field: "anoFiscal",
            width: 75,
            cellTemplate: "<div>{{row.entity.anoFiscal}}</div>"
          },
          {
            name: "Mês",
            field: "mes",
            width: 80,
            cellTemplate: "<div>{{row.entity.mes}}</div>"
          },
          {
            name: "Cód. Dealer",
            field: "codigoDealer",
            width: 95
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Data Emissão",
            field: "dataEmissao",
            cellTemplate:
              '<div>{{row.entity.dataEmissao | date: "dd/MM/yyyy" }}</div>'
          },
          {
            name: "Dias Fila",
            field: "diasNoStatus",
            width: 80,
            sort: {
              direction: uiGridConstants.ASC,
              priority: 1
            }
          },
          {
            //botao editar
            name: "",
            width: 50,
            field: "mesano",
            enableFiltering: false,
            cellTemplate: // Já Alterado aqui
              '<button style="margin:1px" class="btn btn-table see-detail" type="button" title="Detalhes" ng-click="grid.appScope.onVerDetalheClick(row.entity)"><i class="fa fa-eye font-18"></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      $scope.acaoSelecionada = null;

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onVerDetalheClick = function(value) {
        console.log(" >>> click", value);
        $scope.abaActive = "detalhe";
        // TODO
        $location.search({
          aba: "inconsistencia",
          detalhe: value.budgetDealerID
        });
        $scope.initDetalhe(value);
      };

      $scope.getListaInconsistencia = function() {
        return $q(function(resolve, reject) {
          $scope.buscaData.marca = $scope.$parent.$parent.marcaActive;
          auditoriaService
            .getListaInconsistencia($scope.buscaData)
            .then(function(result) {
              $scope.gridOptions1.data = result.data;
              resolve(result);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(error);
            });
        });
      };

      // GRID DETALHE
      $scope.gridOptions2 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Fornecedor",
            field: "fornecedor"
          },
          {
            name: "Descrição",
            field: "descricao"
          },
          {
            name: "Número PI",
            field: "numPI"
          },
          {
            name: "Número NF",
            field: "num_NF"
          },
          {
            name: "Valor",
            field: "valor",
            cellFilter: "currency"
          },
          {
            name: "Status",
            field: "status"
          },
          {
            name: "",
            width: 100,
            enableFiltering: false,
            field: "budgetDealerNFID",
            cellTemplate:
              '<button class="btn-auditar" type="button" title="Auditar" ng-click="grid.appScope.onAuditoriaClick(row.entity)"><i class="fas fa-search" font-18></i></button><button ng-class="{hasexcessao: row.entity.excessao !== 0}"  class="btn-verdetalhe" type="button" title="Detalhes" ng-click="grid.appScope.onParecerClick(row.entity)"><i class="fas fa-paperclip" font-18></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onParecerClick = function(value) {
        $scope.abaActive = "parecer";
        $scope.initParecer(value);
      };

      $scope.onAuditoriaClick = function(value) {
        $rootScope.auditarAcao(value);
      };

      $scope.onDetalheVoltarValidacao = function() {
        console.log("Chamou a funçãode voltar");
        window.history.back();
      };

      $scope.onDetalheVoltarClick = function() {
        console.log("Chamou 1");
        $scope.abaActive = "validacao";
        $location.search({
          aba: "inconsistencia"
        });
        //window.history.go(-1);
        $scope.init();
      };

      $scope.fileToUpload = null;

      $scope.uploadFiles = function(files, errFiles) {
        angular.forEach(files, function(file) {
          var nameFile = manipulaString.removeEspecialCaracteres(file.name);
          $scope.parecerData.fileName = nameFile;

          $scope.fileToUpload = file;

          file.upload = Upload.upload({
            method: "POST",
            url: rootURL + "v2/enviar/contato",
            data: {
              files: file
            }
          });

          file.upload.then(
            function(response) {
              $timeout(function() {
                $scope.parecerData.url = response.data.result.filesUploaded[0];
                sysServicos.sendSuccessMsg("Arquivo enviado com sucesso");
              });
            },
            function(response) {
              if (response.status > 0)
                $scope.errorMsg = response.status + ": " + response.data;

              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
            },
            function(evt) {
              $scope.fileToUpload.progress = Math.min(
                100,
                parseInt((100.0 * evt.loaded) / evt.total)
              );
            }
          );
        });
      };

      $scope.removeEvidenciaFile = function() {
        $scope.parecerData.url = null;
        $scope.fileToUpload = null;
        $scope.parecerData.fileName = "Nenhum arquivo selecionado";
      };

      $scope.onParecerSalvarClick = function() {
        var requestParam = {
          budgetDealerNFID: $scope.acaoSelecionada.budgetDealerNFID,
          contato: $scope.parecerData.contato,
          url: $scope.parecerData.url
        };
        console.log(">>>> onParecerSalvarClick ", requestParam);
        auditoriaService
          .postContatoSalvar(requestParam)
          .then(function(result) {
            console.log(" >> ", result);
            $scope.abaActive = "detalhe";
            $scope.initDetalhe($scope.acaoSelecionada);
            $scope.updateView();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      function getContagemAba(status, statusList) {
        var result = 0;
        statusList.forEach(function(iten) {
          if (status.indexOf(iten.status) !== -1) {
            result += iten.contagem;
          }
        });
        return result;
      }

      $scope.forceUpdateTabs = function() {
        auditoriaService
          .getContagem($scope.marcaActive)
          .then(function(res) {
            $scope.statusAbas.forEach(function(element, index, array) {
              $scope.abas[index].quota = getContagemAba(element, res.data);
            });
            resolve(res);
            console.log($scope.marcaActive);
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
            reject(response);
          });
      };

      $scope.updateView = function() {
        return $q(function(resolve, reject) {
          auditoriaService
            .getContagem($scope.marcaActive)
            .then(function(res) {
              $scope.statusAbas.forEach(function(element, index, array) {
                $scope.abas[index].quota = getContagemAba(element, res.data);
              });
              resolve(res);
              console.log($scope.marcaActive);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(response);
            });
        });
      };

      $scope.onSalvarClickInconsistencia = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };
        auditoriaService
          .pathProcessoSalvar(requestParam)
          .then(function(result) {
            $scope.onDetalheVoltarClick();
            sysServicos.sendSuccessMsg(result.data.message);
            $scope.updateView();
            $scope.getListaInconsistencia();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
            reject(error);
          });
      };

      $scope.onFechamentoVoltarClick = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };

        auditoriaService
          .pathProcessoFechar(requestParam)
          .then(function(result) {
            $scope.abaActive = "validacao";
            sysServicos.sendSuccessMsg(result.data.message);
            $scope.updateView();
            $scope.getListaInconsistencia();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.onSalvarLiberarClick = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };
        auditoriaService
          .pathProcessoSalvar(requestParam)
          .then(function(result) {
            $scope.abaActive = "validacao";
            $scope.init();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
            reject(error);
          });
      };

      // GRID DETALHE
      $scope.gridOptions3 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Data",
            field: "dataContato",
            cellTemplate:
              '<div>{{row.entity.dataContato | date: "dd-MM-yyyy" }}</div>'
          },
          {
            name: "Hora",
            field: "dataContato",
            cellTemplate:
              '<div>{{row.entity.dataContato | date: "HH:MM" }}</div>'
          },
          {
            name: "Parecer",
            field: "contato"
          },
          {
            name: "Anexo",
            field: "ver anexo",
            cellTemplate:
              "<a href={{row.entity.url}} target=_blank>Ver anexo</a>"
          }
        ]
      };

      $scope.onParecerVoltarClick = function() {
        $scope.abaActive = "detalhe";
      };

      $scope.init = function() {
        window.onAuditoriaAbaChange = $scope.init;
        $scope.abaActive = "validacao";

        $scope.gridOptions2.data = [];
        $scope.gridOptions1.data = [];
        $scope.gridOptions3.data = [];

        var queryParams = $location.search();
        console.log("init with queryParams", queryParams);
        if (queryParams.detalhe) {
          $scope.abaActive = "detalhe";
          $scope.initDetalhe({
            budgetDealerID: queryParams.detalhe
          });
        } else {
          $scope.getListaInconsistencia().then(function(res) {
            console.log("getListaValidacao >>>", res);
          });
        }
      };

      $scope.initDetalhe = function(item) {
        console.log('Caiu no Init Detalhe')
        var requestParam = {
          BudgetDealerID: item.budgetDealerID
        };
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/cabecalho?BudgetDealerID=" +
            item.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.detalheData = response.data;
            console.log($scope.detalheData);
            $scope.getAcoesInDetail();
            $scope.getRodapeInDetail();
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };

      $scope.getAcoesInDetail = function() {
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/acoes?BudgetDealerID=" +
            $scope.detalheData.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.gridOptions2.data = response.data;
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };
      $scope.getRodapeInDetail = function() {
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/rodape?BudgetDealerID=" +
            $scope.detalheData.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.detalheData = angular.merge(
              $scope.detalheData,
              response.data
            );
            console.log("Merged data", $scope.detalheData);
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };

      //Método antigo síncrono para carregamento de detalhe
      //$scope.initDetalhe = function(item) {
      //  var requestParam = {
      //     BudgetDealerID: item.budgetDealerID
      //  };
      //  auditoriaService
      //    .getCabecalhoAcao(requestParam)
      //     .then(function(result) {
      //      $scope.detalheData = result.data;
      //       return auditoriaService.getRodapeAcao(requestParam);
      //    })
      //    .then(function(result) {
      //      $scope.detalheData = angular.merge($scope.detalheData, result.data);
      //      return auditoriaService.getDetalhesAcao(requestParam);
      //    })
      //    .then(function(result) {
      //      $scope.gridOptions2.data = result.data;
      //    })
      //    .catch(function(response) {
      //      sysServicos.sendErrorMsg(
      //        response.status,
      //        response.statusText,
      //        response.url,
      //        response.data.message
      //      );
      //    });
      //};

      $scope.initParecer = function(item) {
        $scope.acaoSelecionada = item;
        var requestParam = {
          BudgetDealerNFID: item.budgetDealerNFID
        };
        auditoriaService
          .getContatoListagem(requestParam)
          .then(function(result) {
            console.log(
              ">> go parecer",
              $scope.acaoSelecionada,
              "GRID 3",
              result.data
            );
            $scope.gridOptions3.data = result.data;
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.onBuscaClick = function(param1, clear) {
        // console.log(" >> onBuscaClick ", $scope.$parent.$parent.marcaActive);
        if (clear && clear === true) {
          $scope.buscaData.dealer = "";
          $scope.buscaData.nota = "";
          $scope.buscaData.ano = "";
        }
        $scope.gridOptions2.data = [];
        $scope.gridOptions1.data = [];
        $scope.gridOptions3.data = [];
        $scope.getListaInconsistencia($scope.buscaData).then(function(res) {
          console.log("getListaInconsistencia >>>", res);
        });
      };

      $scope.init();
    }
  ])

  // CONTROLLER ABA DE TRATATIVA
  .controller("auditoriaTratativaController", [
    "$scope",
    "$q",    
    "$location",
    "$http",
    "$state",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    "manipulaString",
    function(
      $scope,
      $q,
      $location,
      $http,
      $state,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $cookieStore,
      applicationService,
      auditoriaService,
      uiGridConstants,
      manipulaString
    ) {
      $scope.rowFormatter = function(row) {
        return row.entity.ativo == false;
      };

      $scope.buscaData = {
        marca: "",
        dealer: "",
        nota: "",
        ano: ""
      };

      $scope.detalheData = {};

      $scope.parecerData = {
        fileName: "Nenhum arquivo selecionado",
        budgetDealerNFID: "",
        contato: "",
        url: ""
      };

      $scope.abaActive = "validacao";
      // GRID PRINCIPAL
      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Nota Débito",
            field: "nota",
            width: 120,
            cellTemplate: "<div>{{row.entity.budgetDealerID}}</div>"
          },
          {
            name: "Ano",
            field: "anoFiscal",
            width: 90,
            cellTemplate: "<div>{{row.entity.anoFiscal}}</div>"
          },
          {
            name: "Mês",
            field: "mes",
            width: 80,
            cellTemplate: "<div>{{row.entity.mes}}</div>"
          },
          {
            name: "Cód. Dealer",
            field: "codigoDealer",
            width: 95
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Data Emissão",
            field: "dataEmissao",
            cellTemplate:
              '<div>{{row.entity.dataEmissao | date: "dd/MM/yyyy" }}</div>'
          },
          {
            name: "Dias Fila",
            field: "diasNoStatus",
            width: 80,
            sort: {
              direction: uiGridConstants.ASC,
              priority: 1
            }
          },
          {
            //botao editar
            name: "",
            width: 50,
            field: "mesano",
            enableFiltering: false,
            cellTemplate: // Já Alterado aqui
            '<button style="margin:1px" class="btn btn-table see-detail" type="button" title="Detalhes" ng-click="grid.appScope.onVerDetalheClick(row.entity)"><i class="fa fa-eye font-18"></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      $scope.acaoSelecionada = null;

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onVerDetalheClick = function(value) {
       console.log(" >>> click", value.budgetDealerID);
        $scope.abaActive = "detalhe";
        $location.search({
          aba: "tratativa",
          detalhe: value.budgetDealerID
        })        
        $scope.initDetalhe(value);
      };

      $scope.getListaTratados = function() {
        return $q(function(resolve, reject) {
          $scope.buscaData.marca = $scope.$parent.$parent.marcaActive;
          console.log($scope.buscaData);
          auditoriaService
            .getListaTratados($scope.buscaData)
            .then(function(result) {
              console.log("getListaTratados >>> result", result);
              $scope.gridOptions1.data = result.data;
              $scope.listaTratados = result.data;
              console.log("teste 2", $scope.listaTratados);
              resolve(result);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(error);
            });
        });
      };

      //mock
      $scope.mockValidacao = function() {
        var mok = {
          budgetDealerID: 0,
          marca: "string",
          percentual: 0,
          nota: "string",
          mesano: "03/19",
          valorTotal: 1110,
          codigoDealer: "string",
          dealer: "Nome Dealer",
          dataEmissao: "2019-03-21T16:55:50.988Z",
          status: "string",
          diasNoStatus: 0
        };
        $scope.gridOptions1.data = [];

        for (let i = 0; i < 50; i++) {
          $scope.gridOptions1.data.push(mok);
        }
      };
      // $scope.mockValidacao();

      // GRID DETALHE
      $scope.gridOptions2 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Fornecedor",
            field: "fornecedor"
          },
          {
            name: "Descrição",
            field: "descricao"
          },
          {
            name: "Número PI",
            field: "numPI"
          },
          {
            name: "Número NF",
            field: "num_NF"
          },
          {
            name: "Valor",
            field: "valor",
            cellFilter: "currency"
          },
          {
            name: "Status",
            field: "status"
          },
          {
            name: "Ações",
            width: 100,
            enableFiltering: false,
            field: "budgetDealerNFID",
            cellTemplate:
              '<button class="btn-auditar" type="button" title="Auditar" ng-click="grid.appScope.onAuditoriaClick(row.entity)"><i class="fas fa-search font-18"></i></button><button ng-class="{hasexcessao: row.entity.excessao !== 0}" class="btn-verdetalhe" type="button" title="Detalhes" ng-click="grid.appScope.onParecerClick(row.entity)"><i  class="fas fa-paperclip font-18"></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onParecerClick = function(value) {
        $scope.abaActive = "parecer";
        $scope.initParecer(value);
      };

      $scope.onAuditoriaClick = function(value) {
        console.log(" >>> click", value);
        $rootScope.auditarAcao(value);
      };

      $scope.onDetalheVoltarClick = function(value) {
        console.log("Chamou 2");
        $scope.abaActive = "validacao";
        $location.search({
          aba: "tratativa"
        });
        //window.history.go(-1);
        $scope.init();
      };

      $scope.fileToUpload = null;

      $scope.uploadFiles = function(files, errFiles) {
        angular.forEach(files, function(file) {
          var nameFile = manipulaString.removeEspecialCaracteres(file.name);
          console.log(nameFile);
          $scope.parecerData.fileName = nameFile;

          $scope.fileToUpload = file;

          file.upload = Upload.upload({
            method: "POST",
            url: rootURL + "v2/enviar/contato",
            data: {
              files: file
            }
          });

          file.upload.then(
            function(response) {
              $timeout(function() {
                $scope.parecerData.url = response.data.result.filesUploaded[0];
                sysServicos.sendSuccessMsg("Arquivo enviado com sucesso");
              });
            },
            function(response) {
              if (response.status > 0)
                $scope.errorMsg = response.status + ": " + response.data;

              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
            },
            function(evt) {
              $scope.fileToUpload.progress = Math.min(
                100,
                parseInt((100.0 * evt.loaded) / evt.total)
              );
            }
          );
        });
      };

      $scope.removeEvidenciaFile = function() {
        $scope.parecerData.url = null;
        $scope.fileToUpload = null;
        $scope.parecerData.fileName = "Nenhum arquivo selecionado";
      };

      $scope.onParecerSalvarClick = function() {
        var requestParam = {
          budgetDealerNFID: $scope.acaoSelecionada.budgetDealerNFID,
          contato: $scope.parecerData.contato,
          url: $scope.parecerData.url
        };
        console.log(">>>> onParecerSalvarClick ", requestParam);
        auditoriaService
          .postContatoSalvar(requestParam)
          .then(function(result) {
            console.log(" >> ", result);
            $scope.abaActive = "detalhe";
            $scope.updateView();
            $scope.initDetalhe();
          })
          .catch(function(error) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.onSalvarClick = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };
        auditoriaService
          .pathProcessoSalvar(requestParam)
          .then(function(result) {
            console.log(" >> ", result);
            $scope.abaActive = "validacao";
            $scope.updateView();
            $scope.getListaTratados();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.reload = function() {
        window.location.reload();
      };

      function getContagemAba(status, statusList) {
        var result = 0;
        statusList.forEach(function(iten) {
          if (status.indexOf(iten.status) !== -1) {
            result += iten.contagem;
          }
        });
        return result;
      }

      $scope.updateView = function() {
        return $q(function(resolve, reject) {
          auditoriaService
            .getContagem($scope.marcaActive)
            .then(function(res) {
              $scope.statusAbas.forEach(function(element, index, array) {
                $scope.abas[index].quota = getContagemAba(element, res.data);
              });
              resolve(res);
              console.log($scope.marcaActive);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(response);
            });
        });
      };

      $scope.onFechamentoVoltarClick = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };

        auditoriaService
          .pathProcessoFechar(requestParam)
          .then(function(result) {
            $scope.abaActive = "validacao";
            sysServicos.sendSuccessMsg(result.data.message);
            $scope.updateView();
            $scope.getListaTratados();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.onSalvarLiberarClick = function() {
        var requestParam = {
          BudgetDealerID: $scope.detalheData.budgetDealerID
        };
        auditoriaService
          .pathProcessoSalvar(requestParam)
          .then(function(result) {
            console.log(" >> ", result);
            $scope.abaActive = "validacao";
            $scope.init();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      // GRID DETALHE
      $scope.gridOptions3 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Usuário",
            field: "marca"
          },
          {
            name: "Data",
            field: "codigoDealer"
          },
          {
            name: "Hora",
            field: "nota"
          },
          {
            name: "Parecer",
            field: "mesano"
          },
          {
            name: "Nome Anexo",
            field: "valorTotal",
            cellFilter: "currency"
          }
        ]
      };

      $scope.onParecerVoltarClick = function() {
        $scope.abaActive = "detalhe";
      };

      $scope.init = function() {       

        window.onAuditoriaAbaChange = $scope.init;
        $scope.abaActive = "validacao";

        $scope.gridOptions2.data = [];
        $scope.gridOptions1.data = [];
        $scope.gridOptions3.data = [];

        var queryParams = $location.search();
        console.log("init with queryParams", queryParams);
        if (queryParams.detalhe) {
          $scope.abaActive = "detalhe";
          $scope.initDetalhe({
            budgetDealerID: queryParams.detalhe
          });
        } else {
          $scope.getListaTratados().then(function(res) {
            console.log("getListaTratados >>>", res);
          });
        }
      };

      $scope.initDetalhe = function(item) {
        console.log('Tratativa - Caiu no InitDetalhe')
        var requestParam = {
          BudgetDealerID: item.budgetDealerID
        };
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/cabecalho?BudgetDealerID=" +
            item.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.detalheData = response.data;
            console.log($scope.detalheData);
            $scope.getAcoesInDetail();
            $scope.getRodapeInDetail();
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };

      $scope.getAcoesInDetail = function() {
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/acoes?BudgetDealerID=" +
            $scope.detalheData.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.gridOptions2.data = response.data;
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };
      $scope.getRodapeInDetail = function() {
        let promise = $http.get(
          rootURL +
            "auditoria/detalhes/rodape?BudgetDealerID=" +
            $scope.detalheData.budgetDealerID
        );
        promise.then(
          function(response) {
            $scope.detalheData = angular.merge(
              $scope.detalheData,
              response.data
            );
            console.log("Merged data", $scope.detalheData);
          },
          function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.Message
            );
          }
        );
      };

      //Método antigo síncrono para carregamento de detalhe
      //$scope.initDetalhe = function(item) {
      //  var requestParam = {
      //    BudgetDealerID: item.budgetDealerID
      //  };
      //  auditoriaService
      //    .getCabecalhoAcao(requestParam)
      //    .then(function(result) {
      //      $scope.detalheData = result.data;
      //      return auditoriaService.getRodapeAcao(requestParam);
      //    })
      //    .then(function(result) {
      //      $scope.detalheData = angular.merge($scope.detalheData, result.data);
      //      return auditoriaService.getDetalhesAcao(requestParam);
      //    })
      //    .then(function(result) {
      //      $scope.gridOptions2.data = result.data;
      //    })
      //    .catch(function(response) {
      //      sysServicos.sendErrorMsg(
      //        response.status,
      //        response.statusText,
      //        response.url,
      //        response.data.message
      //      );
      //    });
      //};

      $scope.initParecer = function(item) {
        $scope.acaoSelecionada = item;
        var requestParam = {
          BudgetDealerNFID: item.budgetDealerNFID
        };
        auditoriaService
          .getContatoListagem(requestParam)
          .then(function(result) {
            console.log(">> go parecer", result.data);
            $scope.parecer = result.data;
            $scope.gridOptions3.data = result.data;
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.onBuscaClick = function(param1, clear) {
        // console.log(" >> onBuscaClick ", $scope.$parent.$parent.marcaActive);
        if (clear && clear === true) {
          $scope.buscaData.dealer = "";
          $scope.buscaData.nota = "";
          $scope.buscaData.ano = "";
        }
        $scope.gridOptions2.data = [];
        $scope.gridOptions1.data = [];
        $scope.gridOptions3.data = [];
        $scope.getListaTratados($scope.buscaData).then(function(res) {
          console.log("getListaTratados >>>", res);
        });
      };

      $scope.init();
    }
  ])

  // CONTROLLER ABA DE FECHAMENTO
  .controller("auditoriaFechamentoController", [
    "$scope",
    "$q",
    "$http",
    "$state",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    function(
      $scope,
      $q,
      $http,
      $state,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $cookieStore,
      applicationService,
      auditoriaService,
      uiGridConstants
    ) {
      $scope.acaoRecebidaSelected = null;

      $scope.rowFormatter = function(row) {
        return row.entity.ativo == false;
      };

      $scope.buscaData = {
        marca: "",
        dealer: "",
        nota: "",
        ano: ""
      };

      $scope.reabertura = {}

      // GRID AÇÕES RECEBIDAS
      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: true,
        enableSelectAll: true,
        enableRowHeaderSelection: true,

        multiSelect: true,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          gridApi.selection.clearSelectedRows();
          gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );
          //recebe numero do registro quando selecionado
          gridApi.selection.on.rowSelectionChanged($scope, function(row) {
            // $scope.fecharLote();
            console.log("rowSelectionchange");
            var itens = gridApi.selection.getSelectedRows();
            if (itens.length === 0) {
              $scope.acaoRecebidaSelected = null;
            } else {
              $scope.acaoRecebidaSelected = itens;
            }
          });
          gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
            console.log("rowSelectionChangedBatch");
            // $scope.fecharLote();
          });
          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Nota Débito",
            field: "nota",
            width: 120,
            cellTemplate: "<div>{{row.entity.budgetDealerID}}</div>"
          },
          {
            name: "Ano",
            field: "anoFiscal",
            width: 90,
            cellTemplate: "<div>{{row.entity.anoFiscal}}</div>"
          },
          {
            name: "Mês",
            field: "mes",
            width: 80,
            cellTemplate: "<div>{{row.entity.mes}}</div>"
          },
          {
            name: "Cód. Dealer",
            field: "codigoDealer",
            width: 95
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Data Recebimento",
            field: "dataEmissao",
            cellFilter: "date:'dd/MM/yyyy'"
          },
          {
            name: "Dias Fila",
            field: "diasNoStatus",
            width: 80
          },
          {
            name: "Quantidade de Notas",
            field: "qtdNotas",
            width: 80
          },
          {
            name: "Impresso",
            field: "impresso",
            width: 75,
            cellTemplate:
              "<div><i ng-if='row.entity.impresso' class='fas fa-print check-icon' title='Já foi impresso'></i><i title='Não foi impresso' ng-if='!row.entity.impresso' class='fas fa-print print-icon close-icon'></i></div>"
          },
          {
            name: "Ação",
            field: "budgetDealerID",
            enableFiltering: false,
            width: 120,
            cellTemplate:
              '<button class="btn btn-print" type="button" title="Imprimir" ng-click="grid.appScope.onImprimirClick(row.entity.budgetDealerID)"><i class="fas fa-print print-icon"></i> Imprimir</button>'
          }
        ]
      };

      $scope.gridOptionsReabertura = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableRowHeaderSelection: true,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,

        enableGridMenu: false,
        rowHeight: 32,

        onRegisterApi: function (gridApi) {
            gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

            //evento de mudanca da qtde de registros visiveis na tabela
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.gridOptionsReabertura.paginationPageSize = pageSize;
                setTableHeight(totalRows);
            });
        },

        columnDefs: [
          {
            name: "Nº Lote",
            field: "budgetDealerLoteId",
            width: 75
          },
          {
            name: "Data/hora",
            field: "dataHora",
            cellFilter: "date:'dd/MM/yyyy HH:mm:ss'",
            width: 160
          },
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Nota Débito",
            field: "budgetDealerId",
            width: 120,
          },
          {
            name: "Ano",
            field: "anoFiscal",
            width: 95
          },
          {
            name: "Mês",
            field: "mes",
            width: 80,
          },
          {
            name: "Cód. Dealer",
            field: "codigo",
            width: 95
          },
          {
            name: "Dealer",
            field: "nomeFantasia"
          },
          {
            name: "Ação",
            field: "budgetDealerID",
            enableFiltering: false,
            width: 200,
              cellTemplate:
                  '<button class="btn btn-table btn-reopen" type="button" title="Reabrir" ng-click="grid.appScope.onReabrirLoteClick(row.entity.budgetDealerId)"><i class="far fa-folder-open"></i> Reabrir</button>' +
                  '<button class="btn btn-table btn-print" type="button" title="Imprimir Parecer" ng-click="grid.appScope.onImprimirClick(row.entity.budgetDealerId)"><i class="fas fa-print print-icon" style="margin-left: 0px;"></i> Parecer</button>'
          }
        ]
      };

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA
      $scope.onImprimirClick = function(budgetDealerID) {
        window.open(
          rootURLInter + "app/#/admin/impressao/" + budgetDealerID,
          "_blank"
        );
        // $state.go('impressaoAdmin', { budgetDealerID: value.budgetDealerID })
      };

      //mock
      $scope.mockRecebidas = function() {
        var mok = {
          budgetDealerID: 0,
          marca: "string",
          percentual: 0,
          nota: "string",
          mesano: "03/19",
          valorTotal: 1110,
          codigoDealer: "string",
          dealer: "Nome Dealer",
          dataEmissao: "2019-03-21T16:55:50.988Z",
          status: "string",
          diasNoStatus: 0
        };
        $scope.gridOptions1.data = [];

        for (let i = 0; i < 50; i++) {
          $scope.gridOptions1.data.push(mok);
        }
      };
      // $scope.mockRecebidas();

      $scope.getListaFechamentos = function() {
        return $q(function(resolve, reject) {
          $scope.buscaData.marca = $scope.$parent.$parent.marcaActive;
          auditoriaService
            .getListaFechamentos($scope.buscaData)
            .then(function(result) {
              $scope.gridOptions1.data = result.data;
              console.log("Resultado", result.data);
              resolve(result);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(error);
            });
        });
      };

      $scope.getListaReaberturaLote = function() {
        return $q(function(resolve, reject) {
            $scope.buscaData.marca = $scope.$parent.$parent.marcaActive;
            
            auditoriaService.getListaReaberturaLote($scope.buscaData)
              .then(function(response) {
                $scope.gridOptionsReabertura.data = response.data;
                resolve(response);
              })
              .catch(function(response) {
                sysServicos.sendErrorMsg(
                  response.status,
                  response.statusText,
                  response.config.url,
                  response.data.message
                );

                reject(response)
              });
        });
      };

      $scope.reload = function() {
        setTimeout(function() {
          window.location.reload();
        }, 1000);
      };

      function getContagemAba(status, statusList) {
        var result = 0;
        statusList.forEach(function(iten) {
          if (status.indexOf(iten.status) !== -1) {
            result += iten.contagem;
          }
        });
        return result;
      }

      $scope.updateView = function() {
        $scope.getListaFechamentos();
        $scope.getListaReaberturaLote();

        return $q(function(resolve, reject) {
          auditoriaService
            .getContagem($scope.marcaActive)
            .then(function(res) {
              $scope.statusAbas.forEach(function(element, index, array) {
                $scope.abas[index].quota = getContagemAba(element, res.data);
              });
              resolve(res);
              console.log($scope.marcaActive);
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(response);
            });
        });
      };

      $scope.onFechamentoLoteClick = function() {
        var params = [];

        $scope.acaoRecebidaSelected.forEach(function(element) {
          params.push(element.budgetDealerID);
        });
        auditoriaService
          .postFechamentoLoteSalvar({
            budgetDealerIDs: params
          })
          .then(function(res) {
            sysServicos.sendSuccessMsg(res.data.message);
            $scope.updateView();
            $scope.getListaFechamentos();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
            reject(error);
          });
      };

      $scope.onReabrirLoteClick = function(budgetDealerId) {
        auditoriaService.getPodeReabrirLote({budgetDealerId})
          .then(function(response) {
            if (response.data) {
              sysServicos.sendWarnMsg(response.data);
            } else {
              $scope.reabertura.budgetDealerId = budgetDealerId;
              abreModal("#modalReabrirLote", "mfp-sign");
            }
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.config.url,
              response.data.message
            );
          })
      }

      $scope.onReabrirLoteConfirmarClick = function() {
        if (!$scope.reabertura.motivo) {
          sysServicos.sendWarnMsg("Informe o motivo.");
          return;
        }

        auditoriaService.postReabrirLote($scope.reabertura)
          .then(function(response) {
            $scope.onReabrirLoteCancelarClick();
            sysServicos.sendSuccessMsg(response.data);
            $scope.updateView();
            $scope.getListaFechamentos();
            $scope.getListaReaberturaLote();
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.config.url,
              response.data.message
            );
          })
      }

      $scope.onReabrirLoteCancelarClick = function() {
        $.magnificPopup.close();
      }

      $scope.init = function() {
        window.onAuditoriaAbaChange = $scope.init;

        $scope.gridOptions1.data = [];
        $scope.getListaFechamentos().then(function(res) {
          console.log("getListaFechamentos >>>", res);
        });
        $scope.getListaReaberturaLote();
      };

      $scope.onBuscaClick = function(param1, clear) {
        // console.log(" >> onBuscaClick ", $scope.$parent.$parent.marcaActive);
        if (clear && clear === true) {
          $scope.buscaData.dealer = "";
          $scope.buscaData.nota = "";
          $scope.buscaData.ano = "";
        }
        $scope.gridOptions1.data = [];
        $scope.getListaFechamentos($scope.buscaData).then(function(res) {
          console.log("getListaFechamentos >>>", res);
        });
        $scope.getListaReaberturaLote();
      };
      $scope.init();
    }
  ])

  // CONTROLLER ABA DE PROCESSOS
  .controller("auditoriaProcessosController", [
    "$scope",
    "$q",
    "$http",
    "$state",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    "$location",
    function(
      $scope,
      $q,
      $http,
      $state,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $cookieStore,
      applicationService,
      auditoriaService,
      uiGridConstants,
      $location
    ) {
      $scope.rowFormatter = function(row) {
        return row.entity.ativo == false;
      };
      console.log(">>> init auditoriaRecebimentoController");

      $scope.abaActive = "processos";
      $scope.searched = false;
      $scope.searchvalues = {
        nota: "",
        marca: ""
      };

      $scope.listStatus = [];
      $scope.selectedActions = {
        status: null,
        motivo: ""
      };

      $scope.selectedNF = null;

      // GRID AÇÕES RECEBIDAS
      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: true,
        enableSelectAll: true,
        enableRowHeaderSelection: true,

        multiSelect: true,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );
          //recebe numero do registro quando selecionado
          gridApi.selection.on.rowSelectionChanged($scope, function(row) {
            // $scope.fecharLote();
            console.log("rowSelectionchange");
          });
          gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
            console.log("rowSelectionChangedBatch");
            // $scope.fecharLote();
          });
          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Número da Nota de Débito",
            field: "budgetDealerID"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Ano Fiscal",
            field: "anoFiscalComNormal"
          },
          {
            name: "Mês",
            field: "mes"
          },
          {
            name: "Etapa Auditoria",
            field: "status"
          },
          {
            name: "",
            width: 55,
            enableFiltering: false,
            field: "marca",
            cellTemplate:
              '<button class="btn btn-primary btn-table" type="button" title="Detalhes" ng-click="grid.appScope.onDetalheClick(row.entity)"><i class="fa fa-edit font-18"></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      // RECEBE EVENTO DE CLIQUE DOS BOTÕES DA TABELA

      $scope.onDetalheClick = function(value) {
        console.log(" >>> click", value);
        $scope.abaActive = "detalhe";
        $location.search({
          aba: "processos",
          detalhe: value.budgetDealerID
        });
        $scope.initDetalhe(value);
      };

      $scope.initDetalhe = function(item) {
        $scope.selectedNF = item;
        console.log(item);
        var requestParam = {
          BudgetDealerID: item.budgetDealerID
        };

        $scope
          .getProcessosStatus()
          .then(function(val) {
            return $scope.getProcessosRetornadosByBudgetId(requestParam);
          })
          .then(function(val) {})
          .catch(function(error) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });

        // auditoriaService
        //   .getCabecalhoAcao(requestParam)
        //   .then(function(result) {
        //     $scope.detalheData = result.data;
        //     console.log("getCabecalhoAcao", $scope.detalheData);
        //     return auditoriaService.getRodapeAcao(requestParam);
        //   })
        //   .then(function(result) {
        //     $scope.detalheData = angular.merge($scope.detalheData, result.data);
        //     return auditoriaService.getDetalhesAcao(requestParam);
        //   })
        //   .then(function(result) {
        //     $scope.gridOptions2.data = result.data;
        //   });
      };

      $scope.getProcessosStatus = function() {
        return $q(function(resolve, reject) {
          auditoriaService
            .getProcessosStatus()
            .then(function(res) {
              $scope.listStatus = res.data;
              resolve();
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(error);
            });
        });
      };

      $scope.getProcessosRetornadosByBudgetId = function(budget) {
        return $q(function(resolve, reject) {
          auditoriaService
            .getProcessosRetornadosByBudgetId(budget)
            .then(function(res) {
              $scope.gridOptions2.data = res.data;
            })
            .catch(function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
              reject(error);
            });
        });
      };

      $scope.clearNf = function() {
        $scope.searchvalues.nota = "";
        $scope.searched = false;
        $scope.gridOptions1.data = [];
      };

      window.onAuditoriaAbaChange = $scope.clearNf;

      $scope.searchNf = function() {
        $scope.searchvalues.marca = $scope.$parent.$parent.marcaActive;
        console.log($scope.searchvalues);
        auditoriaService
          .getProcessoNfListagem($scope.searchvalues)
          .then(function(result) {
            console.log(" >>> result", result);
            $scope.gridOptions1.data = result.data;
            $scope.searched = true;
          })
          .catch(function(response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.url,
              response.data.message
            );
          });
      };

      $scope.gridOptions2 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: true,
        enableSelectAll: true,
        enableRowHeaderSelection: true,

        multiSelect: true,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );
          //recebe numero do registro quando selecionado
          gridApi.selection.on.rowSelectionChanged($scope, function(row) {
            // $scope.fecharLote();
            console.log("rowSelectionchange");
          });
          gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
            console.log("rowSelectionChangedBatch");
            // $scope.fecharLote();
          });
          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Número da Nota de Débito",
            field: "budgetDealerID"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Data de Modificação",
            field: "dataEvento"
          },
          {
            name: "Hora de Modificação",
            field: "dataEvento"
          },
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Etapa Anterior",
            field: "etapaAnterior"
          },
          {
            name: "Nova Etapa",
            field: "novaEtapa"
          }
        ]
      };

      $scope.onParecerSalvarClick = function(value) {
        var params = {
          budgetDealerID: $scope.selectedNF.budgetDealerID,
          budgetDealerStatusID: $scope.selectedActions.status,
          motivo: $scope.selectedActions.motivo
        };
        console.log(" >>> click", params);
        auditoriaService
          .pathProcessoRetornar(params)
          .then(function(res) {
            sysServicos.sendSuccessMsg(res.data.message);
            $scope.updateView();
            $scope.onParecerVoltarClick();
          })
          .catch(function(error) {
            sysServicos.sendErrorMsg(
              error.status,
              error.statusText,
              error.config.url,
              error.data.message
            );
          });
      };

      $scope.onParecerVoltarClick = function(value) {
        $scope.abaActive = "processos";
        $location.search({
          aba: "processos"
        });
        // $scope.init(value);
      };
    }
  ])

  .controller("impressaoAdminController", [
    "$scope",
    "$http",
    "$stateParams",
    "$filter",
    "sysServicos",
    function($scope, $http, $stateParams, $filter, sysServicos) {
      $http({
        method: "GET",
        url: rootURL + "auditoria/fechamento/imprimir",
        params: {
          BudgetDealerID: $stateParams.budgetDealerID
        }
      }).then(
        function(retorno) {
          $scope.mes = retorno.data[0].mes;
          $scope.impressao = retorno.data[0];
          $scope.impressoes = {};
          $scope.impressoes = retorno.data;
          $scope.impressao.mes = (function() {
            switch ($scope.impressao.mes) {
              case 1:
                return "Janeiro";
              case 2:
                return "Fevereiro";
              case 3:
                return "Março";
              case 4:
                return "Abril";
              case 5:
                return "Maio";
              case 6:
                return "Junho";
              case 7:
                return "Julho";
              case 8:
                return "Agosto";
              case 9:
                return "Setembro";
              case 10:
                return "Outubro";
              case 11:
                return "Novembro";
              case 12:
                return "Dezembro";
            }
          })();
          $scope.impressao.quantidadeNotaAprovada = $filter("filter")(
            $scope.impressao.notas,
            nota => nota.aprovado
          ).length;
          $scope.impressao.quantidadeNotaTotal = $scope.impressao.notas.length;

          console.log($scope.impressao);
        },
        function(erro) {
          $scope.impressao = {};

          sysServicos.sendErrorMsg(
            erro.status,
            erro.statusText,
            erro.config.url
          );
        }
      );
    }
  ]);
