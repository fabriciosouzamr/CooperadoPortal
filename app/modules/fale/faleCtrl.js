angular
    .module("faleModule", [])
    .controller("faleController", [
        "$scope",
        "$http",
        "$rootScope",
        "sysServicos",
        "$stateParams",
        function ($scope, $http, $rootScope, sysServicos, $stateParams) {
            console.log("Fale Controller iniciada");
        }
    ])
    .controller("faleDetalhesController", [
        "$scope",
        "$http",
        "$rootScope",
        "sysServicos",
        "$stateParams",
        "Upload",
        "$timeout",
        "$cookieStore",
        function (
            $scope,
            $http,
            $rootScope,
            sysServicos,
            $stateParams,
            Upload,
            $timeout,
            $cookieStore
        ) {
            $scope.interaction = [];
            $scope.asked = {};
            $scope.pergunta = {};
            $scope.anexo = "";

            $scope.participante = $cookieStore.get("perfilUsuario");
            $scope.dealer = $cookieStore.get("dealerUsuario");

            $scope.downloadAnexo = function (anexolink) {
                window.open(anexolink, "_blank");
            };

            // > Fale-Conosco por ID
            let promiseAsked = $http.get(
                rootURL + "v1/faleConosco/" + $stateParams.currentId
            );
            promiseAsked.then(
                function (response) {
                    $scope.asked = response.data;

                    setTimeout(function () {
                        loadInteractions();
                    }, 1000);
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
            // <

            // > Busca assunto por ID
            function subjectById(subjectId) {
                let promiseSubject = $http.get(
                    rootURL +
                    "v1/faleConosco/" +
                    $stateParams.currentId +
                    "/assunto/" +
                    subjectId
                );
                promiseSubject.then(
                    function (response) {
                        $scope.asked.assunto = response.data.descricao;
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
            }
            // <

            // > API de Interação.
            function loadInteractions() {
                if (!$scope.flagNovo) {
                    let promiseInteraction = $http.get(
                        rootURL + "v1/faleConosco/" + $stateParams.currentId + "/mensagens"
                    );
                    promiseInteraction.then(
                        function (response) {
                            $scope.interaction = response.data;

                            let count = 0;
                            angular.forEach(response.data, function (interacao) {
                                if (interacao.responsavel == $scope.participante.cpf) {
                                    $scope.interaction[count].eu = true;
                                } else {
                                    $scope.interaction[count].eu = false;
                                }

                                count++;
                            });

                            if (response.data.FaleConoscoStatusId == 1) {
                                $scope.flagIsOpen = true;
                            }
                            $scope.dataCriacao = new Date(response.data.dataCriacao);
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
            }
            // <

            //upload de arquivo
            $scope.uploadFiles = function (files, errFiles) {
                angular.forEach(files, function (file) {
                    var ext = file.name.substr(file.name.lastIndexOf(".") + 1);
                    $scope.files = files;
                    $scope.errFiles = errFiles;

                    file.upload = Upload.upload({
                        method: "POST",
                        //url: rootURL + 'faleConosco/upload',
                        url: rootURL + "v2/enviar/contato",
                        data: {
                            files: file
                        }
                    });

                    file.upload.then(
                        function (response) {
                            $timeout(function () {
                                file.result = response.data;
                                $scope.anexo = response.data.result.filesUploaded[0];

                                sysServicos.sendSuccessMsg("Arquivo enviado com sucesso");
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

            // > envia resposta
            $scope.saveResposta = function () {
                let data = {};
                data.mensagem = $scope.pergunta.mensagem;
                data.faleConoscoId = $stateParams.currentId;
                if ($scope.anexo != "") {
                    data.url = $scope.anexo;
                }

                if (validate(1)) {
                    let promise = $http.post(rootURL + "v1/faleConosco/mensagem/", data);
                    promise.then(
                        function (response) {
                            sysServicos.sendSuccessMsg("Mensagem enviada.");
                            loadInteractions();
                            $scope.pergunta.mensagem = "";
                            $scope.anexo = "";
                            $scope.files = {};
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
                }
            };
            // <

            // > envia resposta
            $scope.finish = function () {
                let promise = $http.patch(
                    rootURL + "v1/faleConosco/" + $stateParams.currentId + "/encerrar"
                );
                promise.then(
                    function (response) {
                        sysServicos.sendSuccessMsg("Fale conosco finalizado.");
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
            // <

            //validacao
            var validate = function (id) {
                var countError = 0;
                var errorFields = [];
                var msgType = 0;

                var ret = true;

                //valida cadastro
                if (id == 1) {
                    if (
                        $scope.pergunta.mensagem == "" ||
                        $scope.pergunta.mensagem == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Mensagem");
                    }
                }
                //fim valida cadastro

                //envio de mensagens
                if (errorFields.length == 1 && msgType == 0) {
                    sysServicos.sendWarnMsg(
                        "O campo " + errorFields[0] + " é obrigatório."
                    );
                }

                if (errorFields.length == 2 && msgType == 0) {
                    var concatString = "";
                    concatString += errorFields[0] + " e " + errorFields[1];
                    sysServicos.sendWarnMsg(
                        "Os campos " + concatString + " são obrigatórios."
                    );
                }

                if (errorFields.length > 2 && msgType == 0) {
                    var concatString = "";
                    for (var n = 0; n < errorFields.length - 1; n++) {
                        concatString += errorFields[n] + ", ";
                    }
                    concatString = concatString.slice(0, concatString.lastIndexOf(","));
                    concatString += " e " + errorFields[errorFields.length - 1];
                    sysServicos.sendWarnMsg(
                        "Os campos " + concatString + " são obrigatórios."
                    );
                }

                return ret;
            };
        }
    ])

    .controller("faleNovoController", [
        "$scope",
        "$state",
        "$http",
        "$rootScope",
        "sysServicos",
        "Upload",
        "$cookieStore",
        "$timeout",
        function (
            $scope,
            $state,
            $http,
            $rootScope,
            sysServicos,
            Upload,
            $cookieStore,
            $timeout
        ) {
            $scope.pergunta = {};
            $scope.anexo = "";

            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
            $scope.dealer = $cookieStore.get("dealerUsuario");

            // popula as informações de Assuntos
            $scope.getAssuntos = function () {
                let promiseSubject = $http.get(rootURL + "v1/faleConosco/assuntos");
                promiseSubject.then(
                    function (response) {
                        $scope.assunto = response.data;
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

            //upload de arquivo
            $scope.uploadFiles = function (files, errFiles) {
                angular.forEach(files, function (file) {
                    var ext = file.name.substr(file.name.lastIndexOf(".") + 1);
                    $scope.files = files;
                    $scope.errFiles = errFiles;

                    file.upload = Upload.upload({
                        method: "POST",
                        //url: rootURL + 'faleConosco/upload',
                        url: rootURL + "v2/enviar/contato",
                        data: {
                            files: file
                        }
                    });

                    file.upload.then(
                        function (response) {
                            $timeout(function () {
                                file.result = response.data;
                                $scope.anexo = response.data.result.filesUploaded[0];

                                sysServicos.sendSuccessMsg("Arquivo enviado com sucesso");
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

            //validacao
            var validate = function (id) {
                var countError = 0;
                var errorFields = [];
                var msgType = 0;

                var ret = true;

                //valida cadastro
                if (id == 1) {
                    if (
                        $scope.pergunta.titulo == "" ||
                        $scope.pergunta.titulo == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Título");
                    }

                    if (
                        $scope.pergunta.assunto == "" ||
                        $scope.pergunta.assunto == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Assunto");
                    }

                    if (
                        $scope.pergunta.nome == "" ||
                        $scope.pergunta.nome == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Nome");
                    }

                    if (
                        $scope.pergunta.email == "" ||
                        $scope.pergunta.email == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("E-mail");
                    }

                    if (
                        $scope.pergunta.phone == "" ||
                        $scope.pergunta.phone == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Telefone");
                    }

                    if (
                        $scope.pergunta.mensagem == "" ||
                        $scope.pergunta.mensagem == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Mensagem");
                    }
                }
                //fim valida cadastro

                //envio de mensagens
                if (errorFields.length == 1 && msgType == 0) {
                    sysServicos.sendWarnMsg(
                        "O campo " + errorFields[0] + " é obrigatório."
                    );
                }

                if (errorFields.length == 2 && msgType == 0) {
                    var concatString = "";
                    concatString += errorFields[0] + " e " + errorFields[1];
                    sysServicos.sendWarnMsg(
                        "Os campos " + concatString + " são obrigatórios."
                    );
                }

                if (errorFields.length > 2 && msgType == 0) {
                    var concatString = "";
                    for (var n = 0; n < errorFields.length - 1; n++) {
                        concatString += errorFields[n] + ", ";
                    }
                    concatString = concatString.slice(0, concatString.lastIndexOf(","));
                    concatString += " e " + errorFields[errorFields.length - 1];
                    sysServicos.sendWarnMsg(
                        "Os campos " + concatString + " são obrigatórios."
                    );
                }

                return ret;
            };

            // grava fale conosco
            $scope.criarChamando = function () {
                var objEnvio = {};

                if (validate(1)) {
                    objEnvio.nome = $scope.pergunta.nome;
                    objEnvio.email = $scope.pergunta.email;
                    objEnvio.telefone = $scope.pergunta.phone;
                    objEnvio.assuntoId = $scope.pergunta.assunto;
                    objEnvio.titulo = $scope.pergunta.titulo;
                    objEnvio.nomeUsuario = $scope.usuarioLogado.userName;
                    objEnvio.dealerId = $scope.dealer.dealerID;

                    objEnvio.faleConoscoAssuntoId = $scope.pergunta.assunto;
                    objEnvio.mensagem = $scope.pergunta.mensagem;

                    if ($scope.anexo != "") {
                        objEnvio.url = $scope.anexo;
                    }

                    let promise = $http.post(rootURL + "v1/faleConosco", objEnvio);

                    promise.then(
                        function (response) {
                            sysServicos.sendSuccessMsg("Chamado aberto com sucesso");
                            $scope.pergunta = {};
                            $scope.anexo = "";
                            $scope.files = {};
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
                }
            };

            $scope.init = function () {
                $scope.getAssuntos();
            };

            $scope.init();
        }
    ])

    ////////////////////////// toyota Tabelas

    .controller("faleAbertoController", [
        "$scope",
        "$http",
        "$rootScope",
        "sysServicos",
        "$timeout",
        "$interval",
        "uiGridConstants",
        "$state",
        "$stateParams",
        function (
            $scope,
            $http,
            $rootScope,
            sysServicos,
            $timeout,
            $interval,
            uiGridConstants,
            $state,
            $stateParams
        ) {
            $scope.hideGrid = true;
            var totalRows;
            var idFab;
            // >  Busca Fale-conosco ativos. (Chamar indivídualmente componente a componente)
            function getAllByStatusActive() {
                let promise = $http.get(rootURL + "v1/listaFaleConosco/1");
                promise.then(
                    function (response) {
                        $scope.gridOptions1.data = response.data;
                        $scope.hideGrid = false;
                        totalRows = $scope.gridOptions1.data.length;
                        setTableHeight(totalRows);
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
            }

            $scope.viewChamado = function (id) {
                $state.go("faleDetalhe", {
                    currentId: id
                });
            };

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
                        name: "Data abertura - hora",
                        field: "dataInicio",
                        headerCellClass: "mt5-cell",
                        cellFilter: "date:'dd-MM-yyyy - H.mm.ss'",
                        filterCellFiltered: true
                    },
                    {
                        name: "Título",
                        field: "titulo"
                    },
                    {
                        name: "Protocolo",
                        field: "faleConoscoId"
                    },
                    {
                        name: "Reclamante",
                        field: "nomeUsuario"
                    },
                    {
                        //botao editar
                        name: " ",
                        width: 50,
                        cellTemplate:
                            '<button class="btn btn-table see-detail" type="button" title="Detalhes" ng-click="grid.appScope.viewChamado(row.entity.faleConoscoId)"><i class="fa fa-eye font-18"></i></button>',
                        cellClass: "text-right"
                    }
                ]
            };

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
                    .enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };

            function setTableHeight(rows) {
                if (rows >= $scope.gridOptions1.paginationPageSize) {
                    angular
                        .element(document.getElementsByClassName("grid")[0])
                        .css(
                            "min-height",
                            ($scope.gridOptions1.paginationPageSize + 1) *
                            $scope.gridOptions1.rowHeight +
                            56 +
                            "px"
                        );
                } else {
                    angular
                        .element(document.getElementsByClassName("grid")[0])
                        .css(
                            "min-height",
                            (rows + 1) * $scope.gridOptions1.rowHeight + 56 + "px"
                        );
                }
            }

            // > CHAMADA DAS FUNÇÕES
            getAllByStatusActive();
            // <
        }
    ])

    .controller("faleAndamentoController", [
        "$scope",
        "$http",
        "$rootScope",
        "sysServicos",
        "$timeout",
        "$interval",
        "uiGridConstants",
        "$state",
        "$stateParams",
        function (
            $scope,
            $http,
            $rootScope,
            sysServicos,
            $timeout,
            $interval,
            uiGridConstants,
            $state,
            $stateParams
        ) {
            var totalRows;
            var idFab;
            $scope.hideGrid = true;

            // > Busca Fale-conosco inativos.
            function getAllByStatusDisabled() {
                let promise = $http.get(rootURL + "v1/listaFaleConosco/2");
                promise.then(
                    function (response) {
                        $scope.gridOptions1.data = response.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        setTableHeight(totalRows);
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
            }
            // <

            $scope.viewChamado = function (id) {
                $state.go("faleDetalhe", {
                    currentId: id
                });
            };

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
                        setTableHeight(totalRows);
                    });
                },

                columnDefs: [
                    {
                        name: "Data abertura - hora",
                        field: "dataInicio",
                        headerCellClass: "mt5-cell",
                        cellFilter: "date:'dd-MM-yyyy - H.mm.ss'",
                        filterCellFiltered: true
                    },
                    {
                        name: "Título",
                        field: "titulo"
                    },
                    {
                        name: "Protocolo",
                        field: "faleConoscoId"
                    },
                    {
                        name: "Reclamante",
                        field: "nomeUsuario"
                    },
                    {
                        //botao editar
                        name: " ",
                        width: 50,
                        cellTemplate:
                            '<button class="btn  btn-table see-detail" type="button" title="Detalhes" ng-click="grid.appScope.viewChamado(row.entity.faleConoscoId)"><i class="fa fa-eye font-18"></i></button>',
                        cellClass: "text-right"
                    }
                ]
            };

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
                    .enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };

            function setTableHeight(rows) {
                if (rows >= $scope.gridOptions1.paginationPageSize) {
                    angular
                        .element(document.getElementsByClassName("grid")[1])
                        .css(
                            "min-height",
                            ($scope.gridOptions1.paginationPageSize + 1) *
                            $scope.gridOptions1.rowHeight +
                            56 +
                            "px"
                        );
                } else {
                    angular
                        .element(document.getElementsByClassName("grid")[1])
                        .css(
                            "min-height",
                            (rows + 1) * $scope.gridOptions1.rowHeight + 56 + "px"
                        );
                }
            }

            // > CHAMADA DAS FUNÇÕES
            getAllByStatusDisabled();
            // <
        }
    ])

    .controller("faleEncerradosController", [
        "$scope",
        "$http",
        "$rootScope",
        "sysServicos",
        "$timeout",
        "$interval",
        "uiGridConstants",
        "$state",
        "$stateParams",
        function (
            $scope,
            $http,
            $rootScope,
            sysServicos,
            $timeout,
            $interval,
            uiGridConstants,
            $state,
            $stateParams
        ) {
            var totalRows;
            var idFab;
            $scope.hideGrid = true;

            // > Busca Fale-conosco inativos.
            function getAllByStatusDisabled() {
                let promise = $http.get(rootURL + "v1/listaFaleConosco/3");
                promise.then(
                    function (response) {
                        $scope.gridOptions1.data = response.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        setTableHeight(totalRows);
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
            }
            // <

            $scope.viewChamado = function (id) {
                $state.go("faleDetalhe", {
                    currentId: id
                });
            };

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
                        setTableHeight(totalRows);
                    });
                },

                columnDefs: [
                    {
                        name: "Data abertura - hora",
                        field: "dataInicio",
                        headerCellClass: "mt5-cell",
                        cellFilter: "date:'dd-MM-yyyy - H.mm.ss'",
                        filterCellFiltered: true
                    },
                    {
                        name: "Título",
                        field: "titulo"
                    },
                    {
                        name: "Protocolo",
                        field: "faleConoscoId"
                    },
                    {
                        name: "Reclamante",
                        field: "nomeUsuario"
                    },
                    {
                        //botao editar
                        name: " ",
                        width: 50,
                        cellTemplate:
                            '<button class="btn btn-table see-detail" type="button" title="Detalhes" ng-click="grid.appScope.viewChamado(row.entity.faleConoscoId)"><i class="fa fa-eye font-18"></i></button>',
                        cellClass: "text-right"
                    }
                ]
            };

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
                    .enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };

            function setTableHeight(rows) {
                if (rows >= $scope.gridOptions1.paginationPageSize) {
                    angular
                        .element(document.getElementsByClassName("grid")[1])
                        .css(
                            "min-height",
                            ($scope.gridOptions1.paginationPageSize + 1) *
                            $scope.gridOptions1.rowHeight +
                            56 +
                            "px"
                        );
                } else {
                    angular
                        .element(document.getElementsByClassName("grid")[1])
                        .css(
                            "min-height",
                            (rows + 1) * $scope.gridOptions1.rowHeight + 56 + "px"
                        );
                }
            }

            // > CHAMADA DAS FUNÇÕES
            getAllByStatusDisabled();
            // <
        }
    ]);
