//auditoria.controller.js
angular.module("auditarModule", []).controller("auditarController", [
    "$scope",
    "$q",
    "$http",
    "$state",
    "$stateParams",
    "$rootScope",
    "sysServicos",
    "Upload",
    "$timeout",
    "$cookieStore",
    "applicationService",
    "auditoriaService",
    "uiGridConstants",
    "$location",
    "$sce",
    function (
        $scope,
        $q,
        $http,
        $state,
        $stateParams,
        $rootScope,
        sysServicos,
        Upload,
        $timeout,
        $cookieStore,
        applicationService,
        auditoriaService,
        uiGridConstants,
        $location,
        $sce
    ) {
        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.acao = null;
        $scope.showData = true;
        $scope.reauditar = false;
        $scope.showMotivoView = false;

        $scope.motivoReprovacao = {
            text: "",
            codigo: null
        };

        $scope.show = function () {
            $scope.showData = true;
        };

        $scope.hide = function () {
            $scope.showData = false;
        };

        $scope.onSalvarClickEvidencias = function () {
            const tpmArr = [];
            tpmArr.push(
                $scope.evidenciaCheck.O,
                $scope.evidenciaCheck.E,
                $scope.evidenciaCheck.A,
                $scope.evidenciaCheck.F
            );

            if (tpmArr.includes(false)) {
                $scope.showMotivoView = true;
            } else {
                $scope.buildDataAndSave();
            }
        };

        $scope.onSalvarMotivoClick = function () {
            $scope.buildDataAndSave();
        };

        $scope.onMotivoVoltarClick = function () {
            $scope.showMotivoView = false;
        };

        $scope.buildDataAndSave = function () {
            var params = {
                budgetDealerNFID: $scope.acao.budgetDealerNFID,
                motivo:
                    $scope.motivoReprovacao.text.length === 0
                        ? null
                        : $scope.motivoReprovacao.text,
                motivoReprovacaoID: $scope.motivoReprovacao.codigo,
                itens: [
                    {
                        budgetDealerNFAudTipoId: "A",
                        aprovado: $scope.evidenciaCheck["A"]
                    },
                    {
                        budgetDealerNFAudTipoId: "F",
                        aprovado: $scope.evidenciaCheck["F"]
                    },
                    {
                        budgetDealerNFAudTipoId: "O",
                        aprovado: $scope.evidenciaCheck["O"]
                    },
                    {
                        budgetDealerNFAudTipoId: "E",
                        aprovado: $scope.evidenciaCheck["E"]
                    }
                ]
            };

            auditoriaService.pathValidacaoNotaSalvar(params).then(function (res) {
                $scope.showMotivoView = false;
                $scope.onDetalheVoltarClick();
            });
        };

        $scope.validateEvidencia = function (type, aprovations, array) {
            if (aprovations[type] === true || array.length === 0) {
                return true;
            }
            return false;
        };

        $scope.selectedDocument = null;
        $scope.selectedDocumentType = null;
        $scope.navigationIndex = -1;
        $scope.listAnexos = [];

        $scope.evidenciaCheck = {
            F: false,
            A: false,
            E: false,
            O: false
        };

        $scope.image = null;
        $scope.doc = null;

        $scope.auditarImage = null;
        $scope.auditarFile = null;

        $scope.openAnexo = function (link, e) {
            window.open(link, "_blank");
        };

        $scope.hiddeNgView = function () {
            var element = window.document.getElementById("auditarView");
            element.classList.add("hidden");
        };

        $scope.onDetalheVoltarClick = function () {
            window.history.go(-1);
        };

        $scope.pause = function () {
            var audio = document.getElementById("pauseAudio");
            audio.pause()
        }

        $scope.navigate = function (value) {
            if (value === "next") {
                $scope.navigationIndex =
                    $scope.navigationIndex === $scope.listAnexos.length - 1
                        ? 0
                        : $scope.navigationIndex + 1;
            } else if (value === "prev") {
                $scope.pause()
                $scope.navigationIndex =
                    $scope.navigationIndex === 0
                        ? $scope.listAnexos.length - 1
                        : $scope.navigationIndex - 1;
            } else {
                $scope.navigationIndex = value;
            }
            $scope.navigationIndex =
                $scope.navigationIndex > $scope.listAnexos.length - 1
                    ? 0
                    : $scope.navigationIndex < 0
                        ? $scope.listAnexos.length - 1
                        : $scope.navigationIndex;
            var urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i;
            $scope.showItem(
                $scope.listAnexos[$scope.navigationIndex],
                urlRegex.test($scope.listAnexos[$scope.navigationIndex])
            );
        };

        $scope.showItem = function (url, isImage) {
            $scope.auditarImage = isImage == true ? url : null;
            $scope.auditarFile = isImage == false ? url : null;
            $scope.setCurrentIten(url);
        };

        function getExt(nome) {
            let extInit = nome.lastIndexOf(".");
            let ext = nome.slice(extInit);
            return ext;
        }

        $scope.setCurrentIten = function (url) {
            var currentItem;
            var listaEvidencias = $scope.acao.tiposEvidencias;
            listaEvidencias.forEach(function (element) {
                currentItem = verifyItenExistInArray(
                    url,
                    "url",
                    element.evidencias
                );

                if (currentItem != false) {
                    $scope.selectedDocument = currentItem;
                    $scope.selectedDocumentType = element.tipoEvidenciaNome;
                    return;
                }
            });
        };

        function verifyItenExistInArray(value, field, array) {
            var result = false;
            array.forEach(function (element) {
                if (element[field] === value) {
                    result = element;
                }
            });
            return result;
        }

        $scope.salvarValidacao = function (data) {
            return $q(function (resolve, reject) {
                var promise = $http.patch(
                    rootURL + "auditoria/validacao/nota/salvar",
                    data
                );
                promise.then(
                    function (ret) {
                        resolve();
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.message, err.config.url);
                    }
                );
            });
        };

        $scope.getDetalheAcao = function () {
            return $q(function (resolve, reject) {
                var promise = $http.get(
                    rootURL +
                    "v1/detalheAcao?BudgetDealerNFID=" +
                    $stateParams.BudgetDealerNFID
                );
                promise.then(
                    function (ret) {
                        $scope.acao = ret.data;

                        var listaEvidencias = $scope.acao.tiposEvidencias;
                        listaEvidencias.forEach(function (t) {
                            t.evidencias.forEach(function (element) {
                                element.tipo = element.url.replace(/^.*\./, '');  //Pega a Extensão
                                $scope.listAnexos.push({ url: element.url, type: element.tipo, categoria: t.tipoEvidenciaNome, nome: element.nome });  //Adiciona URL, Tipo e Categoria ao Escopo de lista de Anexos
                            });
                        });

                        $scope.hasChecked = [];

                        $scope.hasChecked = $scope.acao.itens;
                        console.log('CHECKEEEED');
                        console.log( $scope.hasChecked);
                        
                        $scope.clearEvidenciasChecked = function () {
                            if ($scope.hasChecked[1].aprovado) {
                                $scope.hasChecked[1].aprovado = false;
                            } else {
                                $scope.hasChecked[1].aprovado = true;
                            }
                        };

                        $scope.clearOutrosChecked = function () {
                            if ($scope.hasChecked[3].aprovado) {
                                $scope.hasChecked[3].aprovado = false;
                            } else {
                                $scope.hasChecked[3].aprovado = true;
                            }
                        };

                        $scope.clearPIChecked = function () {
                            if ($scope.hasChecked[0].aprovado) {
                                $scope.hasChecked[0].aprovado = false;
                            } else {
                                $scope.hasChecked[0].aprovado = true;
                            }
                        };

                        $scope.clearNFChecked = function () {
                            if ($scope.hasChecked[2].aprovado) {
                                $scope.hasChecked[2].aprovado = false;
                            } else {
                                $scope.hasChecked[2].aprovado = true;
                            }
                        };

                        $scope.clearIncentivosChecked = function () {
                            if ($scope.hasChecked[2].aprovado) {
                                $scope.hasChecked[2].aprovado = false;
                            } else {
                                $scope.hasChecked[2].aprovado = true;
                            }
                        };

                        $scope.clearEstrategiasChecked = function () {
                            if ($scope.hasChecked[1].aprovado) {
                                $scope.hasChecked[1].aprovado = false;
                            } else {
                                $scope.hasChecked[1].aprovado = true;
                            }
                        };
                        resolve();
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(
                            err.status,
                            err.statusText,
                            err.config.url
                        );
                    }
                );
            });

        };

        $scope.activeIndex = 0;
        $scope.activeExtension = 0;

        $scope.nextEvidency = function () {
            $scope.activeIndex = $scope.activeIndex + 1;
            $scope.pause();
        };

        $scope.goToFirstEvidency = function () {
            $scope.activeIndex = 0;
        }

        $scope.previousEvidency = function () {
            $scope.activeIndex = $scope.activeIndex - 1;
            $scope.pause();
        };

        $scope.getValidacaoNotaMotivos = function () {
            return $q(function (resolve, reject) {
                auditoriaService.getValidacaoNotaMotivos().then(function (res) {
                    $scope.listMotivoReprovacao = res.data;
                    resolve();
                });
            });
        };

        $scope.init = function () {
            var element = window.document.getElementById("auditarView");
            element.classList.remove("hidden"); //setAttribute("style", "display: block;");

            $scope
                .getDetalheAcao()
                .then(function (res) {
                    return $scope.getValidacaoNotaMotivos();
                })
                .then(function (res) {
                    $scope.navigate(0);
                });
        };

        $scope.init();
    }
]);
