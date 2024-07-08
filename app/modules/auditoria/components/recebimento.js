// angular
//   .module("sysMaster")
//   .component("auditoriaRecebimento", {
//     templateUrl: "./modules/auditoria/components/views/recebimento.html",
//     controller: "auditoriaRecebimentoController",
//     bindings: {
//       gridConstantsChangeOptions: "<",
//       onChange: "&",
//       onTeste: "&"
//     }
//   })
//   .controller("auditoriaRecebimentoController", function() {
//     //component controller
//     var $scope = this;

//     function rowTemplate() {
//       return setTimeout(function() {
//         return (
//           "<div ng-class=\"{ 'inactiveRow': grid.appScope.rowFormatter( row ) }\">" +
//           '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
//           "</div>"
//         );
//       }, 100);
//     }

//     $scope.rowFormatter = function(row) {
//       return row.entity.ativo == false;
//     };

//     $scope.gridOptions1 = {
//       enableFiltering: false,

//       paginationPageSizes: [10, 25, 50, 75],
//       paginationPageSize: 10,

//       enableHorizontalScrollbar: 0,
//       enableVerticalScrollbar: 0,

//       enableRowSelection: true,
//       enableRowHeaderSelection: false,

//       multiSelect: false,
//       modifierKeysToMultiSelect: false,
//       noUnselect: true,

//       enableGridMenu: false,

//       rowHeight: 32,

//       rowTemplate: rowTemplate(),

//       onRegisterApi: function(gridApi) {
//         $scope.gridApi = gridApi;
//         $scope.gridApi.selection.clearSelectedRows();
//         $scope.gridApi.core.notifyDataChange(
//           $scope.gridConstantsChangeOptions || "options"
//         );
//         //recebe numero do ato quando selecionado
//         // gridApi.selection.on.rowSelectionChanged($scope, function(row) {});
//         //evento de mudanca da qtde de registros visiveis na tabela
//         console.log(">> gridapi", gridApi, this, $scope);
//         // $scope.gridApi.pagination.on.paginationChanged($scope, function(
//         //   newPage,
//         //   pageSize
//         // ) {
//         //   $scope.gridOptions1.paginationPageSize = pageSize;
//         //   // setTableHeight(totalRows);
//         // });
//       },

//       columnDefs: [
//         { name: "Marca", field: "marca" },
//         { name: "Tipo Mídia", field: "anoFiscal" },
//         { name: "Nota Débito", field: "nota" },
//         { name: "Mês/Ano", field: "mesano" },
//         { name: "Valor Total", field: "usuario" },
//         { name: "Código Dealer", field: "budgetDealerID" },
//         { name: "Dealer", field: "dealer" },
//         { name: "Data Emissão", field: "dataEmissao" },
//         { name: "Dias na Fila", field: "diasNoStatus" },
//         {
//           name: "",
//           field: "budgetDealerID",
//           width: 70,
//           cellTemplate:
//             '<button class="btn btn-primary btn-table" type="button" title="Detalhes" ng-click="grid.appScope.onReabrirClick(row.entity)">Reabrir</button>'
//         }
//       ]
//     };

//     $scope.onReabrirClick = function(value) {
//       console.log(" >>> click", value);
//     };

//     //mock

//     $scope.mockMe = function() {
//       var mok = {
//         budgetDealerID: 0,
//         marca: "string",
//         percentual: 0,
//         nota: "string",
//         mesano: "03/19",
//         valorTotal: 1110,
//         codigoDealer: "string",
//         dealer: "Nome Dealer",
//         dataEmissao: "2019-03-21T16:55:50.988Z",
//         status: "string",
//         diasNoStatus: 0
//       };
//       $scope.gridOptions1.data = [];

//       for (let i = 0; i < 50; i++) {
//         $scope.gridOptions1.data.push(mok);
//       }
//     };
//     $scope.mockMe();
//   });

//auditoria.controller.js
angular
  .module("auditoriaModule", [])
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
      function rowTemplate() {
        return setTimeout(function() {
          return (
            "<div ng-class=\"{ 'inactiveRow': grid.appScope.rowFormatter( row ) }\">" +
            '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
            "</div>"
          );
        }, 100);
      }

      $scope.rowFormatter = function(row) {
        return row.entity.ativo == false;
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

        rowHeight: 32,

        rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            $scope.gridConstantsChangeOptions || "options"
          );
          //recebe numero do ato quando selecionado
          // gridApi.selection.on.rowSelectionChanged($scope, function(row) {});
          //evento de mudanca da qtde de registros visiveis na tabela
          console.log(">> gridapi", gridApi, this, $scope);
          // $scope.gridApi.pagination.on.paginationChanged($scope, function(
          //   newPage,
          //   pageSize
          // ) {
          //   $scope.gridOptions1.paginationPageSize = pageSize;
          //   // setTableHeight(totalRows);
          // });
        },

        columnDefs: [
          { name: "Marca", field: "marca" },
          { name: "Tipo Mídia", field: "anoFiscal" },
          { name: "Nota Débito", field: "nota" },
          { name: "Mês/Ano", field: "mesano" },
          { name: "Valor Total", field: "usuario" },
          { name: "Código Dealer", field: "budgetDealerID" },
          { name: "Dealer", field: "dealer" },
          { name: "Data Emissão", field: "dataEmissao",cellTemplate:
            '<div>{{row.entity.dataEmissao | date: "dd-MM-yyyy" }}</div>'
          },
          { name: "Dias na Fila", field: "diasNoStatus" },
          {
            name: "",
            field: "budgetDealerID",
            width: 70,
            cellTemplate:
              '<button class="btn btn-primary btn-table" type="button" title="Detalhes" ng-click="grid.appScope.onReabrirClick(row.entity)">Reabrir</button>'
          }
        ]
      };

      $scope.onReabrirClick = function(value) {
        console.log(" >>> click", value);
      };

      //mock

      $scope.mockMe = function() {
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
      $scope.mockMe();

      // $scope.init = function() {
      //   validaUsuarioAbaProcesso()
      //     .then(function(res) {
      //       return $scope.updateView();
      //     })
      //     .catch(function(error) {
      //       console.log(error);
      //     });
      // };

      // $scope.init();
    }
  ]);
