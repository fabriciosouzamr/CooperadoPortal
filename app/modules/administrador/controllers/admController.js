angular.module('admModule', [])
    .controller('admController', ['$scope', '$http', '$rootScope', 'sysServicos', '$timeout', '$location', '$stateParams',
        function ($scope, $http, $rootScope, sysServicos, $timeout, $location, $stateParams) {
            $scope.administrador = {};
            $scope.flagNewAdm = true;
            $scope.ufs = [];
            $scope.citys = [];

            if($stateParams.currentId.length > 0){
                getById($stateParams.currentId);
                $scope.flagNewAdm = false;
            }

            // > Busca cidades
            function getById(id) {
                let promise = $http.get(rootURL + 'admin/administrador/' + id);
                promise.then(
                    function (response) {
                        $scope.administrador = response.data;
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url, error.data.Message);
                    }
                );
            }
            // <

            // > Busca UF
            function searchUF() {
                let promise = $http.get(rootURL + 'endereco/uf');
                promise.then(
                    function (response) {
                        $scope.ufs = response.data;
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url, error.data.Message);
                    }
                );
            }
            // > Busca cidades
            $scope.searchCityByUF = function (id) {
                let promise = $http.get(rootURL + 'endereco/cidade/' + id);
                promise.then(
                    function (response) {
                        $scope.citys = response.data;
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url, error.data.Message);
                    }
                );
            }
            // <

            // > Novo administrador
            $scope.saveNewAdm = function () {
                $scope.administrador.nomeUsuario = $scope.administrador.nomeUsuario.replace(" ", "").replace(".", "").replace("-", "");

                let data = $scope.administrador;
                let promise = $http.post(rootURL + 'admin/cadastroAdm', data);
                promise.then(
                    function (response) {
                        sysServicos.sendSuccessMsg('Cadastro salvo com sucesso!');
                        $location.path('/administrador');
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url);
                    }
                );
            }
            // <
            // > Edita administrador
            $scope.saveUpdateAdm = function () {
                let data = $scope.administrador;
                let promise = $http.put(rootURL + 'admin/atualizarAdm/' + $stateParams.currentId, data);
                promise.then(
                    function (response) {
                        sysServicos.sendSuccessMsg('Dados atualizados com sucesso!');
                        $location.path('/administrador');
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url);
                    }
                );
            }
            // <
            // > Ativar administrador
            $scope.active = function () {
                let promise = $http.put(rootURL + 'admin/ativarAdm/' + $stateParams.currentId);
                promise.then(
                    function (response) {
                        sysServicos.sendSuccessMsg('Perfil ativado!');
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url);
                    }
                );
            }
            // <
            // > Desativar administrador
            $scope.desable = function () {
                let promise = $http.put(rootURL + 'admin/inativarAdm/' + $stateParams.currentId);
                promise.then(
                    function (response) {
                        sysServicos.sendSuccessMsg('Perfil inativado!');
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url);
                    }
                );
            }
            // <

            searchUF();
        }])
    .controller('admTableController', ['$scope', '$http', 'uiGridConstants', 'sysServicos', '$interval', '$stateParams', '$timeout', '$state', '$rootScope', '$location',
        function ($scope, $http, uiGridConstants, sysServicos, $interval, $stateParams, $timeout, $state, $rootScope, $location) {
            let totalRows;
            let idFab;

            $scope.hideGrid = true;

            $scope.addNewAdm = function () {
                $state.go('administradorEditar', { currentId: '' });
            };

            $scope.editAdm = function (id) {
                //$scope.getById(id);

                setTimeout(function(){
                    $state.go('administradorEditar', { currentId: id });
                }, 1000)
            };

            // // > Busca cidades
            // $scope.getById = function (id) {
            //     let promise = $http.get(rootURL + 'admin/administrador/' + id);
            //     promise.then(
            //         function (response) {
            //             $rootScope.administrador = response.data;
            //         },
            //         function (error) {
            //             sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url, error.data.Message);
            //         }
            //     );
            // }
            // // <

            // $scope.deleteProgram = function (id) {
            //     $scope.$parent.programadorIdExclusao = id;
            //     abreModal('#modalDeleteProgramador', 'mfp-sign');
            // };

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
                        setTableHeight(totalRows);
                    });
                },

                columnDefs: [
                    { name: 'Nome', field: 'nome' },
                    { name: 'Login', field: 'nomeUsuario' },
                    { name: 'Documento', field: 'cpf', cellFilter: 'docFormat:row.entity', filterCellFiltered: true, },
                    { name: 'E-mail', field: 'email' },
                    { name: 'Telefone', field: 'telefone' },
                    {
                        name: 'Status', field: 'ativo',
                        cellTemplate: '<div class="ui-grid-cell-contents" ng-show="row.entity.AprovadoBloqueado==true">Ativo</div>' +
                            '<div class="ui-grid-cell-contents" ng-show="row.entity.AprovadoBloqueado==false">Inativo</div>',
                    },
                    {//botao editar
                        name: ' ',
                        width: 50,
                        cellTemplate: '<button class="btn btn-primary btn-sm mt5" type="button" title="Editar" ng-click="grid.appScope.editAdm(row.entity.participanteId)"><i class="fa fa-edit"></i></button>',
                        cellClass: 'text-right'
                    },
                ],
            };

            // > Busca todos os administradores na base
            $scope.getAllAdm = function () {
                let promise = $http.get(rootURL + 'admin/administrador');
                promise.then(
                    function (response) {
                        $scope.gridOptions1.data = response.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
                        $interval(function () {
                            $scope.gridApi.core.handleWindowResize();
                        }, 500, 5);
                    },
                    function (error) {
                        // sysServicos.sendErrorMsg(error.status, error.statusText, error.config.url, error.data.Message);
                    }
                );
            }
            // <

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1.enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };

            function setTableHeight(rows) {
                if (rows >= $scope.gridOptions1.paginationPageSize) {
                    angular.element(document.getElementsByClassName('grid')[0]).css('min-height', (($scope.gridOptions1.paginationPageSize + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
                } else {
                    angular.element(document.getElementsByClassName('grid')[0]).css('min-height', ((rows + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
                }
            }

            $scope.getAllAdm();
        }
    ])