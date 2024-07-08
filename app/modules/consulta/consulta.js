angular
  .module("consultaRapidaModule", [])

  .controller("consultaRapidaController", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    "$state",
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
      $stateParams,
      $q,
      uiGridConstants
    ) {
      $scope.filter = {};

      $scope.clearSearch = function(){
        $scope.filter.mes = '';
        $scope.filter.ano = '';
        $scope.filter.regional = '';
        $scope.filter.regiao = '';
        $scope.filter.dealer = '';
        $scope.filter.codigoDealer = '';
        $scope.filter.notaDebito = '';
      }

      $scope.getMonths = function() {
        return $q(function(resolve, reject) {
          $http({
            method: 'GET',
            url: rootURL + "periodo/meses",
            params: {anoFiscal: $scope.filter.ano}
          }).then(
            function(response) {
              $scope.meses = response.data;
              //$scope.filter.mes = response.data.find(mes => mes.atual).mesId;
              resolve();
            },
            function(response) {
              reject(response);
            }
          );
        });
      };

      $scope.getFiscalYears = function() {
        return $q(function(resolve, reject) {
          $http.get(rootURL + "periodo/anos")
            .then(
              function(response) {
                $scope.years = response.data;
                //$scope.filter.ano = response.data.find(ano => ano.atual).anoFiscal;
                resolve();
              },
              function(response) {
                reject(response);
              }
            );
        });
      };
      
      $scope.getRegionals = function(){
        let promise = $http.get(rootURL + 'v1/regionais');
        promise.then(
          function(ret){
            $scope.aovs = ret.data;
          }
        )
      }

      $scope.getRegiao = function(regionalId){
        let promise = $http.get(rootURL + 'v1/regioes?RegionalId=' + regionalId);
        promise.then(
          function(ret){
            $scope.regioes = ret.data;
          }
        )
      }
      
      $scope.getRegionId = function(regiaoId){
        let promise = $http.get(rootURL + 'dealer/consultar?regiaoId=' + regiaoId);
        promise.then(
          function(ret){
            $scope.dealers = ret.data;
          }
        )
      }

      $scope.getDealers = function(){
        let promise = $http.get(rootURL + 'dealer/consultar');
        promise.then(
          function(ret){
            $scope.dealers = ret.data;
          }
        )
      }

      $scope.handleSearch = function(){
        let promise = $http.get(rootURL + 'consulta-rapida',  {
          params: { 
            mes: $scope.filter.mes, 
            anoFiscal: $scope.filter.ano, 
            regionalId: $scope.filter.regional,
            regiaoId: $scope.filter.regiao,
            dealerId: $scope.filter.dealer,
            codigoDealer: $scope.filter.codigoDealer,
            budgetDealerId: $scope.filter.notaDebito
          }
        });
        promise.then(
          function(response){
            $scope.gridOptions1.data = response.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
          }
        )
      }

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
            name: "Nota de Débito",
            field: "budgetDealerId"
          },
          {
            name: "Ano Fiscal",
            field: "anoFiscal"
          },
          {
            name: "Mês",
            field: "mes",
            width: 70
          },
          {
            name: "Valor Total",
            field: "verbaBrutaTodos",
            cellFilter: "currency"
          },
          {
            name: "Código Dealer",
            field: "codigoDealer"
          },
          {
            name: "Dealer",
            field: "dealer"
          },
          {
            name: "Data de Emissão",
            field: "finalizadoDealer",
            cellFilter: "date:'dd/MM/yyyy'"
          },
          {
            name: "Ações",
            width: 150,
            enableFiltering: false,
            cellTemplate:
              '<button class="btn-auditar" type="button" title="Baixar evidências" ng-click="grid.appScope.onBaixarClick(row.entity.budgetDealerId)"><i class="fas fa-download" font-18></i></button>' +
              '<button class="btn-auditar" type="button" title="Ver Nota para impressão" ng-click="grid.appScope.onImprimirClick(row.entity.budgetDealerId)"><i class="fas fa-print" font-18></i></button>' +
              '<button class="btn-auditar" title="Ver detalhes da Nota" ng-click="grid.appScope.viewDetail(row.entity.budgetDealerId, row.entity.dealerId, row.entity.mes, row.entity.periodoNum, row.entity.anoFiscal, row.entity.applicationId)"><i class="fas fa-search"></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      $scope.viewDetail = function(budgetDealerId,dealerId,mes,periodoNum,anoFiscal, applicationId) {
        var stateParams = {
          budgetDealerId: budgetDealerId,
          dealerId: dealerId,
          mes: mes,
          periodoNum: periodoNum,
          anoFiscal: anoFiscal,
          appID: applicationId
        };
        $state.go("consultaRapidaDetalhe", stateParams);
      };   

      $scope.onBaixarClick = function(budgetDealerId) {
        $http({
            method: 'GET',
            url: rootURL + 'baixar-evidencias',
            params: {budgetDealerId},
            responseType: "arraybuffer",
            transformResponse: function(data, headersGetter) {
              var type = headersGetter("Content-Type");
              if (!type.startsWith("text/plain")) {
                return data;
              };
              var decoder = new TextDecoder("utf-8");
              return decoder.decode(data);
            }
        }).then(
          function (ret) {
            var blob = new Blob([ret.data], {
              type: "application/zip"
            });
            saveAs(blob, `evidencias${moment().format('YYYYMMDDHHmmss')}.zip`);
          },
          function (response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.config.url,
              response.data
            );
          }
        );
      }

      $scope.onImprimirClick = function(budgetDealerId) {
        window.open(
          rootURLInter + "app/#/admin/impressao/" + budgetDealerId,
          "_blank"
        );
      };

      function setTableHeight(rows) {
        if (rows >= $scope.gridOptions1.paginationPageSize) {
            angular.element(document.getElementsByClassName('grid')[0]).css('min-height', (($scope.gridOptions1.paginationPageSize + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
        } else {
            angular.element(document.getElementsByClassName('grid')[0]).css('min-height', ((rows + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
        }
    }

      $scope.init = function(){
        $scope.getFiscalYears()
            .then($scope.getMonths);
        $scope.getRegionals();
        $scope.getDealers();
      }
      
      $scope.init();
    }
  ])
  .controller("consultaRapidaDetalheController", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    "$state",
    "$stateParams",
    "$q",
    "uiGridConstants",
    "$timeout",
    "$interval",
    function(
      $scope,
      $http,
      $rootScope,
      sysServicos,
      $cookieStore,
      $state,
      $stateParams,
      $q,
      uiGridConstants,
      $timeout,
      $interval 
    ) {

      $scope.mes = $stateParams.mes;
      $scope.ano = $stateParams.anoFiscal;

      $scope.goBack = function(){
        window.history.go(-1);
      }

      $scope.getYears = function(){
        let promise = $http.get(rootURL + 'periodo/anos');
        promise.then(
          function(ret){
            $scope.anoFiscal = ret.data;
          }
        )
      }

      $scope.getMonths = function(){
        let promise = $http.get(rootURL + 'periodo/meses');
        promise.then(
          function(ret){
            $scope.meses = ret.data;
          }
        )
      }

      $scope.getResumoReembolso = function(){
        const objEnvio = {};
        objEnvio.dealerID = $stateParams.dealerId;
        objEnvio.applicationId = $stateParams.appID;
        objEnvio.anoFiscal = $stateParams.anoFiscal;
        objEnvio.periodoNum = $stateParams.periodoNum;
        objEnvio.mes = $stateParams.mes;

        let promise = $http.post(rootURL + 'v1/resumoReembolso', objEnvio);
        promise.then(
          function(ret){
            $scope.verbaGeral = ret.data;
            $scope.getAcoes();
          }
        )
      }

      $scope.getAcoes = function(){
        const objEnvio = {};
        objEnvio.dealerID = $stateParams.dealerId;
        objEnvio.applicationId = $stateParams.appID;
        objEnvio.anoFiscal = $stateParams.anoFiscal;
        objEnvio.periodoNum = $stateParams.periodoNum;
        objEnvio.mes = $stateParams.mes;

        let promise = $http.post(rootURL + 'v1/acoes', objEnvio);
        promise.then(
          function(ret){
            $scope.gridOptions1.data = ret.data;
            $scope.hideGrid = false;

            totalRows = $scope.gridOptions1.data.length;
            // setTableHeight(totalRows);

            //corrige bug com alinhamento das colunas da tabela no Firefox
            $interval(
              function() {
                $scope.gridApi.core.handleWindowResize();
              },
              500,
              5
            );
          }
        )
      }

      $scope.getAcoesExcluidas = function(){
        const objEnvio = {};
        objEnvio.dealerID = $stateParams.dealerId;
        objEnvio.applicationId = $stateParams.appID;
        objEnvio.anoFiscal = $stateParams.anoFiscal;
        objEnvio.periodoNum = $stateParams.periodoNum;
        objEnvio.mes = $stateParams.mes;

        let promise = $http.post(rootURL + 'v1/acoesexcluidas', objEnvio);
        promise.then(
          function(ret){
            $scope.gridOptions11.data = ret.data;
            $scope.hideGrid = false;

            totalRows = $scope.gridOptions11.data.length;
            // setTableHeight(totalRows);

            //corrige bug com alinhamento das colunas da tabela no Firefox
            $interval(
              function() {
                $scope.gridApi.core.handleWindowResize();
              },
              500,
              5
            );
          }
        )
      }

      function rowTemplate() {
        return $timeout(function() {
          return (
            "<div ng-class=\"{ 'inactiveRow': grid.appScope.rowFormatter( row ) }\">" +
            '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
            "</div>"
          );
        }, 100);
      }

      $scope.getAtencao = function(){
        const objEnvio = {};
        objEnvio.dealerID = $stateParams.dealerId;
        objEnvio.applicationId = $stateParams.appID;
        objEnvio.anoFiscal = $stateParams.anoFiscal;
        objEnvio.periodoNum = $stateParams.periodoNum;
        objEnvio.mes = $stateParams.mes;

        let promise = $http.post(rootURL + 'v1/atencao', objEnvio);
        promise.then(
          function(ret){
            $scope.gridOptions3.data = ret.data;
            $scope.hideGrid = false;

            totalRows = $scope.gridOptions3.data.length;
          }
        )
      }      

      $scope.getEtapas = function(){
        const objEnvio = {};
        objEnvio.dealerID = $stateParams.dealerId;
        objEnvio.applicationId = $stateParams.appID;
        objEnvio.anoFiscal = $stateParams.anoFiscal;
        objEnvio.periodoNum = $stateParams.periodoNum;
        objEnvio.mes = $stateParams.mes;

        let promise = $http.post(rootURL + 'v1/etapas', objEnvio);
        promise.then(
          function(ret){
            $scope.gridOptions2.data = ret.data;
            $scope.hideGrid = false;

            totalRows = $scope.gridOptions2.data.length;
          }
        )
      }   

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

        //rowTemplate: rowTemplate(),

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
            // setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Data",
            field: "data",
            cellFilter: "date:'dd/MM/yyyy'",
            filterCellFiltered: true
          },
          {
            name: "Fornecedor",
            field: "fornecedor",
            width: 180
          },
          {
            name: "Mídia",
            field: "midia",
            width: 200
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
          }
        ]
      };

      $scope.gridOptions11 = {
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

        //rowTemplate: rowTemplate(),

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
            $scope.gridOptions11.paginationPageSize = pageSize;
            // setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Data",
            field: "data",
            cellFilter: "date:'dd/MM/yyyy'",
            filterCellFiltered: true
          },
          {
            name: "Fornecedor",
            field: "fornecedor",
            width: 180
          },
          {
            name: "Mídia",
            field: "midia",
            width: 200
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
            name: "Usuário Exclusão",
            field: "usuario"
          },
          {
            name: "Data Exclusão",
            field: "data_Alt",
            cellFilter: "date:'dd/MM/yyyy - HH.mm'",
            filterCellFiltered: true
          }
        ]
      };

      $scope.gridOptions2 = {
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
            // setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Status",
            field: "status"
          },
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Data/Hora",
            field: "dataHora",
            cellFilter: "date:'dd/MM/yyyy - HH.mm'",
            filterCellFiltered: true
          }
        ]
      };

      $scope.gridOptions3 = {
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
            // setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Status",
            field: "status"
          },
          {
            name: "Usuário",
            field: "usuario"
          },
          {
            name: "Data/Hora",
            field: "dataHora",
            cellFilter: "date:'dd/MM/yyyy - HH.mm'",
            filterCellFiltered: true
          }
        ]
      };

      $scope.init = function(){
        $scope.getYears();
        $scope.getMonths();
        $scope.getResumoReembolso();
        $scope.getAcoes();
        $scope.getAcoesExcluidas();
        $scope.getEtapas();
        $scope.getAtencao();
      }

      $scope.init()
    
    }
  ]);;