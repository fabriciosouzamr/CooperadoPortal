app.controller("appController", [
    "$scope",
    "$http",
    "$state",
    "$rootScope",
    "ngNotify",
    "$cookieStore",
    "sysServicos",
    function (
        $scope,
        $http,
        $state,
        $rootScope,
        ngNotify,
        $cookieStore,
        sysServicos
    ) {
        //var controllerMaster;//usado para passar o nome do controller quando ocorre um erro na promise
        ngNotify.config({
            theme: "pure",
            position: "top"
        });

        $rootScope.$on("alert", function (event, args) {
            ngNotify.set(args, {
                sticky: false,
                duration: 5000,
                type: "error",
                button: true,
                html: true
            });
        });

        $rootScope.$on("warn", function (event, args) {
            ngNotify.set(args, {
                type: "warn",
                sticky: false,
                duration: 5000,
                button: false,
                html: true
            });
        });

        $rootScope.$on("success", function (event, args) {
            ngNotify.set(args, {
                type: "success",
                sticky: false,
                duration: 5000,
                button: false,
                html: true
            });
        });

        //change Aba
        $scope.clearCookies = function () {
            $cookieStore.remove("reembolsoDealer");
            $cookieStore.remove("planoMidia");
            $cookieStore.remove("regiao");
        };

        // logout
        $scope.logOut = function () {
            $rootScope.globals = null;
            $cookieStore.remove("globals");
            $cookieStore.remove("perfilUsuario");
            $cookieStore.remove("dealerUsuario");
            $cookieStore.remove("regiao");
            $cookieStore.remove("reembolsoDealer");
            $cookieStore.remove("planoMidia");
            $http.defaults.headers.common.Authorization = "Basic ";
            window.open(rootURLInter, "_self");
        };

        //config modals
        $rootScope.abreModal = function (modal, effect) {
            $.magnificPopup.open({
                removalDelay: 500, //delay removal by X to allow out-animation,
                items: {
                    src: modal
                },
                // overflowY: 'hidden', //
                callbacks: {
                    beforeOpen: function (e) {
                        this.st.mainClass = effect;
                    }
                },
                midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
            });
        };

        $rootScope.$on("$locationChangeSuccess", function (
            event,
            currentRoute,
            previousRoute
        ) {
            window.scrollTo(0, 0);
        });

        $rootScope.$on("$locationChangeStart", function (event, next, current) {
            window.scrollTo(0, 0);
        });

        //config modals
        $("#main").magnificPopup({
            delegate: "a.modal",
            removalDelay: 500,
            mainClass: "mfp-fade",
            midClick: true
        });

        $rootScope.closeModal = function (id) {
            $.magnificPopup.close();
        };

        $scope.auditar = false;
        $rootScope.auditarAcao = function (value) {
            $scope.auditar = true;
            $state.go("auditar", {
                BudgetDealerNFID: value.budgetDealerNFID
            });
        };

        $scope.confirmEmail = function () {
            var objEnvio = {};
            objEnvio.email = $scope.email;
            let promise = $http.patch(rootURL + 'conta/eu/alterar-email', objEnvio);
            promise.then(
                function (ret) {
                    sysServicos.sendSuccessMsg("Confirmação de email realizada com sucesso");
                    $scope.getDadosUsuarioLogado();
                }, function (err) {
                    sysServicos.sendErrorMsg(err.data.message);
                }
            )
        }

        $scope.getDadosUsuarioLogado = function () {
            var promise = $http.get(rootURL + "conta/eu");
            promise.then(
                function (ret) {
                    $rootScope.usuarioLogado = {};

                    if ($rootScope.confirmaEmail == false || $rootScope.confirmaEmail == undefined) {
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

                    // setando perfis
                    if (ret.data.perfil.nome == "Coordenador") {
                        $rootScope.usuarioLogado.perfilCoordenador = true;
                    } else if (ret.data.perfil.nome == "Gerente Regional") {
                        $rootScope.usuarioLogado.perfilGerenteRegional = true;
                    } else if (ret.data.perfil.nome == "Auditor") {
                        $rootScope.usuarioLogado.perfilAuditor = true;
                    } else if (ret.data.perfil.nome == "Administrador") {
                        $rootScope.usuarioLogado.perfilAdministrador = true;
                    } else if (ret.data.perfil.nome == "Dealer") {
                        $rootScope.usuarioLogado.perfilDealer = true;
                    } else if (ret.data.perfil.nome == "Consultor") {
                        $rootScope.usuarioLogado.perfilConsultor = true;
                    } else {
                        sysServicos.sendWarnMsg("Não foi possível identificar seu perfil");
                        setTimeout(function () {
                            $scope.logOut();
                        }, 1000);
                    }

                    //inicia scripts de animacao apos o carregamento das infromacoes do menu
                    $(document).ready(function () {
                        setTimeout(startScripts, 100);
                        function startScripts() {
                            Core.init();
                        }
                    });

                    let promiseAplication = $http.get(rootURL + "v1/contaAplicacao");
                    promiseAplication.then(
                        function (ret) {
                            for (x = 0; x < ret.data.length; x++) {
                                if (
                                    ret.data[x].applicationId ==
                                    "01e4d121-0c9a-422b-a5c3-aa6ad2de9234"
                                ) {
                                    // 50% toyota
                                    $rootScope.usuarioLogado.permissionT50 = true;
                                }
                                if (
                                    ret.data[x].applicationId ==
                                    "565a319a-71a0-40f1-a860-c007ae86dc56"
                                ) {
                                    // 100% toyota
                                    $rootScope.usuarioLogado.permissionT100 = true;
                                }
                                if (
                                    ret.data[x].applicationId ==
                                    "cffa3a0c-c1f3-4dd3-8256-dc29a12b21b4"
                                ) {
                                    // 50% lexus
                                    $rootScope.usuarioLogado.permissionL50 = true;
                                }
                                if (
                                    ret.data[x].applicationId ==
                                    "8053b030-bb15-4caf-b552-843b53d33b4f"
                                ) {
                                    // 100% lexus
                                    $rootScope.usuarioLogado.permissionL100 = true;
                                }
                            }

                            $cookieStore.put("perfilUsuario", $rootScope.usuarioLogado);
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
    }
]);

app.controller("getUserData", [
    "$scope",
    "$http",
    "$state",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    function ($scope, $http, $state, $rootScope, sysServicos, $cookieStore) {
        $rootScope.flagShowAdm = false;
        $scope.sino = "";
        $rootScope.confirmaEmail = $cookieStore.get("confirmaEmail");

        $scope.getDadosUsuarioLogado = function () {
            var promise = $http.get(rootURL + "conta/eu");
            promise.then(
                function (ret) {
                    $rootScope.usuarioLogado = {};

                    if ($rootScope.confirmaEmail == false || $rootScope.confirmaEmail == undefined) {
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

                    // setando perfis
                    if (ret.data.perfil.nome == "Coordenador") {
                        $rootScope.usuarioLogado.perfilCoordenador = true;
                    } else if (ret.data.perfil.nome == "Gerente Regional") {
                        $rootScope.usuarioLogado.perfilGerenteRegional = true;
                    } else if (ret.data.perfil.nome == "Auditor") {
                        $rootScope.usuarioLogado.perfilAuditor = true;
                    } else if (ret.data.perfil.nome == "Administrador") {
                        $rootScope.usuarioLogado.perfilAdministrador = true;
                    } else if (ret.data.perfil.nome == "Dealer") {
                        //    $rootScope.usuarioLogado.perfilAdministrador = true;
                        $rootScope.usuarioLogado.perfilDealer = true;
                    } else if (ret.data.perfil.nome == "Consultor") {
                        $rootScope.usuarioLogado.perfilConsultor = true;
                    } else {
                        sysServicos.sendWarnMsg("Não foi possível identificar seu perfil");
                        setTimeout(function () {
                            $scope.logOut();
                        }, 1000);
                    }

                    //inicia scripts de animacao apos o carregamento das infromacoes do menu
                    $(document).ready(function () {
                        setTimeout(startScripts, 100);
                        function startScripts() {
                            Core.init();
                        }
                    });

                    let promiseAplication = $http.get(rootURL + "v1/contaAplicacao");
                    promiseAplication.then(
                        function (ret) {
                            for (x = 0; x < ret.data.length; x++) {
                                if (
                                    ret.data[x].applicationId ==
                                    "01e4d121-0c9a-422b-a5c3-aa6ad2de9234"
                                ) {
                                    // 50% toyota
                                    $rootScope.usuarioLogado.permissionT50 = true;
                                }
                                if (
                                    ret.data[x].applicationId ==
                                    "565a319a-71a0-40f1-a860-c007ae86dc56"
                                ) {
                                    // 100% toyota
                                    $rootScope.usuarioLogado.permissionT100 = true;
                                }
                                if (
                                    ret.data[x].applicationId ==
                                    "cffa3a0c-c1f3-4dd3-8256-dc29a12b21b4"
                                ) {
                                    // 50% lexus
                                    $rootScope.usuarioLogado.permissionL50 = true;
                                }
                                if (
                                    ret.data[x].applicationId ==
                                    "8053b030-bb15-4caf-b552-843b53d33b4f"
                                ) {
                                    // 100% lexus
                                    $rootScope.usuarioLogado.permissionL100 = true;
                                }
                            }

                            $cookieStore.put("perfilUsuario", $rootScope.usuarioLogado);
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

        $scope.getDadosUsuarioDealer = function () {
            let promise = $http.get(rootURL + "dealer/eu");
            promise.then(
                function (response) {
                    $rootScope.usuarioDealer = response.data[0];
                    $cookieStore.put("dealerUsuario", $rootScope.usuarioDealer);
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

        $scope.gotoFaleConosco = function () {
            $state.go("faleConosco");
        };

        //Envelope de Mensagens
        $scope.getMensagensAbertas = function () {
            var promise = $http.get(rootURL + "v1/listaFaleConosco/1");
            promise.then(
                function (response) {
                    $scope.mensagens = response.data.length;
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
        //Sino Topo
        $scope.getSino = function () {
            var promise = $http.get(rootURL + "v1/sino");
            promise.then(
                function (response) {
                    $scope.sino = response.data[0].sino;
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

        $scope.gotoReembolso = function () {
            $state.go("reembolso");
        };
        $scope.gotoPlanoMidia = function () {
            $state.go("planoMidia");
        };

        $scope.init = function () {
            $scope.getDadosUsuarioLogado();
            $scope.getDadosUsuarioDealer();
            $scope.getMensagensAbertas();
        };
        $scope.init();
    }
]);

app.controller("loadMenu", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    "$state",
    "$stateParams",
    "$location",
    "$cookieStore",
    "$cookies",
    function (
        $scope,
        $http,
        $rootScope,
        sysServicos,
        $state,
        $stateParams,
        $location,
        $cookieStore,
        $cookies
    ) {
        //$rootScope.usuarioLogado = $cookieStore.get('perfilUsuario');
        //Remover cookies de dados de reembolso
        $scope.clearCookies = () => {
            $cookieStore.remove("reembolsoDealer");
            $cookieStore.remove("planoMidiaDealer");
            $cookies.remove("regiao");
        };
    }
]);

app.controller("loadMsgAviso", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    function ($scope, $http, $rootScope, sysServicos) {
        $scope.mgsAvisos = [];

        var promise = $http.get(rootURL + "notificacao");
        promise.then(
            function (ret) {
                $scope.mgsAvisos = ret.data;
                $scope.mgsAvisos.counter = 0;
                $scope.mgsAvisos.view = false;

                for (n = 0; n < $scope.mgsAvisos.length; n++) {
                    if (!$scope.mgsAvisos[0].visualizada) {
                        $scope.mgsAvisos.counter++;
                    }
                }

                if ($scope.mgsAvisos.counter > 0) {
                    $scope.mgsAvisos.view = true;
                }
            },
            function (err) {
                sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
            }
        );

        $scope.openAvisos = function () {
            if ($scope.mgsAvisos.counter > 0) {
                $scope.mgsAvisos.view = false;
                $scope.mgsAvisos.counter = 0;

                var promise = $http.put(rootURL + "notificacao");
                promise.then(
                    function (ret) { },
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
    }
]);
