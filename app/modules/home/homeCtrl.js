angular
    .module("homeModule", ["ui.bootstrap"])
    .controller("homeController", [
        "$scope",
        "$http",
        "$state",
        "$rootScope",
        "sysServicos",
        "$timeout",
        "moment",
        "$cookieStore",
        function ($scope, $http, $state, $rootScope, sysServicos, $timeout, moment, $cookieStore) {
            $scope.detalheEventoCalendario = {};
            $scope.noticia = {};
            $scope.status = {};
            $scope.channelColor = {
                "background-color": "transparent",
                color: "#000000"
            };
            $scope.viewChangeEnabled = false;

            $rootScope.confirmaEmail = $cookieStore.get("confirmaEmail");

            $scope.getBanners = function () {
                let promise = $http.get(rootURL + "banner/todos");
                promise.then(
                    function (ret) {
                        $scope.myInterval = 5000;
                        var itens = ret.data;
                        let urls = itens.map(function (i, index) {
                            let item = {};
                            item["id"] = index;
                            item["img"] = i.url;
                            return item;
                        });
                        $scope.slider = urls;
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(
                            error.status,
                            error.statusText,
                            error.config.url,
                            error.data.Message
                        );
                    }
                );
            };

            //$scope.getLimite = function () {
            //    var promise = $http.get(rootURL + "periodo/hoje");
            //    promise.then(
            //        function (response) {
            //            $scope.limite = response.data[0].dias;
            //            console.log(response.data);
            //        },
            //        function (error) {
            //            sysServicos.sendErrorMsg(
            //                error.status,
            //                error.statusText,
            //                error.config.url,
            //                error.data.Message
            //            );
            //        }
            //    );
            //};

            $scope.collapse = function (item) {
                if (item == $scope.collapseActiveItem) {
                    $scope.collapseActiveItem = null;
                } else {
                    $scope.collapseActiveItem = item;
                }
            };

            $scope.getNoticias = function () {
                let promise = $http.get(rootURL + "noticia/ativas");
                promise.then(
                    function (response) {
                        $scope.notices = response.data;
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(
                            error.status,
                            error.statusText,
                            error.config.url,
                            error.data.Message
                        );
                    }
                );
            };

            $scope.noticiaLida = function (noticiaID) {
                if (noticiaID) {
                    let promise = $http.post(rootURL + "v1/noticiaControle", {
                        noticiaID: noticiaID
                    });
                    promise.then(function (ret) {
                        sysServicos.sendSuccessMsg("Notícia Lida");
                        $scope.getNoticia();
                    });
                } else {
                    sysServicos.sendWarnMsg("Leia a Notícia");
                }
            };

            $scope.getDadosUsuarioLogado = function () {
                var promise = $http.get(rootURL + "conta/eu");
                promise.then(
                    function (ret) {
                        $rootScope.usuarioLogado = {};

                        if ($rootScope.confirmaEmail == false) {
                            $rootScope.usuarioLogado.emailConfirmado = true;
                        } else {
                            $rootScope.usuarioLogado.emailConfirmado = ret.data.emailConfirmado;
                        }

                        $rootScope.usuarioLogado.nome = ret.data.nome;
                        $rootScope.usuarioLogado.userName = ret.data.login;
                        $rootScope.usuarioLogado.id = ret.data.id;
                        $rootScope.usuarioLogado.email = ret.data.email;
                        $rootScope.usuarioLogado.perfil = ret.data.perfil.nome;
                        $rootScope.usuarioLogado.dealerID = ret.data.dealerID;
                        $rootScope.usuarioLogado.acessoSecundario = ret.data.acessoSecundario;

                        $rootScope.usuarioLogado.permissionT50 = false;
                        $rootScope.usuarioLogado.permissionT100 = false;
                        $rootScope.usuarioLogado.permissionL50 = false;
                        $rootScope.usuarioLogado.permissionL100 = false;

                        $rootScope.usuarioLogado.perfilCoordenador = false;
                        $rootScope.usuarioLogado.perfilGerenteRegional = false;
                        $rootScope.usuarioLogado.perfilAuditor = false;
                        $rootScope.usuarioLogado.perfilAdministrador = false;
                        $rootScope.usuarioLogado.perfilDealer = false;
                        $rootScope.usuarioLogado.perfilConsultor = false;
                        $rootScope.usuarioLogado.perfilDentsu = false;

                        $rootScope.showConfirmation = true;

                    },
                    function (err) {
                        sysServicos.sendErrorMsg(
                            err.status,
                            err.statusText,
                            err.config.url,
                            err.data.Message
                        );
                    }
                );
            };

            $scope.confirmEmail = function () {
                var objEnvio = {};
                objEnvio.email = $scope.email;
                let promise = $http.patch(rootURL + 'conta/eu/alterar-email', objEnvio);
                promise.then(
                    function (ret) {
                        sysServicos.sendSuccessMsg("Confirmação de email realizada com sucesso");
                        $scope.getDadosUsuarioLogado();
                        $rootScope.usuarioLogado.emailConfirmado = true;
                        $cookieStore.put("perfilUsuario", $rootScope.usuarioLogado);
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(
                            err.status,
                            err.data.status,
                            err.config.url,
                            err.data.message
                        );
                    }
                )
            }

            $scope.init = function () {
                $scope.getDadosUsuarioLogado();
                $scope.getNoticias();
                //$scope.getLimite();
                $scope.getBanners();
            };

            $scope.init();
        }
    ])

    // tabelas
    .controller("inconsistenciaTableCntrl", [
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
            applicationService
        ) {
            var totalRows;
            var idFab;

            $scope.statusPeriodo = 0;

            $scope.getDadosUsuarioLogado();
            $scope.preparaViewParaStatusMes = function () {
                $scope.statusPeriodo = $stateParams.statusPeriodo;
            };

            $scope.setPageMode = function () {
                $scope.canEdit = $scope.statusPeriodo == 2 || $scope.statusPeriodo == 1;
                console.log(
                    " >>> init detalhe",
                    $scope.statusPeriodo,
                    $scope.acao.statusID,
                    $scope.canEdit
                );
            };

            $scope.viewProcessoDetalhe = function (mes, anoFiscal) {
                //sysServicos.sendWarnMsg("Em breve! Função em desenvolvimento");
                $cookieStore.put("reembolsoMes", mes);
                $cookieStore.put("reembolsoAno", anoFiscal);
                $state.go("reembolsoDealer");
            };

            $scope.viewAcao = function (budgetId, aplication, budgetDealerNFID, id) {
                var stateParams = {
                    budgetId: budgetId,
                    applicationId: aplication,
                    currentId: id,
                    statusPeriodo: "inconsistente"
                };
                $state.go("reembolsoAcaoDentsuDet", stateParams);
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

                rowHeight: 40,

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
                    });
                },
                columnDefs: [
                    {
                        name: "Ano",
                        field: "anoFiscal",
                        width: 50
                    },
                    {
                        name: "Mês",
                        field: "mes",
                        width: 50
                    },
                    {
                        name: "Número ND",
                        field: "budgetDealerID",
                        width: 100
                    },
                    {
                        name: "Tipo Mídia",
                        field: "applicationName",
                        cellTemplate:
                            "<div>{{row.entity.applicationName}} {{row.entity.applicationPerc}}%</div>",
                        width: 100
                    },
                    {
                        name: "Dealer",
                        field: "nomeFantasia"
                    },
                    {
                        name: "Dias em aberto",
                        field: "diasNoMesmoStatus",
                        width: 120
                    },
                    {
                        name: "Ações",
                        width: 80,
                        cellTemplate:
                            '<button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.viewProcessoDetalhe(row.entity.mes, row.entity.anoFiscal)"><i class="fa fa-eye font-20"></i> </button>',
                        cellClass: "text-right"
                    }
                ]
            };

            $rootScope.getInconsistencia = function () {
                let promise = $http.get(rootURL + "v1/processosinconsistentes");

                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        console.log("Dados", ret.data);
                        $scope.hideGrid = false;
                        console.log(ret.data);
                        totalRows = ret.data.length;

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
            setTimeout(function () {
                $scope.getInconsistencia();
            }, 500);
        }
    ])

    .controller("inconsistenciasAgenciaTableCntrl", [
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
            applicationService
        ) {
            var totalRows;
            var idFab;

            $scope.statusPeriodo = 0;

            $scope.getDadosUsuarioLogado();
            $scope.preparaViewParaStatusMes = function () {
                $scope.statusPeriodo = $stateParams.statusPeriodo;
            };

            $scope.setPageMode = function () {
                $scope.canEdit = $scope.statusPeriodo == 2 || $scope.statusPeriodo == 1;
                console.log(
                    " >>> init detalhe",
                    $scope.statusPeriodo,
                    $scope.acao.statusID,
                    $scope.canEdit
                );
            };

            $scope.viewProcessoAgenciaDetalhe = function (
                mes,
                anoFiscal,
                regiaoID,
                dealerID
            ) {
                //sysServicos.sendWarnMsg("Em breve! Função em desenvolvimento");
                $cookieStore.put("reembolsoMes", mes);
                $cookieStore.put("reembolsoAno", anoFiscal);
                $cookieStore.put("regiao", regiaoID);
                $cookieStore.put("reembolsoDealer", dealerID);
                $state.go("reembolsoDentsu");
            };

            $scope.viewAcao = function (budgetId, aplication, budgetDealerNFID, id) {
                var stateParams = {
                    budgetId: budgetId,
                    applicationId: aplication,
                    currentId: id,
                    statusPeriodo: "inconsistente"
                };
                $state.go("reembolsoAcaoDentsuDet", stateParams);
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

                rowHeight: 40,

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
                    });
                },
                columnDefs: [
                    {
                        name: "Ano",
                        field: "anoFiscal",
                        width: 50
                    },
                    {
                        name: "Mês",
                        field: "mes",
                        width: 50
                    },
                    {
                        name: "Número ND",
                        field: "budgetDealerID",
                        width: 100
                    },
                    {
                        name: "Tipo Mídia",
                        field: "applicationName",
                        cellTemplate:
                            "<div>{{row.entity.applicationName}} {{row.entity.applicationPerc}}%</div>",
                        width: 100
                    },
                    {
                        name: "Dealer",
                        field: "nomeFantasia"
                    },
                    {
                        name: "Dias em aberto",
                        field: "diasNoMesmoStatus",
                        width: 120
                    },
                    {
                        //botao editar
                        name: "Ações",
                        width: 80,
                        cellTemplate:
                            '<button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.viewProcessoAgenciaDetalhe(row.entity.mes, row.entity.anoFiscal, row.entity.regiaoID, row.entity.dealerID)"><i class="fa fa-eye font-20"></i> </button>',
                        cellClass: "text-right"
                    }
                ]
            };

            $rootScope.getInconsistencia = function () {
                let promise = $http.get(rootURL + "v1/processosinconsistentes");

                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        console.log("Dados", ret.data);
                        $scope.hideGrid = false;
                        console.log(ret.data);
                        totalRows = ret.data.length;

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
            setTimeout(function () {
                $scope.getInconsistencia();
            }, 500);
        }
    ])
