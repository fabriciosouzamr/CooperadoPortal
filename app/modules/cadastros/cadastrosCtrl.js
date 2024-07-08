angular
    .module("cadastrosModule", [])

    .controller("cadastrosController", [
        "$scope",
        "$state",
        "$q",
        "$location",
        "$http",
        "$rootScope",
        "sysServicos",
        "$cookieStore",
        "uiGridConstants",
        function (
            $scope,
            $state,
            $q,
            $location,
            $http,
            $rootScope,
            sysServicos,
            $cookieStore,
            uiGridConstants
        ) {
            $scope.dealer = {};
            $scope.cadastroUsuario = {};
            $scope.cadastroContato = {};
            $scope.contatoIdExcluso = {};
            $scope.usuarioIdExcluso = "";
            $scope.nomeBusca = null;
            $scope.loginBusca = null;

            $scope.userPerfil = $cookieStore.get("perfilUsuario");

            if ($scope.userPerfil.perfil !== "Consultor") {
                $scope.abas = [
                    {
                        label: "Usuários",
                        value: "user",
                        showQuota: true,
                        show: true
                    },
                    {
                        label: "Dealer",
                        value: "dealer",
                        showQuota: true,
                        show: true
                    }
                ];
            } else {
                $scope.abas = [
                    {
                        label: "Dealer",
                        value: "dealer",
                        showQuota: true,
                        show: true
                    }
                ];
            }

            $scope.abaActive = -1;

            $scope.exportarClickHandler = function () {
                let promise = $http.get(rootURL + "conta/exportar", {
                    responseType: "arraybuffer",
                    headers: {
                        "Content-type": "application/json",
                        Accept:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                });
                promise.then(
                    function (ret) {
                        var blob = new Blob([ret.data], {
                            type:
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        });
                        saveAs(blob, "Lista_usuários.xlsx");
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

            $scope.exportarClickDealerHandler = function () {
                let promise = $http.get(rootURL + "/relatorio/dealer", {
                    responseType: "arraybuffer",
                    headers: {
                        "Content-type": "application/json",
                        Accept:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                });
                promise.then(
                    function (ret) {
                        var blob = new Blob([ret.data], {
                            type:
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        });
                        saveAs(blob, "Lista_usuários.xlsx");
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

            $scope.exportarLog = function () {
                let promise = $http.get(rootURL + "acesso/historico/exportar/geral", {
                    responseType: "arraybuffer",
                    headers: {
                        "Content-type": "application/json",
                        Accept:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                });
                promise.then(
                    function (ret) {
                        var blob = new Blob([ret.data], {
                            type:
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        });
                        saveAs(blob, "log de acesso.xlsx");
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

            $scope.changeAba = function (aba) {
                $scope.abaActive = aba;
                if ($scope.abaActive == "user") {
                    $scope.getAllUsers();
                } else {
                    $scope.getAllDealers();
                }
            };

            $scope.getAllUsers = function () {
                let promise = $http.get(rootURL + "conta/consultar");
                promise.then(
                    function (response) {
                        $scope.retorno = response.data;
                        $scope.teste = $scope.retorno[0].apps[0].applicationName;
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
            };

            $scope.getAllDealers = function () {
                let promise = $http.get(rootURL + "dealer/consultar");
                promise.then(
                    function (response) {
                        $scope.gridOptions2.data = response.data;
                        $scope.hideGrid = false;
                        totalRows = $scope.gridOptions2.data.length;
                        setTableHeight(totalRows);
                    },
                    function (error) {
                        error.status,
                            error.statusText,
                            error.config.url,
                            error.data.Message;
                    }
                );
            };

            $scope.searchDealer = function () {
                let promise = $http({
                    method: "GET",
                    url: rootURL + "dealer/consultar",
                    params: {
                        codigo: $scope.codigoDealer,
                        nomeFantasiaOuRazaoSocial: $scope.nomeFantasia
                    }
                });
                promise.then(
                    function (response) {
                        $scope.gridOptions2.data = response.data;
                        $scope.hideGrid = false;
                        totalRows = $scope.gridOptions2.data.length;
                        setTableHeight(totalRows);
                    },
                    function (error) {
                        error.status,
                            error.statusText,
                            error.config.url,
                            error.data.Message;
                    }
                );

                console.log($scope.codigoDealer, $scope.nomeFantasia);
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

                rowHeight: 40,

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
                        name: "Nome",
                        field: "login"
                    },
                    {
                        name: "Login",
                        field: "login"
                    },
                    {
                        name: "E-mail",
                        field: "email"
                    },
                    {
                        name: "Categoria de acesso",
                        field: "perfil"
                    },
                    {
                        name: "Acesso",
                        field: "apps"
                    },
                    {
                        name: "Ativo",
                        field: "ativo",
                        cellTemplate:
                            "<div><span ng-show='row.entity.ativo == true' class='user-ativo'>Ativo</span><span ng-show='row.entity.ativo == false' class='user-inativo'>Inativo</span></div>"
                    },
                    {
                        name: " ",
                        width: 50,
                        cellTemplate:
                            '<div><button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.userDetailClick(row.entity)"><i class="fas fa-eye font-18"></i></button></div>',
                        cellClass: "text-right"
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

                enableGridMenu: false,

                rowHeight: 40,

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
                        name: "Código do Dealer",
                        field: "codigo"
                    },
                    {
                        name: "Nome Fantasia",
                        field: "razaoSocial"
                    },
                    {
                        name: "AOV",
                        field: "regiao.regional.nome"
                    },
                    {
                        name: "Região",
                        field: "regiao.nome"
                    },
                    {
                        name: "Telefone",
                        field: "telefone"
                    },
                    {
                        name: "status",
                        field: "ativo",
                        cellTemplate:
                            '<div class="dealer-inactive" ng-if="row.entity.ativo == false">Inativo</div><div class="dealer-active" ng-if="row.entity.ativo == true">Ativo</div>'
                    },
                    {
                        //botao editar
                        name: "Ações",
                        width: 100,
                        cellTemplate:
                            '<div><button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.dealerDetailClick(row.entity.dealerID)"><i class="fas fa-eye font-18"></i></button></div>',
                        cellClass: "text-right"
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

                enableGridMenu: false,

                rowHeight: 40,

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
                        name: "Nome",
                        field: "userName"
                    },
                    {
                        name: "Login",
                        field: "name"
                    },
                    {
                        name: "Categoria de acesso",
                        field: "email"
                    },
                    {
                        name: "Acesso",
                        field: "email"
                    },
                    {
                        //botao editar
                        name: " ",
                        width: 50,
                        cellTemplate:
                            '<div><button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.dentsuDetailClick(row.entity)"><i class="fas fa-eye font-18"></i></button></div>',
                        cellClass: "text-right"
                    }
                ]
            };

            $scope.novoUsuario = function () {
                $state.go("cadastrosNewUser");
            };

            $scope.newDealer = function () {
                $state.go("criarDealer");
            };

            $scope.userDetailClick = function (value) {
                $state.go("cadastrosUser", {
                    id: value.id
                });
            };

            $scope.dealerDetailClick = function (dealerID) {
                $state.go("detalheDealer", {
                    id: dealerID
                });
            };

            $scope.setAbaByQueryParams = function () {
                return $q(function (resolve, reject) {
                    var queryParams = $location.search();
                    if (queryParams.aba) {
                        $scope.abas.forEach(function (element, index) {
                            if (element.value === queryParams.aba) {
                                $scope.abaActive = element.value;
                            }
                        });
                    } else {
                        $scope.changeAba($scope.abas[0].value);
                    }
                });
            };

            $scope.search = function () {
                let promise = $http.get(
                    rootURL + "conta/consultar?name=" + $scope.nomeBusca
                );
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
            };

            $scope.searchClear = function () {
                $scope.getAllUsers();
                $scope.nomeBusca = "";
            };

            $scope.init = function () {
                $scope.getAllUsers();
                $scope.getAllDealers();
                $scope.setAbaByQueryParams(function (val) {
                    console.log("init cadastrosUsuariosController");
                });
            };
            $scope.init();
        }
    ])

    .controller("cadastrosDealerController", [
        "$scope",
        "$http",
        "$rootScope",
        "sysServicos",
        "$cookieStore",
        "$stateParams",
        function (
            $scope,
            $http,
            $rootScope,
            sysServicos,
            $cookieStore,
            $stateParams
        ) {
            $scope.endereco = {};

            $scope.back = function () {
                window.history.go(-1);
            };

            $scope.dealer = {};
            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
            $scope.meuCadastro = {};

            $scope.endereco = {};
            $scope.cadastroUsuario = {};
            $scope.cadastroContato = {};
            $scope.contatoIdExcluso = {};
            $scope.usuarioIdExcluso = "";
            $scope.cadastroUsuario.email = "";
            $scope.email = function () {
                document.getElementById("email").value = "";
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

                rowHeight: 40,

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
                        name: "Nome",
                        field: "userName"
                    },
                    {
                        name: "Login",
                        field: "name"
                    },
                    {
                        name: "Categoria de acesso",
                        field: "email"
                    },
                    {
                        name: "Acesso",
                        field: "email"
                    },
                    {
                        //botao editar
                        name: " ",
                        width: 50,
                        cellTemplate:
                            '<div><button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.userDetailClick(row.entity.userName)"><i class="fas fa-eye font-18"></i></button></div>',
                        cellClass: "text-right"
                    }
                ]
            };

            $scope.resetSenha = function () {
                var objEnvio = {};
                objEnvio.id = $scope.usuarioLogado.id;
                objEnvio.senhaAtual = $scope.meuCadastro.senhaAtual;
                objEnvio.novaSenha = $scope.meuCadastro.senhaNova;
                objEnvio.novaSenhaConfirmacao = $scope.meuCadastro.senhaConfirmacao;

                let promise = $http.patch(rootURL + "conta/senha/alterar", objEnvio);
                promise.then(
                    function (response) {
                        sysServicos.sendSuccessMsg("Senha alterada com sucesso.");
                    },
                    function (error) {
                        sysServicos.sendErrorMsg(
                            error.status,
                            error.statusText,
                            error.config.url,
                            error.data.message
                        );
                    }
                );
            };

            $scope.getDealerUserLogado = function () {
                let promiseUser = $http.get(rootURL + "dealer/eu");
                promiseUser.then(
                    function (response) {
                        let dealer = response.data[0];
                        $scope.id = dealer.dealerID;
                        $scope.dealer.ativo = dealer.ativo;
                        $scope.dealer.nomeFantasia = dealer.nomeFantasia;
                        $scope.dealer.razaoSocial = dealer.razaoSocial;
                        $scope.dealer.cnpj = dealer.cnpj;
                        $scope.dealer.codigo = dealer.codigo;

                        $scope.dealer.telefone = dealer.telefone;
                        $scope.dealer.cep = dealer.cep;
                        $scope.dealer.logradouro = dealer.logradouro;
                        $scope.dealer.bairro = dealer.bairro;

                        if (dealer.cidade != undefined) {
                            $scope.dealer.cidade = dealer.cidade.cidadeId;
                            $scope.dealer.uf = dealer.cidade.uf.ufId;
                            $scope.getCities($scope.dealer.uf);
                        }
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

            $scope.getUFs = function () {
                let promise = $http.get(rootURL + "v1/estados");
                promise.then(function (ret) {
                    $scope.ufs = ret.data;
                });
            };

            $scope.getUFID = function (ufId) {
                $scope.ufID = ufId;
                $scope.getCities(ufId);
            };

            $scope.getCities = function (ufId) {
                let promise = $http.get(rootURL + "v1/cidades/" + ufId);
                promise.then(function (ret) {
                    $scope.cities = ret.data;
                });
            };

            $scope.createDealer = function () {
                if (validate(6)) {
                    var objEnvio = {};
                    objEnvio.nomeFantasia = $scope.dealer.nomeFantasia;
                    objEnvio.razaoSocial = $scope.dealer.razaoSocial;
                    objEnvio.cnpj = $scope.dealer.cnpj;
                    objEnvio.codigo = $scope.dealer.codigo;
                    objEnvio.telefone = $scope.dealer.telefone;
                    objEnvio.cep = $scope.dealer.cep;
                    objEnvio.logradouro = $scope.dealer.logradouro;
                    objEnvio.bairro = $scope.dealer.bairro;
                    objEnvio.cidadeID = $scope.dealer.cidade;

                    let promise = $http.post(rootURL + "dealer/inserir", objEnvio);
                    promise.then(
                        function (ret) {
                            sysServicos.sendSuccessMsg("Dealer cadastrado com sucesso");
                        },
                        function (err) {
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

            $scope.getDealerDetail = function () {
                var dealerID = $scope.usuarioLogado.perfil == "Dealer" ? $cookieStore.get("dealerUsuario").dealerID : $stateParams.id;
                if (dealerID !== undefined) {
                    let promise = $http.get(
                        rootURL
                        + "dealer/"
                        + dealerID
                    );

                    promise.then(function (ret) {
                        $scope.id = ret.data.dealerID;
                        $scope.dealer.ativo = ret.data.ativo;
                        $scope.dealer.nomeFantasia = ret.data.nomeFantasia;
                        $scope.dealer.razaoSocial = ret.data.razaoSocial;
                        $scope.dealer.cnpj = ret.data.cnpj;
                        $scope.dealer.codigo = ret.data.codigo;

                        $scope.dealer.telefone = ret.data.telefone;
                        $scope.dealer.cep = ret.data.cep;
                        $scope.dealer.logradouro = ret.data.logradouro;
                        $scope.dealer.bairro = ret.data.bairro;

                        if (ret.data.cidade != undefined) {
                            $scope.dealer.cidade = ret.data.cidade.cidadeId;
                            $scope.dealer.uf = ret.data.cidade.uf.ufId;
                            $scope.getCities($scope.dealer.uf);
                        }
                    });
                }
            };

            $scope.totalUpdateDealer = function () {
                if (validate(6)) {
                    var objEnvio = {};
                    objEnvio.nomeFantasia = $scope.dealer.nomeFantasia;
                    objEnvio.razaoSocial = $scope.dealer.razaoSocial;
                    objEnvio.cnpj = $scope.dealer.cnpj;
                    objEnvio.codigo = $scope.dealer.codigo;
                    objEnvio.telefone = $scope.dealer.telefone;
                    objEnvio.cep = $scope.dealer.cep;
                    objEnvio.logradouro = $scope.dealer.logradouro;
                    objEnvio.bairro = $scope.dealer.bairro;
                    objEnvio.cidadeID = $scope.dealer.cidade;

                    let promise = $http.patch(
                        rootURL + "dealer/" + $scope.id + "/alterar",
                        objEnvio
                    );
                    promise.then(function (ret) {
                        sysServicos.sendSuccessMsg("Cadastro atualizado com sucesso");
                    });
                }
            };

            $scope.activeDealer = function () {
                let promise = $http.patch(rootURL + "dealer/" + $scope.id + "/ativar");
                promise.then(
                    function (ret) {
                        sysServicos.sendSuccessMsg("Dealer ativo com sucesso");
                        $scope.getDealerDetail();
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

            $scope.inactiveDealer = function () {
                let promise = $http.patch(
                    rootURL + "dealer/" + $scope.id + "/inativar"
                );
                promise.then(
                    function (ret) {
                        sysServicos.sendSuccessMsg("Dealer inativado com sucesso");
                        $scope.getDealerDetail();
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

            $scope.addUsuario = function () {
                var objEnvio = {};
                objEnvio.nomeUsuario = $scope.cadastroUsuario.login;
                objEnvio.nome = $scope.cadastroUsuario.nome;
                objEnvio.senha = $scope.cadastroUsuario.senha;
                objEnvio.senhaConfirmacao = $scope.cadastroUsuario.senhaConfirmacao;
                objEnvio.email = $scope.cadastroUsuario.email;

                var objEnvioPerfil = {};
                objEnvioPerfil.name = $scope.cadastroUsuario.nome;

                if (validate(1) && validate(3) && validate(4)) {
                    let promise = $http.post(
                        rootURL + "conta/dealer/" + $scope.usuarioLogado.id + "/copiar",
                        objEnvio
                    );
                    promise.then(
                        function (ret) {
                            sysServicos.sendSuccessMsg("Novo Usuário Cadastrado.");
                            $scope.cadastroUsuario.senha = "";
                            $scope.cadastroUsuario.email = "";
                            $scope.cadastroUsuario = {};
                            $scope.$broadcast("atualizaDealer");
                        },
                        function (err) {
                            sysServicos.sendErrorMsg(
                                err.status,
                                err.statusText,
                                err.config.url,
                                err.data.message
                            );
                        }
                    );
                }
            };

            $scope.addContato = function () {
                var objEnvio = {};
                objEnvio.dealerID = $scope.id;
                objEnvio.telefone = $scope.cadastroContato.telefone;
                objEnvio.nomeContato = $scope.cadastroContato.nomeContato;
                objEnvio.telefone = $scope.cadastroContato.telefone;
                objEnvio.email = $scope.cadastroContato.email;
                objEnvio.celular = $scope.cadastroContato.celular;
                objEnvio.recebeAlerta = $scope.cadastroContato.recebeAlerta;

                var objEnvioLog = {};
                objEnvioLog.dealerID = $scope.id;
                objEnvioLog.userId = $scope.cadastroContato.userId;
                objEnvioLog.dataInclusao = new Date();
                objEnvioLog.nome = $scope.cadastroContato.nomeContato;
                objEnvioLog.email = $scope.cadastroContato.email;

                if (validate(2)) {
                    let promise = $http.post(
                        rootURL + "dealer/" + objEnvio.dealerID + "/contatos/inserir",
                        objEnvio
                    );
                    promise.then(
                        function (ret) {
                            sysServicos.sendSuccessMsg("Adicionado na Lista de Contatos.");
                            $scope.cadastroContato = {};
                            setTimeout(() => {
                                window.location.reload();
                            }, 100);
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
            };

            $scope.deletarContato = function () {
                var objEnvioLog = {};
                objEnvioLog.dealerID = $scope.id;
                objEnvioLog.userId = $scope.contatoIdExcluso.id;
                objEnvioLog.dataExclusao = new Date();
                objEnvioLog.nome = $scope.contatoIdExcluso.nome;
                objEnvioLog.email = $scope.contatoIdExcluso.email;

                if (
                    $scope.contatoIdExcluso.id != "" &&
                    $scope.contatoIdExcluso.id != undefined
                ) {
                    var promise = $http.delete(
                        rootURL +
                        "dealer/" +
                        objEnvioLog.dealerID +
                        "/contatos/" +
                        $scope.contatoIdExcluso.id +
                        "/apagar"
                    );
                    promise.then(
                        function (ret) {
                            sysServicos.sendSuccessMsg("Contato Removido");
                            $.magnificPopup.close();
                            $scope.contatoIdExcluso = {};
                            setTimeout(() => {
                                window.location.reload();
                            }, 100);
                        },
                        function (err) {
                            sysServicos.sendErrorMsg(
                                err.status,
                                err.statusText,
                                err.config.url
                            );
                        }
                    );
                } else {
                    sysServicos.sendWarnMsg("Id de usaurio não identificado");
                }
            };

            $scope.deletarUsuario = function () {
                console.log($scope.usuarioIdExcluso);
                if (
                    $scope.usuarioIdExcluso != "" &&
                    $scope.usuarioIdExcluso != undefined
                ) {
                    var promise = $http.delete(
                        rootURL + "conta/" + $scope.usuarioIdExcluso + "/apagar"
                    );
                    promise.then(
                        function (ret) {
                            sysServicos.sendSuccessMsg("Usuário Removido");
                            $scope.$broadcast("atualizaDealer");
                            $.magnificPopup.close();
                            $scope.usuarioIdExcluso = "";
                        },
                        function (err) {
                            sysServicos.sendErrorMsg(
                                err.status,
                                err.statusText,
                                err.config.url
                            );
                        }
                    );
                } else {
                    sysServicos.sendWarnMsg("Id de usaurio não identificado");
                }
            };

            var validate = function (id) {
                var countError = 0;
                var errorFields = [];
                var msgType = 0;

                var ret = true;

                //valida novo usuario
                if (id == 1) {
                    if (
                        $scope.cadastroUsuario.login == "" ||
                        $scope.cadastroUsuario.login == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Login");
                    }
                    if (
                        $scope.cadastroUsuario.nome == "" ||
                        $scope.cadastroUsuario.nome == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Nome");
                    }
                    if (
                        $scope.cadastroUsuario.senha == "" ||
                        $scope.cadastroUsuario.senha == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Senha");
                    }
                    if (
                        $scope.cadastroUsuario.senhaConfirmacao == "" ||
                        $scope.cadastroUsuario.senhaConfirmacao == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Confirmar Senha");
                    }
                    if (
                        $scope.cadastroUsuario.email == "" ||
                        $scope.cadastroUsuario.email == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Email");
                    }
                }
                //valida novo contato
                if (id == 2) {
                    if (
                        $scope.cadastroContato.nomeContato == "" ||
                        $scope.cadastroContato.nomeContato == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Nome do Contato");
                    }
                    if (
                        $scope.cadastroContato.telefone == "" ||
                        $scope.cadastroContato.telefone == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Telefone");
                    }
                    if (
                        $scope.cadastroContato.email == "" ||
                        $scope.cadastroContato.email == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Email");
                    }
                    if (
                        $scope.cadastroContato.celular == "" ||
                        $scope.cadastroContato.celular == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Celular");
                    }
                    if (
                        $scope.cadastroContato.recebeAlerta == "" ||
                        $scope.cadastroContato.recebeAlerta == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Receber Alerta");
                    }
                }
                // valida minimo de caracteres na senha
                if (id == 3) {
                    if ($scope.cadastroUsuario.senha.length < 8) {
                        ret = false;
                        msgType = 3;
                    }
                }
                // valida confirmação de senha
                if (id == 4) {
                    if (
                        $scope.cadastroUsuario.senha !=
                        $scope.cadastroUsuario.senhaConfirmacao
                    ) {
                        ret = false;
                        msgType = 1;
                    }
                }
                if (id == 5) {
                    if (
                        $scope.cadastroUsuario.senha !=
                        $scope.cadastroUsuario.senhaConfirmacao
                    ) {
                        ret = false;
                        msgType = 1;
                    }
                }

                if (id == 6) {
                    if (
                        $scope.dealer.razaoSocial == "" ||
                        $scope.dealer.razaoSocial == null ||
                        $scope.dealer.razaoSocial == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Razão Social");
                    };
                    if (
                        $scope.dealer.nomeFantasia == "" ||
                        $scope.dealer.nomeFantasia == null ||
                        $scope.dealer.nomeFantasia == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Nome Fantasia");
                    };
                    if (
                        $scope.dealer.cnpj == "" ||
                        $scope.dealer.cnpj == null ||
                        $scope.dealer.cnpj == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("CNPJ");
                    };
                    if (
                        $scope.dealer.codigo == "" ||
                        $scope.dealer.codigo == null ||
                        $scope.dealer.codigo == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Código");
                    };
                }

                //envio de mensagens
                if (msgType == 3) {
                    sysServicos.sendWarnMsg(
                        "Sua senha deve conter pelo menos 8 caracteres."
                    );
                }

                if (msgType == 1) {
                    sysServicos.sendWarnMsg("Confirmação de Senha não são iguais.");
                }

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

            $scope.init = function () {
                $scope.getUFs();
                if ($scope.usuarioLogado.perfil == "Dealer") {
                    $scope.getDealerUserLogado();
                }
                else {
                    $scope.getDealerDetail();
                }
            };
            $scope.init();
        }
    ])

    /// TABELAS
    .controller("dealerUsuariosTableCntrl", [
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
            $cookieStore
        ) {
            var totalRows;
            var idFab;

            $scope.hideGrid = true;

            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");

            function rowTemplate() {
                return $timeout(function () {
                    return (
                        "<div ng-class=\"{ 'inactiveRow': grid.appScope.rowFormatter( row ) }\">" +
                        '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                        "</div>"
                    );
                }, 100);
            }

            $scope.deleteUser = function (id) {
                $scope.$parent.$parent.usuarioIdExcluso = id;
                console.log(id);
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

                rowHeight: 45,

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
                        name: "Usuários",
                        field: "userName"
                    },
                    {
                        name: "Name",
                        field: "name"
                    },
                    {
                        name: "Email",
                        field: "email"
                    },
                    // antes os Dealers podiam excluir seus semelhantes.
                    // caso queiram que essa opção volte, já tá pronto
                    // {
                    //   //botao editar
                    //   name: " ",
                    //   width: 50,
                    //   cellTemplate:
                    //     '<div>{{usuarioLogado.userName}}<button class="btn btn-primary btn-table" type="button" title="Deletar" ng-click="grid.appScope.deleteUser(row.entity.id)" onclick="abreModal(\'#modalExcluirUsuario\', \'mfp-sign\')"><i class="fas fa-trash"></i></button></div>',
                    //   cellClass: "text-right"
                    // }
                ]
            };

            $scope.getDealer = function () {
                let promise = $http.get(
                    rootURL +
                    "dealer/" +
                    $cookieStore.get("dealerUsuario").dealerID +
                    "/usuarios"
                );
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;

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

            $scope.viewDealer = function (id) {
                $rootScope.inativoEnviar = false;
                $state.go("dealer", {
                    currentId: id
                });
            };

            $scope.$on("atualizaDealer", function (event, args) {
                $scope.getDealer();
            });

            $scope.init = function () {
                if ($scope.usuarioLogado.perfil == "Dealer") {
                    $scope.getDealer();
                }
            };

            $scope.init();
        }
    ])

    .controller("dealerContatosTableCntrl", [
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
            $cookieStore
        ) {
            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");

            var totalRows;
            var idFab;

            $scope.hideGrid = true;

            function getDealerId() {
                return $scope.usuarioLogado.perfil == "Dealer"
                    ? $cookieStore.get("dealerUsuario").dealerID
                    : $stateParams.id;
            }

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

            $scope.deleteContato = function (id, nome, email) {
                $scope.$parent.contatoIdExcluso.id = id;
                $scope.$parent.contatoIdExcluso.nome = nome;
                $scope.$parent.contatoIdExcluso.email = email;
            };

            var colunas = [
                {
                    name: "Nome",
                    field: "nomeContato"
                },
                {
                    name: "Telefone",
                    field: "telefone"
                },
                {
                    name: "Email",
                    field: "email"
                }
            ];

            if ($scope.usuarioLogado.perfil == 'Administrador') {
                colunas.push({
                    name: " ",
                    width: 50,
                    cellTemplate:
                        '<button class="btn btn-primary btn-table" type="button" title="Deletar" ng-click="grid.appScope.deleteContato(row.entity.dealerContatoID, row.entity.nomeContato, row.entity.email)" onclick="abreModal(\'#modalExcluirContato\', \'mfp-sign\')"><i class="fas fa-trash"></i></button>',
                    cellClass: "text-right"
                })
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
                columnDefs: colunas
            };

            $scope.getContatoDealer = function () {
                let promise = $http.get(
                    rootURL +
                    "dealer/" +
                    getDealerId() +
                    "/contatos/todos"
                );
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;

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

            $scope.viewDealer = function (id) {
                $rootScope.inativoEnviar = false;
                $state.go("dealer", {
                    currentId: id
                });
            };

            $scope.init = function () {
                $scope.getContatoDealer();
            };

            $scope.init();
        }
    ])

    .controller("dealerContatoLogTableCntrl", [
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
            $cookieStore
        ) {
            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
            var totalRows;
            var idFab;

            $scope.hideGrid = true;

            function getDealerId() {
                return $scope.usuarioLogado.perfil == "Dealer"
                    ? $cookieStore.get("dealerUsuario").dealerID
                    : $stateParams.id;
            }

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

                enableGridMenu: false,
                enableColumnMenus: false,

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
                        name: "Nome",
                        field: "nome"
                    },
                    {
                        name: "Email",
                        field: "email"
                    },
                    {
                        name: "Ação",
                        field: "tipo"
                    },
                    {
                        name: "Data - hora",
                        field: "dataInclusao",
                        headerCellClass: "mt5-cell",
                        cellFilter: "date:'dd-MM-yyyy - H.mm.ss'",
                        filterCellFiltered: true,
                        cellTemplate:
                            "<div class=\"ui-grid-cell-contents\" ng-show=\"row.entity.tipo=='Exclusão'\">{{row.entity.dataExclusao | date: 'dd/MM/yyyy - HH:mm' }}</div>" +
                            "<div class=\"ui-grid-cell-contents\" ng-show=\"row.entity.tipo=='Inclusão'\">{{row.entity.dataInclusao | date: 'dd/MM/yyyy - HH:mm' }}</div>"
                    }
                ]
            };

            $scope.getDealerLog = function () {
                let promise = $http.get(
                    rootURL +
                    "dealer/" +
                    getDealerId() +
                    "/contatos/historico"
                );
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;

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

            $scope.init = function () {
                $scope.getDealerLog();
            };

            $scope.init();
        }
    ]);
