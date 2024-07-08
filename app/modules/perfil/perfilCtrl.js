angular.module('verbaModule',[])
    .controller('verbaController', ['$scope', '$http', '$rootScope', 'sysServicos', 'Upload', '$timeout',
        function ($scope, $http, $rootScope, sysServicos, Upload, $timeout) {
            $scope.marcaActive = 'toyota';
            $scope.abaActive = 'midia50';
            $scope.filtro = {};
            $scope.anoFiscal = {};
            $scope.meses = {};
            $scope.midia100 = {};

           // $scope.abreModal('#modalAlterar', 'mfp-sign');

            $scope.changeMarca = function (marca) {
                $scope.marcaActive = marca;
                console.log($scope.marcaActive);
            };
            $scope.changeAba = function (aba) {
                $scope.abaActive = aba;
            };

            $scope.dropMeses = function () {
                //var promise = $http.get(rootURL + 'mes');
                promise = $http.get(rootJson + 'verba/meses.json');
                promise.then(
                    function (ret) {
                        $scope.meses = ret.data;
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    }
                );
            };
            $scope.dropAnoFiscal = function () {
                //var promise = $http.get(rootURL + 'anoFiscal');
                promise = $http.get(rootJson + 'verba/anoFiscal.json');
                promise.then(
                    function (ret) {
                        $scope.anoFiscal = ret.data;
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    }
                );
            };


            $scope.filtrar = function () {

            };

            
            $scope.table50100 = function() {
                 //var promise = $http.get(rootURL + 'veiculo/busca?' + obj);
                 promise = $http.get(rootJson + 'verbanacional.json');
                 promise.then(
                     function (ret) {
                        $scope.midia100 = ret.data;
                     },
                     function (err) {
                         sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                     }
                 );
            };
            
            $scope.openListTable = function (id) {
                console.log('r',id);
                $('#listRegiao_' + id).toggleClass('hide');
                $('#btnPlusR_' + id).toggleClass('plus-minus');
            };
            $scope.openListDealer = function (id) {
                console.log('d',id);
                $('#listDealer_' + id).toggleClass('hide');
                $('#btnPlusD_' + id).toggleClass('plus-minus');
            };


            $scope.init = function () {
                $scope.dropMeses();
                $scope.dropAnoFiscal();
                $scope.table50100();
            }
            $scope.init();


            

        }
    ])
    // tabelas

    .controller('importacaoTableCntrl', ['$scope', '$http', 'uiGridConstants', 'sysServicos', '$interval', '$stateParams', '$timeout', '$state', '$rootScope',
        function ($scope, $http, uiGridConstants, sysServicos, $interval, $stateParams, $timeout, $state, $rootScope) {

            var totalRows;
            var idFab;

            $scope.hideGrid = true;

            function rowTemplate() {
                return $timeout(function () {
                    return '<div ng-class="{ \'inactiveRow\': grid.appScope.rowFormatter( row ) }">' +
                        '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                        '</div>'
                    ;
                }, 100)
            };

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
                    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

                    //recebe numero do ato quando selecionado
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                    });

                    //evento de mudanca da qtde de registros visiveis na tabela
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        $scope.gridOptions1.paginationPageSize = pageSize;
                        // setTableHeight(totalRows);
                    });
                },

                columnDefs: [
                    { name: 'Mês', field: 'mes', },
                    { name: 'Ano Fiscal', field: 'anoFiscal', },
                    { name: 'Tipo', field: 'tipo', },
                    { name: 'Nome do Arquivo', field: 'NomeArquivo', },
                    { name: 'Usuário', field: 'usuario', },
                    { name: 'Data', field: 'data', },
                    { name: 'Hora', field: 'hora', },
                    { name: 'Ok', field: 'ok', },
                    { name: 'Duplicado', field: 'duplicado', },
                    { name: 'Erro', field: 'erro', },
                    { name: 'Status', field: 'status', width: 100,
                        cellTemplate: '<div class="ui-grid-cell-contents" ng-show="row.entity.ativo==true">Ativo</div>' +
                        '<div class="ui-grid-cell-contents" ng-show="row.entity.ativo==false">Inativo</div>', 
                    },
                ],
            };

            $scope.getVerba = function () {
                //var promise = $http.get(rootURL + 'veiculo/busca?' + obj);
                promise = $http.get(rootJson + 'verba.json');
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        // setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
                        $interval(function () {
                            $scope.gridApi.core.handleWindowResize();
                        }, 500, 5);
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    }
                );
            }

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1.enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };
            $scope.getVerba();

           
        }
    ])

    .controller('statusDealerTableCntrl', ['$scope', '$http', 'uiGridConstants', 'sysServicos', '$interval', '$stateParams', '$timeout', '$state', '$rootScope',
        function ($scope, $http, uiGridConstants, sysServicos, $interval, $stateParams, $timeout, $state, $rootScope) {

            var totalRows;
            var idFab;

            $scope.hideGrid = true;

            function rowTemplate() {
                return $timeout(function () {
                    return '<div ng-class="{ \'inactiveRow\': grid.appScope.rowFormatter( row ) }">' +
                        '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                        '</div>'
                        ;
                }, 100)
            };

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
                    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

                    //recebe numero do ato quando selecionado
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                    });

                    //evento de mudanca da qtde de registros visiveis na tabela
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        $scope.gridOptions1.paginationPageSize = pageSize;
                        // setTableHeight(totalRows);
                    });
                },

                columnDefs: [
                    { name: 'Usuário', field: 'mes', },
                    { name: 'Data/hora', field: 'anoFiscal', },
                    { name: 'Dealer', field: 'NomeArquivo', },
                    { name: 'Descricao', field: 'usuario', },
                ],
            };

            $scope.getVerba = function () {
                //var promise = $http.get(rootURL + 'veiculo/busca?' + obj);
                promise = $http.get(rootJson + 'verba.json');
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        // setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
                        $interval(function () {
                            $scope.gridApi.core.handleWindowResize();
                        }, 500, 5);
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    }
                );
            }

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1.enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };
            $scope.getVerba();


        }
    ])


    .controller('lexusTableCntrl', ['$scope', '$http', 'uiGridConstants', 'sysServicos', '$interval', '$stateParams', '$timeout', '$state', '$rootScope',
        function ($scope, $http, uiGridConstants, sysServicos, $interval, $stateParams, $timeout, $state, $rootScope) {

            var vm = this;
 
            vm.gridOptions = {
              expandableRowTemplate: 'expandableRowTemplate.html',
              expandableRowHeight: 150,
              //subGridVariable will be available in subGrid scope
              expandableRowScope: {
                subGridVariable: 'subGridScopeVariable'
              }
            };
           
            vm.gridOptions.columnDefs = [
              { name: 'id' },
              { name: 'name'},
              { name: 'age'},
              { name: 'address.city'}
            ];
           
            $http.get(rootJson + 'complex.json')

              .then(function(response) {
                var data = response.data;
           
                for(i = 0; i < data.length; i++){
                  data[i].subGridOptions = {
                    columnDefs: [{name: 'Id', field: 'id'}, {name: 'Name', field: 'name'}],
                    data: data[i].friends
                  };
                }
                vm.gridOptions.data = data;
              });
           
              vm.gridOptions.onRegisterApi = function(gridApi){
                vm.gridApi = gridApi;
              };
           
              vm.expandAllRows = function() {
                vm.gridApi.expandable.expandAllRows();
              };
           
              vm.collapseAllRows = function() {
                vm.gridApi.expandable.collapseAllRows();
              };
           
              vm.toggleExpandAllBtn = function() {
                vm.gridOptions.showExpandAllButton = !vm.gridOptions.showExpandAllButton;
              };
           
          app.controller('SecondCtrl', function SecondCtrl($http, $log) {
                  var vm = this;
           
                  vm.gridOptions = {
                          enableRowSelection: true,
                          expandableRowTemplate: 'expandableRowTemplate.html',
                          expandableRowHeight: 150
                  }
           
                  vm.gridOptions.columnDefs = [
                          { name: 'id', pinnedLeft:true },
                          { name: 'name'},
                          { name: 'age'},
                          { name: 'address.city'}
                  ];
           
                  // $http.get('/data/500_complex.json')
                  $http.get(rootJson + 'complex.json')
                          .then(function(response) {
                                  var data = response.data;
           
                                  for(i = 0; i < data.length; i++) {
                                          data[i].subGridOptions = {
                                                  columnDefs: [{name: 'Id', field: 'id'}, {name: 'Name', field: 'name'}],
                                                  data: data[i].friends
                                          };
                                  }
                                  vm.gridOptions.data = data;
                          });
          });
           
          app.controller('ThirdCtrl', function ThirdCtrl($scope, $http, $log) {
                  var vm = this;
           
                  vm.gridOptions = {
                          expandableRowTemplate: 'expandableRowTemplate.html',
                          expandableRowHeight: 150,
                          onRegisterApi: function (gridApi) {
                                  gridApi.expandable.on.rowExpandedStateChanged($scope, function (row) {
                                          if (row.isExpanded) {
                                                  row.entity.subGridOptions = {
                                                          columnDefs: [
                                                          { name: 'name'},
                                                          { name: 'gender'},
                                                          { name: 'company'}
                                                  ]};
           
                                                  $http.get('/data/100.json')
                                                          .then(function(response) {
                                                                  row.entity.subGridOptions.data = response.data;
                                                          });
                                          }
                                  });
                          }
                  };
           
                  vm.gridOptions.columnDefs = [
                          { name: 'id', pinnedLeft:true },
                          { name: 'name'},
                          { name: 'age'},
                          { name: 'address.city'}
                  ];
           
                  $http.get('/data/500_complex.json')
                          .then(function(response) {
                                  vm.gridOptions.data = response.data;
                          });
          });
           
          app.controller('FourthCtrl', function FourthCtrl($http, $log) {
                  var vm = this;
           
                  vm.gridOptions = {
                          enableRowSelection: true,
                          expandableRowTemplate: 'expandableRowTemplate.html',
                          expandableRowHeight: 150
                  };
           
                  vm.gridOptions.columnDefs = [
                          { name: 'id', pinnedLeft:true },
                          { name: 'name'},
                          { name: 'age'},
                          { name: 'address.city'}
                  ];
           
                  $http.get('/data/500_complex.json')
                          .then(function(response) {
                                  var data = response.data;
           
                                  for(i = 0; i < data.length; i++) {
                                          data[i].subGridOptions = {
                                                  columnDefs: [{name: 'Id', field: 'id'}, {name: 'Name', field: 'name'}],
                                                  data: data[i].friends,
                                                  disableRowExpandable : (i % 2 === 0)
                                          };
                                  }
                                  vm.gridOptions.data = data;
                          });
          });
        }
    ])


    .controller('textTableCntrl', ['$scope', '$http', 'uiGridConstants', 'uiGridTreeViewConstants', 'sysServicos', '$interval', '$stateParams', '$timeout', '$state', '$rootScope',
        function ($scope, $http, uiGridConstants, uiGridTreeViewConstants, sysServicos, $interval, $stateParams, $timeout, $state, $rootScope) {

            var totalRows;
            var idFab;

            $scope.hideGrid = true;

            function rowTemplate() {
                return $timeout(function () {
                    return '<div ng-class="{ \'inactiveRow\': grid.appScope.rowFormatter( row ) }">' +
                        '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                        '</div>'
                    ;
                }, 100)
            };

            $scope.rowFormatter = function (row) {
                return row.entity.ativo == false;
            };

            $scope.gridOptions = {
                enableFiltering: false,
                showTreeExpandNoChildren: true,

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
                    $scope.gridApi.treeBase.on.rowExpanded($scope, function(row) {
                        if( row.entity.$$hashKey === $scope.gridOptions.data[50].$$hashKey && !$scope.nodeLoaded ) {
                          $interval(function() {
                            $scope.gridOptions.data.splice(51,0,
                              {name: 'Dynamic 1', gender: 'female', age: 53, company: 'Griddable grids', balance: 38000, $$treeLevel: 1},
                              {name: 'Dynamic 2', gender: 'male', age: 18, company: 'Griddable grids', balance: 29000, $$treeLevel: 1}
                            );
                            $scope.nodeLoaded = true;
                          }, 2000, 1);
                        }
                    });

                    $scope.gridApi.selection.clearSelectedRows();
                    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

                    //recebe numero do ato quando selecionado
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                    });

                    //evento de mudanca da qtde de registros visiveis na tabela
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        $scope.gridOptions.paginationPageSize = pageSize;
                        // setTableHeight(totalRows);
                    });
                },

                columnDefs: [
                    { name: 'name', width: '30%' },
                    { name: 'gender', width: '20%' },
                    { name: 'age', width: '20%' },
                    { name: 'company', width: '25%' },
                    { name: 'state', width: '35%' },
                    { name: 'balance', width: '25%', cellFilter: 'currency' }
                ],
            };

            $scope.getVerba = function () {
                //var promise = $http.get(rootURL + 'veiculo/busca?' + obj);
                promise = $http.get(rootJson + 'verbateste.json');
                promise.then(
                    function (ret) {
                        //$scope.gridOptions.data = ret.data;
                        $scope.hideGrid = false;
                        var data = ret.data;

                        for ( var i = 0; i < data.length; i++ ){
                            data[i].state = data[i].address.state;
                            data[i].balance = Number( data[i].balance.slice(1).replace(/,/,'') );
                        }
                        data[0].$$treeLevel = 0;
                        data[1].$$treeLevel = 1;
                        // data[10].$$treeLevel = 1;
                        // data[11].$$treeLevel = 1;
                        // data[20].$$treeLevel = 0;
                        // data[25].$$treeLevel = 1;
                        // data[50].$$treeLevel = 0;
                        // data[51].$$treeLevel = 0;

                        $scope.gridOptions.data = data;

                        totalRows = $scope.gridOptions.data.length;
                        // setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
                        $interval(function () {
                            $scope.gridApi.core.handleWindowResize();
                        }, 500, 5);
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    }
                );
            }

            $scope.toggleFiltering = function () {
                $scope.gridOptions.enableFiltering = !$scope.gridOptions.enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };

            $scope.expandAll = function(){
                $scope.gridApi.treeBase.expandAllRows();
            };
        
            $scope.toggleRow = function( rowNum ){
                $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
            };
        
            $scope.toggleExpandNoChildren = function(){
                $scope.gridOptions.showTreeExpandNoChildren = !$scope.gridOptions.showTreeExpandNoChildren;
                $scope.gridApi.grid.refresh();
            };
            
            $scope.getVerba();
        }
    ])