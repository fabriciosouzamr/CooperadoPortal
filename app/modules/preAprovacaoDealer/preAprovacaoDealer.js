angular
  .module("preAprovacaoDealerModule", [])
  .controller("preAprovacaoDealerTableCntrl", [
    "$scope",
    "$http",
    "uiGridConstants",
    "sysServicos",
    "$interval",
    "$stateParams",
    "$timeout",
    "$state",
    "$rootScope",
    "$cookieStore",
    "planoMidiaService",
    "applicationService",
    function (
        $scope,
        $http,
        uiGridConstants,
        sysServicos,
        $interval,
        $stateParams,
        $timeout,
        $state,
        $rootScope,
        $cookieStore,
        planoMidiaService,
        applicationService
    ) {
        debugger

        var totalRows;
        var idFab;
        $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
        $scope.getDealerID = function () {
            let promise = $http.get(rootURL + 'conta/eu');
            promise.then(
                function (ret) {
                    $scope.perfilID = ret.data.perfil.id;
                }
            )
        }
  
        $scope.getDealerID();
  
        $scope.removePlanoMidia = function (planoMidiaID) {
          
          if($scope.usuarioLogado.perfil == "Administrador"){
              sysServicos.sendErrorMsg(
                  401,
                  "",
                  ""
              );
              return;
          }
  
  
            let promise = $http.get(rootURL + "v1/inativarPlanoMidia/" + planoMidiaID);
            promise.then(
                function (ret) {
                    sysServicos.sendSuccessMsg("Plano apagado com sucesso!");
                    $scope.$parent.filter();
                    //recarregar lista aqui
                      // if( $scope.usuarioLogado.perfil = "Administrador"){
                      //     $scope.$$childHead.getPlanoLista($scope.filtro.dealerID);
                      // }else{
                      //     $scope.$$childHead.getPlanoLista($scope.dealer.dealerID);
                      // }
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
  
        $scope.closeModal = function () {
            $scope.$parent.$$childHead.closeModal();
        };
  
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
                gridApi.selection.on.rowSelectionChanged($scope, function (row) { });
  
                //evento de mudanca da qtde de registros visiveis na tabela
                gridApi.pagination.on.paginationChanged($scope, function (
                    newPage,
                    pageSize
                ) {
                    $scope.gridOptions1.paginationPageSize = pageSize;
                    // setTableHeight(totalRows);
                });
            },
            
            columnDefs: [
                {
                    name: "Nº Pré Aprovação",
                    field: "dealer_Base.nomeFantasia"
                },
                {
                    name: "Ano",
                    field: "dataCadastro",
                    cellFilter: "date:'dd/MM/yyyy - HH.mm'",
                    filterCellFiltered: true
                },
                {
                    name: "Mês",
                    field: "anoFiscal"
                },
                {
                    name: "Cód. Dealer",
                    field: "periodoFormatado"
                }, 
                {
                    name: "Dealer",
                    field: "usuario.name"
                }, 
                {
                    name: "Data Emissão",
                    field: "usuario.name"
                }, 
                {
                    name: "Status",
                    field: "usuario.name"
                }, 
                {
                    name: "Dias na fila",
                    field: "usuario.name"
                }, 
                {
                    //botao editar
                    name: "Visual.",
                    width: 90,
                    enableFiltering: false,
                    cellTemplate:
                          ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.pdf\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-pdf-o font-18"></i></a> '
                      +   ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.xlsx\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-excel-o font-18"></i></a> '
                      +   ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.jpg\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-image-o font-18"></i></a> '
                      +   ' <a ng-if="!row.entity.planoMidiaUpload.url.includes(\'.pdf\') && !row.entity.planoMidiaUpload.url.includes(\'.xlsx\') && !row.entity.planoMidiaUpload.url.includes(\'.jpg\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-image-o font-18"></i></a> '
                      +   ' <button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.removePlanoMidia(row.entity.planoMidiaID)" ><i style="color: red !important;" class="fas fa-trash"></i></button>',
                    cellClass: "text-right"
                }, 
                {
                    //botao editar
                    name: "Info",
                    width: 90,
                    enableFiltering: false,
                    cellTemplate:
                          ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.pdf\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-pdf-o font-18"></i></a> '
                      +   ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.xlsx\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-excel-o font-18"></i></a> '
                      +   ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.jpg\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-image-o font-18"></i></a> '
                      +   ' <a ng-if="!row.entity.planoMidiaUpload.url.includes(\'.pdf\') && !row.entity.planoMidiaUpload.url.includes(\'.xlsx\') && !row.entity.planoMidiaUpload.url.includes(\'.jpg\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-image-o font-18"></i></a> '
                      +   ' <button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.removePlanoMidia(row.entity.planoMidiaID)" ><i style="color: red !important;" class="fas fa-trash"></i></button>',
                    cellClass: "text-right"
                }
            ]
        };
  
      //   console.log( $scope.$parent.filtro);
        
        $scope.getPlanoLista = function (dealerIDFiltrado) {
          var caminho = ""
          $scope.dealer = $cookieStore.get("dealerUsuario");
          // console.log(dealerIDFiltrado);
          var dealerID = 0;
          if($scope.usuarioLogado.perfil == "Administrador"){
              
              dealerID = dealerIDFiltrado;
          }
          else{
              dealerID = $scope.dealer.dealerID;
          }
          var promise = $http.get(
              rootURL + "v1/buscarPlanoMidiaPorDealer/"+ dealerID
          );
          promise.then(
                function (ret) {
                    $scope.gridOptions1.data = ret.data.result;
                    $scope.acoesRealizadas = ret.data;
                    $scope.hideGrid = false;
  
                    totalRows = $scope.gridOptions1.data.length;
                    // setTableHeight(totalRows);
  
                    //corrige bug com alinhamento das colunas da tabela no Firefox
                    $interval(
                        function () {
                            $scope.gridApi.core.handleWindowResize();
                        }, 500, 5
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
          }
        $scope.toggleFiltering = function () {
            $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
                .enableFiltering;
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        };
  
        $scope.filter = function () {
            $scope.gridApi.grid.refresh();
        };
        
    }
  ]);