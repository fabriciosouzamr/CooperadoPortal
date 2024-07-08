angular
  .module("verbaModule", [])
  .controller("verbaController", [
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
    "applicationId",
    function (
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
      applicationId
    ) {
      $scope.filtro = {};
      $scope.anoFiscal = {};
      $scope.meses = {};
      
      $scope.usuarioLogado = $cookieStore.get("perfilUsuario");

        $scope.exportarModeloClick = function () {
            promise = $http.get(
                rootURL +
                `financeiro/verba/importacao/modelos?ano=${
                $scope.filtro.ano
                }&periodo=${$scope.filtro.periodo}`, {
                responseType: "arraybuffer",
                headers: {
                    "Content-type": "application/json",
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            }
            );
            promise.then(
                function (ret) {
                    var blob = new Blob([ret.data], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });
                    saveAs(blob, "Modelo_Importacao.xlsx");
                },
                function (err) {
                    sysServicos.sendErrorMsg(
                        err.status,
                        err.data.status,
                        err.config.url,
                        err.data.message
                    );
                }
            );
        };

      $scope.dropAnoFiscal = function () {
        return $q(function (resolve, reject) {
            $http.get(rootURL + "periodo/anos")
                .then(
                    function (response) {
                        $scope.anoFiscal = response.data;
                        $scope.filtro.ano = response.data.find(ano => ano.atual).anoFiscal;
                        resolve();
                    },
                    function (response) {
                        reject(response);
                    }
                );
        });
      };

      $scope.dropPeriodos = function() {
        return $q(function(resolve, reject) {
          $http({
            method: 'GET',
            url: rootURL + "periodo/grupos",
            params: {anoFiscal: $scope.filtro.ano}
          }).then(
            function(response) {
              $scope.periodos = response.data;
              $scope.filtro.periodo = response.data.find(periodo => periodo.atual).grupo;
              resolve();
            },
            function(response) {
              reject(response);
            }
          );
        });
      };

      $scope.uploadFiles = function (files, errFiles, box) {
        angular.forEach(files, function (file) {
          var bodyData = {
            AnoFiscal: $scope.filtro.ano,
            Periodo: $scope.filtro.periodo,
            Planilha: file
          };
          file.upload = Upload.upload({
            method: "POST",
            url: rootURL + "financeiro/verba/importacao/importar",
            data: bodyData
          });

          file.upload.then(
            function (response) {
              $timeout(function () {
                sysServicos.sendSuccessMsg("Arquivo importado com sucesso");
                $rootScope.atualizaLista();
              });
            },
            function (response) {
              if (response.status > 0)
                $scope.errorMsg = response.status + ": " + response.data;

              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.url,
                response.data.message
              );
            },
            function (evt) {
              file.progress = Math.min(
                100,
                parseInt((100.0 * evt.loaded) / evt.total)
              );
            }
          );
        });
      };

      // so pode ser iniciado apos o carregamento de ano fiscal e mes
      $scope.init = function () {
        $scope
            .dropAnoFiscal()
            .then(function (res) {
                return $scope.dropPeriodos();
            })
            .then(function (res) {
                return $rootScope.atualizaLista();
            });
      };

      $scope.init();
    }
  ])
  // tabelas

  .controller("importacaoTableCntrl", [
    "$scope",
    "$http",
    "uiGridConstants",
    "sysServicos",
    "$interval",
    "$stateParams",
    "$timeout",
    "$state",
    "$rootScope",
    function (
      $scope,
      $http,
      uiGridConstants,
      sysServicos,
      $interval,
      $stateParams,
      $timeout,
      $state,
      $rootScope
    ) {
      var totalRows;
      var idFab;

      $scope.hideGrid = true;

      function rowTemplate() {
        return $timeout(function () {
          return (
            "<div ng-class=\"{ 'inactiveRow': grid.appScope.rowFormatter( row ) }\">" +
            '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
            "</div>"
          );
        }, 100);
      }

      $scope.rowFormatter = function (row) {
        return row.entity.ativo == false;
      };

      $scope.seila = function (status) {
        var mostra = status == "sucesso";
        console.log(mostra);

        return mostra;
      };

      var statusController =
        "<div class='ui-grid-cell-contents' ng-click='grid.appScope.seeErrorFile(row.entity.importacaoLogId)'><span title='Sucesso' class='sucesso' ng-show='row.entity.status == \"sucesso\"'></span><b class='sucesso' ng-show='row.entity.status == \"sucesso\"'> Ver importação</b><span title='Erro' class='erro' ng-show='row.entity.status == \"erro\"'></span><b class='erro' ng-show='row.entity.status == \"erro\"'> Ver importação</b><span title='Importado Parcialmente' class='duplicado' ng-show='row.entity.status == \"parcial\"'></span><b class='duplicado' ng-show='row.entity.status == \"parcial\"'> Ver importação</b> </div>";

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

        enableGridMenu: true,

        rowHeight: 32,

        rowTemplate: rowTemplate(),

        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //recebe numero do ato quando selecionado
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {});

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function (
            newPage,
            pageSize
          ) {
            $scope.gridOptions1.paginationPageSize = pageSize;
            // setTableHeight(totalRows);
          });
        },

        columnDefs: [{
            name: "Trimestre",
            field: "periodo",
            width: 100
          },
          {
            name: "Ano Fiscal",
            field: "anoFiscalComNormal",
            width: 100
          },
          {
            name: "Nome do Arquivo",
            field: "nomeArquivo",
            width: 200
          },
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Data",
            field: "dataHora",
            cellTemplate: '<div>{{row.entity.dataHora | date: "dd/MM/yyyy" }}</div>'
          },
          {
            name: "Hora",
            field: "dataHora",
            cellTemplate: '<div>{{row.entity.dataHora | date: "HH:mm:ss" }}</div>'
          },
          {
            name: "Ok",
            field: "ok",
            width: 70
          },
          {
            name: "Duplicado",
            field: "duplicada"
          },
          {
            name: "Erro",
            field: "erro"
          },
          {
            name: "Status",
            field: "status",
            width: 130,
            cellTemplate: statusController
          }
        ]
      };

      $scope.seeErrorFile = importacaoLogId => {
        var promise = $http.get(
          rootURL +
          "financeiro/verba/importacao/exportar?importacaoLogId=" +
          importacaoLogId, {
            responseType: "arraybuffer",
            headers: {
              "Content-type": "application/json",
              Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
          }
        );
        promise.then(
          function (ret) {
            var blob = new Blob([ret.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            saveAs(blob, "Relatorio de importação.xlsx");
          },
          function (err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $rootScope.atualizaLista = function () {
        $scope.getListaImportacao();
      };

      $scope.getListaImportacao = function () {
        var promise = $http.get(
          rootURL +
          "financeiro/verba/importacao/listagem"
        );
        promise.then(
          function (ret) {
            $scope.gridOptions1.data = ret.data;
            $scope.hideGrid = false;

            totalRows = $scope.gridOptions1.data.length;
            // setTableHeight(totalRows);

            //corrige bug com alinhamento das colunas da tabela no Firefox
            $interval(
              function () {
                $scope.gridApi.core.handleWindowResize();
              },
              500,
              5
            );
          },
          function (err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url
            );
          }
        );
      };

      $scope.toggleFiltering = function () {
        $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
          .enableFiltering;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      };

      $scope.filter = function () {
        $scope.gridApi.grid.refresh();
      };
    }
  ])