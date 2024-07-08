angular
  .module("financeiroModule", [])
  .controller("financeiroController", [
    "$scope",
    "$http",
    "uiGridConstants",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$q",
    "$state",
    "$cookieStore",
    function(
      $scope,
      $http,
      uiGridConstants,
      $rootScope,
      sysServicos,
      Upload,
      $timeout,
      $q,
      $state,
      $cookieStore
    ) {
      $scope.hideGrid = true;

      $scope.pagamentosSelected = null;

      $scope.filtro = {};
      $scope.anoFiscal = {};
      $scope.meses = {};

      function rowTemplate() {
        return $timeout(function() {
          return (
            "<div ng-class=\"{ 'inactiveRow': grid.appScope.rowFormatter( row ) }\">" +
            '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
            "</div>"
          );
        }, 100);
        }

      $scope.abaActive = "Pagamentos";

      $scope.changeAba = function(aba) {
        if (aba == "Pagamento") {
          $scope.abaActive = "Pagamentos";
        } else {
          $scope.abaActive = "Estornos";
        }
        $scope.abaActive = aba;
      };

      $scope.handleMonth = mes => {
        $scope.mesSelecionado = mes;
      };

      $scope.handleFiscalYear = anoFiscal => {
        $scope.anoSelecionado = anoFiscal;
      };

        $scope.getFilter = () => {
        $http({
          method: "GET",
          url: rootURL + "financeiro/pagamento/disponiveis",
          params: {
            mes: $scope.filtro.mes,
            anoFiscal: $scope.filtro.anoFiscal,
            regionalId: $scope.filtro.aov,
            regiaoId: $scope.filtro.regiao
          }
        }).then(
          function(retorno) {
            $scope.gridOptions1.data = retorno.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
          },
          function(erro) {
            sysServicos.sendErrorMsg(
              erro.status,
              erro.statusText,
              erro.config.url
            );
          }
        );
        $http({
          method: "GET",
          url: rootURL + "financeiro/pagamento/fechados",
          params: {
            mes: $scope.filtro.mes,
            anoFiscal: $scope.filtro.anoFiscal,
            regionalId: $scope.filtro.aov,
            regiaoId: $scope.filtro.regiao
          }
        }).then(
          function(retorno) {
            $scope.gridOptions2.data = retorno.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions2.data.length;
          },
          function(erro) {
            sysServicos.sendErrorMsg(
              erro.status,
              erro.statusText,
              erro.config.url
            );
          }
        );
      };
      $scope.exportarPagamento = () => {
        $http({
          method: "GET",
          url: rootURL + "financeiro/estorno/fechados",
          params: {
            mes: $scope.filtro.mes,
            anoFiscal: $scope.filtro.anoFiscal,
            regionalId: $scope.filtro.aov,
            regiaoId: $scope.filtro.regiao
          }
        }).then(
          function(retorno) {
            $scope.gridOptions1.data = retorno.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
          },
          function(erro) {
            sysServicos.sendErrorMsg(
              erro.status,
              erro.statusText,
              erro.config.url
            );
          }
        );
      }

      $scope.getFilterEstorno = () => {
        $http({
          method: "GET",
          url: rootURL + "financeiro/estorno/fechados",
          params: {
            mes: $scope.filtro.mes,
            anoFiscal: $scope.filtro.anoFiscal,
            regionalId: $scope.filtro.aov,
            regiaoId: $scope.filtro.regiao
          }
        }).then(
          function(retorno) {
            $scope.gridOptions1.data = retorno.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
          },
          function(erro) {
            sysServicos.sendErrorMsg(
              erro.status,
              erro.statusText,
              erro.config.url
            );
          }
        );
        $http({
          method: "GET",
          url: rootURL + "financeiro/estorno/fechados",
          params: {
            mes: $scope.filtro.mes,
            anoFiscal: $scope.filtro.anoFiscal,
            regionalId: $scope.filtro.aov,
            regiaoId: $scope.filtro.regiao
          }
        }).then(
          function(retorno) {
            $scope.gridOptions2.data = retorno.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions2.data.length;
          },
          function(erro) {
            sysServicos.sendErrorMsg(
              erro.status,
              erro.statusText,
              erro.config.url
            );
          }
        );
      };

      //$scope.handleAppID = appId => {
      //  $scope.appIDSelecionado = appId;
      //  console.log("AppID", $scope.appIDSelecionado);
      //};

      $scope.getMonths = function() {
        return $q(function (resolve, reject) {
            $http({
                method: 'GET',
                url: rootURL + "periodo/meses",
                params: { anoFiscal: $scope.filtro.anoFiscal }
            }).then(
                function (response) {
                    $scope.meses = response.data;
                    $scope.filtro.mes = response.data.find(mes => mes.atual).mesId;
                    resolve();
                },
                function (response) {
                    reject(response);
                }
            );
        });
      };

      $scope.getFiscalYear = function()  {
        return $q(function (resolve, reject) {
            $http.get(rootURL + "periodo/anos")
            .then(
                function (response) {
                    $scope.listaAno = response.data;
                    $scope.filtro.anoFiscal = response.data.find(ano => ano.atual).anoFiscal;
                    resolve();
                },
                function (response) {
                    reject(response);
                }
            );
        });
      };

      $scope.getRegionais = () => {
        promise = $http.get(rootURL + "v1/regionais");
        promise.then(
          function(ret) {
            $scope.listaRegionais = ret.data;
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

      $scope.getRegioes = () => {
        promise = $http.get(rootURL + "v1/regioes");
        promise.then(
          function(ret) {
            $scope.listaRegioes = ret.data;
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

      $scope.getAllPayments = () => {
        promise = $http.get(
            rootURL + "financeiro/pagamento/disponiveis"
        );
        promise.then(
          function(ret) {
            $scope.gridOptions1.data = ret.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
            $scope.getAllClosedNotes();
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

      $scope.getAllClosedNotes = () => {
        promise = $http.get(
            rootURL +
            "financeiro/pagamento/fechados"
        );
        promise.then(
          function(ret) {
            $scope.gridOptions2.data = ret.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
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

      $scope.getAllEstornos = () => {
        promise = $http.get(
            rootURL + "financeiro/estorno/abertos"
        );
        promise.then(
          function(ret) {
            $scope.gridOptions1.data = ret.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
            $scope.getAllFinishEstornos();
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

      $scope.getAllFinishEstornos = () => {
        promise = $http.get(
            rootURL + "financeiro/estorno/fechados"
        );
        promise.then(
          function(ret) {
            $scope.gridOptions2.data = ret.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions2.data.length;
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

      $scope.rowFormatter = function(row) {
        return row.entity.ativo == false;
      };

      $scope.reopen = budgetDealerID => {
        abreModal("#modalAlertas", "mfp-sign");
        $scope.budgetDaNota = budgetDealerID;
        let promise = $http.get(
          rootURL + "financeiro/historico?budgetDealerID=" + $scope.budgetDaNota
        );
        promise.then(
          function(response) {
            sysServicos.sendSuccessMsg(response.data.message);
            $scope.gridOptions3.data = response.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions3.data.length;
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

      $scope.saveReopen = () => {
        const objEnvio = {};
        objEnvio.budgetDealerID = $scope.budgetDaNota;
        objEnvio.motivo = $scope.reopenReason;

        let promise = $http.patch(
          rootURL + "financeiro/pagamento/reabrir",
          objEnvio
        );
        promise.then(
          function(response) {
            sysServicos.sendSuccessMsg(response.data.message);
            if ($scope.abaActive === "Pagamentos") {
              $scope.getFilter();
              $rootScope.closeModal();
              $scope.reopenReason = "";
            } else {
              $scope.getAllEstornos();
              $scope.reopenReason = "";
            }
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

      $scope.saveReopenEstorno = () => {
        const objEnvio = {};
        objEnvio.budgetDealerID = $scope.budgetDaNota;
        objEnvio.motivo = $scope.reopenReason;

        let promise = $http.patch(
          rootURL + "financeiro/estorno/reabrir",
          objEnvio
        );
        promise.then(
          function(response) {
            sysServicos.sendSuccessMsg(response.data.message);
            if ($scope.abaActive === "Pagamentos") {
              $scope.getFilter();
              $rootScope.closeModal();
              $scope.reopenReason = "";
            } else {
              $scope.getAllEstornos();
              $scope.reopenReason = "";
            }
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

        rowTemplate: rowTemplate(),

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
              $scope.selectedItems = null;
            } else {
              var objArray = itens;
              let pagamentos = objArray.map(i => i.budgetDealerID);
              $scope.selectedItems = pagamentos;
            }
          });
          $scope.gridApi1.selection.on.rowSelectionChangedBatch(
            $scope,
            function(rows) {
              var itens = $scope.gridApi1.selection.getSelectedRows();
              var objArray = itens;
              let pagamentos = objArray.map(i => i.budgetDealerID);
              $scope.selectedItems = pagamentos;
              console.log("Pagamentos", $scope.selectedItems);
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
        // BudgetDealerID Marca   Codigo Dealer  ValorTeto ValorAprovado   UltrapassouValorTeto ValorFinal
        columnDefs: [
          {
            name: "Código Dealer",
            field: "codigo"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Valor Teto",
            field: "valorTeto",
            cellFilter: "currency"
          },
          {
            name: "Valor Aprovado",
            field: "valorAprovado",
            cellFilter: "currency"
          },
          {
            name: "Ultrapassou Valor Teto",
            field: "ultrapassouValorTeto"
          },
          {
            name: "Valor Final",
            field: "valorFinal",
            cellFilter: "currency"
          }
        ]
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

        rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi2 = gridApi;
          $scope.gridApi2.selection.clearSelectedRows();
          $scope.gridApi2.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );
          //recebe numero do registro quando selecionado
          $scope.gridApi2.selection.on.rowSelectionChanged($scope, function(
            row
          ) {
            var itens = $scope.gridApi2.selection.getSelectedRows();
            if (itens.length === 0) {
              $scope.notasSelecionadas = null;
            } else {
              var objArray = itens;
              let notas = objArray.map(i => i.budgetDealerID);
              $scope.notasSelecionadas = notas;
            }
          });
          $scope.gridApi2.selection.on.rowSelectionChangedBatch(
            $scope,
            function(rows) {
              var itens = $scope.gridApi2.selection.getSelectedRows();
              var objArray = itens;
              let notas = objArray.map(i => i.budgetDealerID);
              $scope.notasSelecionadas = notas;
            }
          );
          //evento de mudanca da qtde de registros visiveis na tabela
          $scope.gridApi2.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Código Dealer",
            field: "codigo"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Região",
            field: "regiao"
          },
          {
            name: "Mês",
            field: "mes"
          },
          {
            name: "Ano",
            field: "anoFiscalComNormal"
          },
          {
            name: "Nota de Débito",
            field: "budgetDealerID"
          },
          {
            name: "Valor",
            field: "valor",
            cellFilter: "currency"
          },
          {
            name: "Ações",
            cellTemplate:
              '<div><button class="reopen-btn" ng-click="grid.appScope.reopen(row.entity.budgetDealerID, rowRenderIndex)">Reabrir</button></div>'
          }
        ]
      };

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

        rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi3 = gridApi;
          $scope.gridApi3.selection.clearSelectedRows();
          $scope.gridApi3.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );
          //recebe numero do registro quando selecionado
          $scope.gridApi3.selection.on.rowSelectionChanged($scope, function(
            row
          ) {
            var itens = $scope.gridApi3.selection.getSelectedRows();
            if (itens.length === 0) {
              $scope.selectedItems = null;
            } else {
              var objArray = itens;
              let pagamentos = objArray.map(i => i.budgetDealerID);
              $scope.selectedItems = pagamentos;
            }
          });
          $scope.gridApi3.selection.on.rowSelectionChangedBatch(
            $scope,
            function(rows) {
              var itens = $scope.gridApi3.selection.getSelectedRows();
              var objArray = itens;
              let pagamentos = objArray.map(i => i.budgetDealerID);
              $scope.selectedItems = pagamentos;
              console.log("Pagamentos", $scope.selectedItems);
            }
          );
          //evento de mudanca da qtde de registros visiveis na tabela
          $scope.gridApi3.pagination.on.paginationChanged($scope, function(
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
            name: "data",
            field: "dataHora",
            cellFilter: "date:'dd-MM-yyyy'"
          },
          {
            name: "Hora",
            field: "dataHora",
            cellFilter: "date:'HH:mm'"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Motivo da Reabertura",
            field: "motivo"
          }
        ]
      };

      $scope.fecharPagamento = () => {
        const objEnvio = {};
        objEnvio.budgetDealerIDs = $scope.selectedItems;
        objEnvio.dataPrevistaPgto = $scope.textBuscaDataPrevista;

        let promise = $http.patch(
          rootURL + "financeiro/pagamento/fechar",
          objEnvio
        );
        promise.then(
          function(response) {
            console.log('response');
            console.log(response);
            sysServicos.sendSuccessMsg(response.data.message);
            if ($scope.abaActive === "Pagamentos") {
              $scope.textBuscaDataPrevista = "";
              $scope.textBuscaRingi = "";
              $scope.getFilter();
            } else {
              $scope.getAllEstornos();
            }
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

      $scope.fecharEstorno = () => {
        const objEnvio = {};
        objEnvio.budgetDealerIDs = $scope.selectedItems;
        objEnvio.dataPrevista = $scope.textBuscaDataPrevista;
        objEnvio.ringi = $scope.textBuscaRingi;

        let promise = $http.patch(
          rootURL + "financeiro/estorno/fechar",
          objEnvio
        );
        console.log(objEnvio);
        promise.then(
          function(response) {
            sysServicos.sendSuccessMsg(response.data.message);
            if ($scope.abaActive === "Pagamentos") {
              $scope.textBuscaDataPrevista = null;
              $scope.textBuscaRingi = null;
              $scope.getFilter();
            } else {
              $scope.getAllEstornos();
            }
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

      $scope.print = () => {
        $http({
          method: "POST",
          url: rootURL + "financeiro/imprimir",
          data: $scope.notasSelecionadas
        }).then(
          function(retorno) {
            window.open(
              rootURLInter +
                "app/#/admin/verba/impressao/" + 
                ($scope.abaActive == 'Pagamentos'?'1':'2') + '/' +
                $scope.notasSelecionadas,
              "_blank"
            );
          },
          function(erro) {
            sysServicos.sendErrorMsg(
              erro.status,
              erro.statusText,
              erro.config.url
            );
          }
        );
      };

      $scope.reportExport = function () {
        let promise = $http.get(rootURL + "relatorio/fechamento",
            {
                responseType: "arraybuffer",
                headers: {
                    "Content-type": "application/json",
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                },
                params: {
                  mes: $scope.filtro.mes,
                  anoFiscal: $scope.filtro.anoFiscal,
                  regionalId: $scope.filtro.aov,
                  regiaoId: $scope.filtro.regiao
                },
            });
        promise.then(
            function (ret) {
                var blob = new Blob([ret.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                saveAs(blob, "Relatório Fechamento.xlsx");
            },
            function (error) {
                if (error.status == 400 || error.status == -1) {
                    sysServicos.sendWarnMsg('Este filtro não possuí dados para serem exportados.')
                }
            }
        );
    };


      //Primeira tabela
      $scope.toggleFiltering = function() {
        $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
          .enableFiltering;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      };

      //Segunda tebela
      $scope.toggleFiltering = function() {
        $scope.gridOptions2.enableFiltering = !$scope.gridOptions2
          .enableFiltering;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      };

      //Terceira tebela (detalhe de reabertura de ação)
      $scope.toggleFiltering = function() {
        $scope.gridOptions3.enableFiltering = !$scope.gridOptions3
          .enableFiltering;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      };

      $scope.init = function () {
        $scope
            .getFiscalYear()
            .then(function (res) {
                return $scope.getMonths();
                });
        $scope.getRegioes();
        $scope.getRegionais();
        $scope.getFilter();
      };
      $scope.init();
    }
  ])

  .controller("impressaoVerbaController", [
    "$scope",
    "$http",
    "$stateParams",
    "$filter",
    "sysServicos",
    function($scope, $http, $stateParams, $filter, sysServicos) {
      $scope.budgetDealerID2s = $stateParams.budgetDealerIDs.split(",");
      $http({
        method: "POST",
        url: rootURL + "financeiro/imprimir",
        data: $scope.budgetDealerID2s
      }).then(
        function(retorno) {
          $scope.impressoes = retorno.data;
          $scope.printType = $stateParams.type;
        },
        function(erro) {
          $scope.impressoes = {};

          sysServicos.sendErrorMsg(
            erro.status,
            erro.statusText,
            erro.config.url
          );
        }
      );
    }
  ]);
