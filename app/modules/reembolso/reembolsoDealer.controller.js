angular
    .module("reembolsoModule", [])
    .controller("reembolsoController", [
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
        "$stateParams",
        "reembolsoService",
        function (
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
            $stateParams,
            reembolsoService
        ) {
            var date = new Date();
            var month = date.getMonth();
            $scope.monthBlocked = month - 5;

            $scope.applications = [];
            $scope.filtro = {};
            $scope.anoFiscal = [];
            $scope.periodos = [];
            $scope.meses = [];
            $scope.nota = {};
            $scope.verbaResumo = {};
            $scope.verbaGeral = {};
            $scope.abaActive = "";
            $scope.budgetDealerID = 0;
            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
            $scope.dealer = $cookieStore.get("dealerUsuario");
            //BudgetDealerStatusID	Descricao
            //1	Pendente
            //2	Disponibilizado
            //3	Fechado Dealer
            //4	Recebido Auditoria
            //5	Fechado Auditoria
            //6	Incons.Auditoria
            //7	Fechado Pré - Auditoria
            //8	Recebido Vendas
            //9	Auditoria Vendas
            //10	Reprovado Vendas
            //11	Fechado Vendas
            //12	Recebimento MKT
            //13	Recebido Financeiro
            //14	Reprovado MKT
            //15	Fechamento Financeiro
            //16	Recebimento Financeiro
            //17	Pagamento
            //18	Não Utilizado
            //19	Não Recebidos
            //20	Inconsistência Tratada
            //21	Rascunho


            $scope.selecionarNota = function (budgetDealerID, statusId) {
                $scope.budgetDealerID = budgetDealerID;
                $scope.status = statusId;
                $scope.$$childHead.$$nextSibling.getAcoesRealizadas(
                    $scope.abaActive, budgetDealerID
                );
            };
            $scope.zerarNota = function () {
                $scope.budgetDealerID = 0;
            };

            $scope.getApplications = function () {
                return $q(function (resolve, reject) {
                    $http.get(rootURL + "v1/contaAplicacao")
                        .then(
                            function (response) {
                                $scope.applications = response.data;
                                if ($scope.applications.length > 0) {
                                    $scope.abaActive = $scope.applications[0].applicationId;
                                }
                                resolve();
                            },
                            function (response) {
                                reject(response);
                            }
                        );
                });
            };

            $scope.buildObjEnvio = function (aba, budgetDealerID) {
                var _objEnvio = {};
                _objEnvio.dealerID = $scope.dealer.dealerID || $stateParams.dealerID;
                _objEnvio.anoFiscal = parseInt($scope.filtro.ano);
                _objEnvio.periodoNum = $scope.filtro.periodo;
                _objEnvio.mes = parseInt($scope.filtro.mes);
                _objEnvio.budgetDealerId = budgetDealerID;
                _objEnvio.applicationId = aba;
                return _objEnvio;
            };

            // muda abas
            $scope.changeAba = function (aba) {
                $scope.abaActive = aba;
                $scope.filtrar();
            };

            $scope.novaAcao = function () {
                if ($scope.filtro.mes === null || $scope.filtro.mes === 'null' || $scope.filtro.mes === undefined) {
                    sysServicos.sendWarnMsg("Informe o mês para inserir nova ação.");
                    return;
                }

                $state.go("reembolsoAcaoDealer", {
                    ano: $scope.filtro.ano,
                    mes: $scope.filtro.mes,
                    abaId: $scope.abaActive
                });
            };;

            $scope.novaAcaoBudgetDealerId = function (budgetDealerId) {
                if ($scope.filtro.mes === null || $scope.filtro.mes === 'null' || $scope.filtro.mes === undefined) {
                    sysServicos.sendWarnMsg("Informe o mês para inserir nova ação.");
                    return;
                }

                $state.go("reembolsoAcaoDealer", {
                    ano: $scope.filtro.ano,
                    mes: $scope.filtro.mes,
                    abaId: $scope.abaActive,
                    bdId: budgetDealerId
                });
            };

            //acompanhar
            $scope.getVerba = function (aba) {
                return $q(function (resolve, reject) {
                    var promise = $http.post(
                        rootURL + "v1/cabecReembolso",
                        $scope.buildObjEnvio(aba)
                    );

                    promise.then(
                        function (ret) {
                            $scope.nota = ret.data[0];
                            $scope.canCreateActions = ret.data[0].dentroValidade;
                            $scope.$$childHead.statusNota = $scope.nota.status
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

                    var promise2 = $http.post(
                        rootURL + "v1/resumoReembolso",
                        $scope.buildObjEnvio(aba)
                    );
                    promise2.then(
                        function (ret) {
                            $scope.verbaResumo.totalAprovada = 0;
                            $scope.verbaResumo.totalReprovado = 0;
                            $scope.verbaGeral = ret.data;
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

            $scope.gerarNotaDebito = function () {
                var params = $scope.buildObjEnvio($scope.abaActive, $scope.budgetDealerID);
                $rootScope.closeModal();
                reembolsoService.patchGerarNota(params).then(function (res) {
                    if (res.data.statusCode == 200) {
                        sysServicos.sendSuccessMsg("Enviado com sucesso");
                        $scope.filtrar();
                        //setTimeout(function () {
                        //    $scope.filtrar();
                        //    $scope.reImpressao();
                        //}, 1000);
                    }
                    else {
                        sysServicos.sendErrorMsg(res.data.statusCode, res.data.message, res.config.url, res.data.message);
                    }
                });
            };

            $scope.reenviarNotaDebido = function () {
                $rootScope.closeModal();
                let promise = $http.post(rootURL + 'v1/reencaminhar?budgetDealerId=' + $scope.nota.budgetDealerID);
                promise.then(
                    function (ret) {
                        if (ret.data.statusCode == 200) {
                            sysServicos.sendSuccessMsg("Reenviado com sucesso");
                            $scope.filtrar();
                        }
                        else {
                            sysServicos.sendErrorMsg(ret.data.statusCode, ret.data.message, ret.config.url, ret.data.message);
                        }
                    }, function (error) {
                        sysServicos.sendErrorMsg(
                            error.status,
                            error.statusText,
                            error.config.url,
                            error.data.message
                        );
                    }
                );
            };

            //$scope.reImpressao = function () {
            //    $cookieStore.put("currentPrintDealer", $rootScope.usuarioDealer);

            //    window.open(
            //        rootURLInter + "app/#/impressao/" + $scope.verba.budgetDealerID,
            //        "_blank"
            //    );
            //};

            $scope.filtrar = function () {
                $scope.setPeriodoDoCockie($scope.filtro.ano, $scope.filtro.periodo, $scope.filtro.mes);
                $scope.getVerba($scope.abaActive);
                $scope.$$childHead.getNotasRealizadas(
                    $scope.abaActive
                );
                $scope.$$childHead.$$nextSibling.getAcoesRealizadas(
                    $scope.abaActive
                );
                $scope.$$childHead.$$nextSibling.$$nextSibling.getAcoesExcluidas(
                    $scope.abaActive
                );
                $scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling.getEtapas(
                    $scope.abaActive
                );
                $scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling.$$nextSibling.getAtencao(
                    $scope.abaActive
                );
            };

            // so pode ser iniciado apos o carregamento de ano fiscal e mes
            $scope.init = function () {
                // as apis abaixo devem ser carregadas de acordo com o tipo de permissão do usuário
                $timeout(function () {
                    $scope.$$childHead.getNotasRealizadas(
                        $scope.abaActive
                    );
                    $scope.$$childHead.$$nextSibling.getAcoesRealizadas(
                        $scope.abaActive
                    );
                    $scope.$$childHead.$$nextSibling.$$nextSibling.getAcoesExcluidas(
                        $scope.abaActive
                    );
                    $scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling.getEtapas(
                        $scope.abaActive
                    );
                    $scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling.$$nextSibling.getAtencao(
                        $scope.abaActive
                    );
                }, 1500);
            };

            $scope.dropAnoFiscal = function () {
                return $q(function (resolve, reject) {
                    $http.get(rootURL + "periodo/anos")
                        .then(
                            function (response) {
                                $scope.anoFiscal = response.data;
                                let anoAtual = response.data.find(ano => ano.atual);
                                if (anoAtual)
                                    $scope.filtro.ano = anoAtual.anoFiscal;

                                resolve();
                            },
                            function (response) {
                                reject(response);
                            }
                        );
                });
            };

            $scope.dropPeriodos = function (atual = true) {
                return $q(function (resolve, reject) {
                    $http({
                        method: 'GET',
                        url: rootURL + "periodo/grupos",
                        params: { anoFiscal: $scope.filtro.ano }
                    }).then(
                        function (response) {
                            $scope.periodos = response.data;
                            if (atual) {
                                let periodoAtual = response.data.find(periodo => periodo.atual);
                                if (periodoAtual)
                                    $scope.filtro.periodo = periodoAtual.grupo;
                            }

                            resolve();
                        },
                        function (response) {
                            reject(response);
                        }
                    );
                });
            };

            $scope.dropMeses = function (atual = true) {
                return $q(function (resolve, reject) {
                    $http({
                        method: 'GET',
                        url: rootURL + "periodo/meses",
                        params: {
                            anoFiscal: $scope.filtro.ano,
                            periodoNum: $scope.filtro.periodo
                        }
                    }).then(
                        function (response) {
                            $scope.meses = response.data;
                            if (atual) {
                                let mesAtual = response.data.find(mes => mes.atual);
                                if (mesAtual)
                                    $scope.filtro.mes = mesAtual.mesId;
                            }

                            resolve();
                        },
                        function (response) {
                            reject(response);
                        }
                    );
                });
            };

            $scope.changeAno = function () {
                $scope
                    .dropPeriodos()
                    .then(function (res) {
                        return $scope.dropMeses();
                    })
                    .then(function (res) {
                        return $scope.filtrar();
                    })
                    .catch(function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    });
            }

            $scope.changePeriodo = function () {
                $scope
                    .dropMeses()
                    .then(function (res) {
                        return $scope.filtrar();
                    })
                    .catch(function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    });
            }

            $scope.carrergaPeriodoDoCockie = function () {
                return $q(function (resolve, reject) {
                    var anoAtual = $cookieStore.get("reembolsoAno");
                    var periodoAtual = $cookieStore.get("reembolsoPeriodo");
                    var mesAtual = $cookieStore.get("reembolsoMes");
                    if (!anoAtual && !periodoAtual && !mesAtual) {
                        $scope
                            .setPeriodoDoCockie($scope.filtro.ano, $scope.filtro.periodo, $scope.filtro.mes)
                            .then(function () {
                                resolve();
                            });
                    } else {
                        $scope.filtro.ano = anoAtual;
                        $scope.filtro.periodo = periodoAtual;
                        $scope.filtro.mes = mesAtual;

                        $scope
                            .dropPeriodos(false)
                            .then(function (res) {
                                return $scope.dropMeses(false);
                            });

                        resolve();
                    }
                });
            };

            $scope.setPeriodoDoCockie = function (ano, periodo, mes) {
                return $q(function (resolve, reject) {
                    try {
                        $cookieStore.put("reembolsoAno", ano);
                        $cookieStore.put("reembolsoPeriodo", periodo);
                        $cookieStore.put("reembolsoMes", mes);
                        resolve();
                    } catch (error) {
                        reject();
                    }
                });
            };

            $scope
                .getApplications()
                .then(function (res) {
                    return $scope.dropAnoFiscal();
                })
                .then(function (res) {
                    return $scope.dropPeriodos();
                })
                .then(function (res) {
                    return $scope.dropMeses();
                })
                .then(function (res) {
                    return $scope.carrergaPeriodoDoCockie();
                })
                .then(function (res) {
                    return $scope.getVerba($scope.abaActive);
                })
                .then(function (res) {
                    return $scope.init();
                })
                .catch(function (err) {
                    sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                });
        }
    ])
    

    .controller("gerarNotaController", [
        "$scope",
        "$http",
        "$state",
        "$rootScope",
        "sysServicos",
        "$cookieStore",
        "applicationService",
        function (
            $scope,
            $http,
            $rootScope,
            sysServicos,
            $cookieStore,
            applicationService
        ) {
            $scope.gerarNotaDebito = function () {
                $scope.$parent.$$childHead.gerarNotaDebito();
            };

            $scope.closeModal = function () {
                $scope.$parent.$$childHead.closeModal();
            };

            $scope.reenviarNotaDebido = function () {
                $scope.$parent.$$childHead.reenviarNotaDebido();
            };
        }
    ])

    .controller("impressaoController", [
        "$scope",
        "$http",
        "$stateParams",
        "sysServicos",
        function ($scope, $http, $stateParams, sysServicos) {
            $scope.isLoading = true;
            $http({
                method: "GET",
                url: rootURL + "v1/imprimeNF",
                params: {
                    BudgetDealerID: $stateParams.budgetDealerID
                }
            }).then(
                function (retorno) {
                    $scope.isLoading = false;
                    $scope.mes = retorno.data[0].mes;
                    $scope.impressao = retorno.data[0];
                    $scope.impressao.mes = (function () {
                        switch ($scope.impressao.mes) {
                            case 1:
                                return "Janeiro";
                            case 2:
                                return "Fevereiro";
                            case 3:
                                return "Março";
                            case 4:
                                return "Abril";
                            case 5:
                                return "Maio";
                            case 6:
                                return "Junho";
                            case 7:
                                return "Julho";
                            case 8:
                                return "Agosto";
                            case 9:
                                return "Setembro";
                            case 10:
                                return "Outubro";
                            case 11:
                                return "Novembro";
                            case 12:
                                return "Dezembro";
                        }
                    })();
                },
                function (erro) {
                    $scope.impressao = {};

                    sysServicos.sendErrorMsg(
                        erro.status,
                        erro.statusText,
                        erro.config.url
                    );
                }
            );
        }
    ])

    .controller("acaoController", [
        "$scope",
        "$q",
        "$http",
        "$state",
        "$rootScope",
        "sysServicos",
        "Upload",
        "$timeout",
        "$stateParams",
        "manipulaString",
        "$cookieStore",
        "anexosReembolso",
        "applicationService",
        "reembolsoService",
        function (
            $scope,
            $q,
            $http,
            $state,
            $rootScope,
            sysServicos,
            Upload,
            $timeout,
            $stateParams,
            manipulaString,
            $cookieStore,
            anexosReembolso,
            applicationService,
            reembolsoService
        ) {
            $scope.acao = { "documento": "" };
            $scope.modelosIncentivo = [];
            $scope.miSelected = [];
            $scope.tipoMidias = [];
            $scope.modelosIncentivoDetalhe = [];
            $scope.listEvidencias = [];
            $scope.dataAcaoNf = {};
            $scope.dataAcaoNf = {};
            $scope.isLoading = false;

            $scope.anexosReembolso = [];

            $scope.files = [];
            $scope.errFiles = [];

            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
            console.clear();
            $scope.dealer = $cookieStore.get("dealerUsuario");
            $scope.openAnexo = function (link) {
                window.open(link, "_blank");
            };

            $scope.removerExcedentesNF = function () {
                var texto = $scope.acao.num_NF;
                $scope.acao.num_NF = texto.replace(/^0+(?!\.|$)/, '');
            };

            $scope.exists = function (item, list) {
                return list.indexOf(item) > -1;
            };

            $scope.isIndeterminate = function () {
                return (
                    $scope.miSelected.length !== 0 &&
                    $scope.miSelected.length !== $scope.items.length
                );
            };

            // controle de checkbox - modelo de incentivo
            ////////////////////////////////////////////

            $scope.calculaParcela = function (valor, entrada, parcelas) {
                var precoComEntrada = valor - entrada;

                return precoComEntrada / parcelas;
            };

            $scope.getDropModeloIncentivo = function () {
                promise = $http.get(
                    rootURL + "v1/veiculos?applicationId=" + $stateParams.abaId
                );
                promise.then(
                    function (ret) {
                        $scope.modelosIncentivo = ret.data;
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

            $scope.selectModeloID = function (modelo) {
                modelo.checked = !modelo.checked;
            };

            $scope.getDropMidias = function () {
                promise = $http.get(
                    rootURL + "v1/midias?applicationId=" + $stateParams.abaId
                );
                promise.then(
                    function (ret) {
                        $scope.tipoMidias = ret.data;
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

            $scope.salvarAcao = function (estado) {
                if (validate(1) && validate(2)) {
                    $scope.isLoading = true;
                    var objEnvio = $scope.createPostNovaAcaoObject();
                    var budgetDealerNFID = null;
                    reembolsoService
                        .postNovaAcao(objEnvio)
                        .then(function (result) {
                            budgetDealerNFID = result.data.result.budgetDealerNFID;
                            var objVeiculo = $scope.createPostAcaoVeiculoObject(
                                budgetDealerNFID
                            );
                            return reembolsoService.postAcaoVeiculo(objVeiculo);
                        })
                        .then(function (result) {
                            var objReembolso = $scope.createPostEvidenciaObject(
                                budgetDealerNFID
                            );
                            return reembolsoService.postEvidencia(objReembolso);
                        })
                        .then(function (result) {
                            var params = {
                                ano: $stateParams.ano,
                                mes: $stateParams.mes,
                                abaId: $stateParams.abaId,
                                
                            };
                            if (estado === 0) {
                                setTimeout(function () {
                                    $state.go("reembolsoAcaoDealer", params);
                                }, 800);
                            }
                            $scope.isLoading = false;
                            $state.go(`reembolsoDealer`);
                        })
                        .catch(function (error) {
                            sysServicos.sendWarnMsg(
                                error.data.message,
                                error.status,
                                error.statusText,
                                error.config.url
                            );
                            $scope.isLoading = false;
                        });
                }
            };

            $scope.createPostNovaAcaoObject = function () {
                var objEnvio = {};

                objEnvio.dealerID = $scope.dealer.dealerID;
                objEnvio.anoFiscal = $stateParams.ano;
                objEnvio.mes = $stateParams.mes;
                objEnvio.bdId = $stateParams.bdId;
                objEnvio.fornecedor = $scope.acao.fornecedor;
                objEnvio.numPI = $scope.acao.numPI;
                objEnvio.num_NF = $scope.acao.num_NF;
                objEnvio.valorNF = $scope.acao.valorNF;
                objEnvio.valorPago = $scope.acao.valorPago;
                objEnvio.dataNF = $scope.dataAcaoNf.date.toISOString();

                objEnvio.appId = $scope.appId;
                objEnvio.userID = $scope.usuarioLogado.id;

                objEnvio.descricaoServico = $scope.acao.descricaoServico;
                objEnvio.estrategiaIDs = [];
                objEnvio.cnpJ_Fornecedor = $scope.acao.documento;
                objEnvio.applicationId = $stateParams.abaId;
                objEnvio.veiculacoes = $scope.acao.veiculacoes;
                objEnvio.comissao = $scope.acao.comissao;

                objEnvio.tipoMidiaID = $scope.acao.tipoMidiaID;
                return objEnvio;
            };

            $scope.createPostAcaoVeiculoObject = function (budgetDealerNFID) {
                var modelo = {
                    budgetDealerNFID,
                    veiculos: []
                };

                for (var i = 0; i < $scope.modelosIncentivo.length; i++) {
                    if ($scope.modelosIncentivo[i].checked) {
                        var veiculo = {};
                        veiculo.veiculoID = $scope.modelosIncentivo[i].veiculoID;
                        modelo.veiculos.push(veiculo);
                    }
                }

                return modelo;
            };

            $scope.createPostEvidenciaObject = function (budgetDealerNFID) {
                var modelo = {
                    budgetDealerNFID,
                    evidencias: []
                };

                Object.keys($scope.anexosReembolso).forEach(function (anexoTipo) {
                    $scope.anexosReembolso[anexoTipo].forEach(function (anexo) {
                        modelo.evidencias.push({
                            nome: anexo.nome,
                            url: anexo.url,
                            tipo: anexoTipo
                        });
                    });
                });

                return modelo;
            };

            //upload de evidencias
            $scope.uploadFiles = function (files, errFiles, box) {
                var error = errFiles[0];
                if (error && error.$error === "maxSize")
                    sysServicos.sendWarnMsg(`O tamanho máximo para anexo permitido é de ${error.$errorParam}.`);

                angular.forEach(files, function (file) {
                    var nameFile = manipulaString.removeEspecialCaracteres(file.name);

                    if (!$scope.files[box]) {
                        $scope.files[box] = [];
                    }

                    if (!$scope.errFiles[box]) {
                        $scope.errFiles[box] = [];
                    }

                    $scope.files[box] = files;
                    $scope.errFiles[box] = errFiles;

                    file.upload = Upload.upload({
                        method: "POST",
                        url: rootURL + "v2/enviar/evidencias",
                        data: {
                            files: file
                        }
                    });

                    file.upload.then(
                        function (response) {
                            $timeout(function () {
                                file.result = response.data;
                                var item = {};
                                item.nome = nameFile;
                                item.url = response.data.result.filesUploaded[0];
                                item.tipo = box;
                                item.budgetDealerNFID = $stateParams.currentId;
                                item.novo = true;

                                if (!$scope.anexosReembolso[box]) {
                                    $scope.anexosReembolso[box] = [];
                                }

                                item.descricao = anexosReembolso[box];

                                $scope.anexosReembolso[box].push(item);
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

            $scope.excluirAnexo = function (item, box) {
                if ($scope.anexosReembolso[box]) {
                    $scope.anexosReembolso[box].splice(
                        $scope.anexosReembolso[box].indexOf(item), 1
                    );
                } else {
                    sysServicos.sendWarnMsg("Não foi possível identificar registro");
                }
            };

            $scope.maxDate = new Date();
            $scope.comparaData = function () {
                $scope.dataPermitida = false;
                if ($scope.maxDate < $scope.dataAcaoNf.date) {
                    $scope.dataPermitida = false;
                } else {
                    $scope.dataPermitida = true;
                }
            };

            $scope.loadEvidencias = function () {
                return $q(function (resolve, reject) {
                    promise = $http.get(
                        rootURL + "v1/evidencias"
                    );
                    promise
                        .then(function (res) {
                            $scope.listEvidencias = res.data;
                            resolve();
                        })
                        .catch(function (err) {
                            sysServicos.sendErrorMsg(
                                err.status,
                                err.statusText,
                                err.config.url
                            );
                        });
                });
            };

            $scope.init = function () {
                $scope.getDropModeloIncentivo();
                $scope.getDropMidias();
                $scope.loadEvidencias();
                $scope.comparaData();
            };
            $scope.init();

            var validate = function (id) {
                var countError = 0;
                var errorFields = [];
                var msgType = 0;

                var ret = true;

                if (id == 1) {
                    if ($scope.acao.documento == "") {
                        ret = false;
                        msgType = 0;
                        errorFields.push("CPF/CNPJ");
                    }
                    if ($scope.acao.fornecedor == "" || $scope.acao.fornecedor == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Fornecedor");
                    }
                    if ($scope.acao.num_NF == "" || $scope.acao.num_NF == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Nº NF");
                    }
                    if (
                        $scope.dataAcaoNf.date == "" ||
                        $scope.dataAcaoNf.date == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Data NF");
                    }
                    if ($scope.dataPermitida == false) {
                        ret = false;
                        msgType = 3;
                        errorFields.push("Data da NF");
                    }
                    if ($scope.acao.valorNF == "" || $scope.acao.valorNF == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Valor NF");
                    }
                    if (
                        $scope.acao.tipoMidiaID == "" ||
                        $scope.acao.tipoMidiaID == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Mídia");
                    }
                    if ($scope.acao.comissao == "" || $scope.acao.comissao == undefined) {
                        $scope.acao.comissao = false;
                        //ret = false;
                        //msgType = 0;
                        //errorFields.push("Tem comissão");
                    }
                    if ($scope.modelosIncentivo.filter(modelo => modelo.checked).length == 0 || $scope.modelosIncentivo.length == 0) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Linha Incentivada");
                    }
                    if (
                        $scope.acao.descricaoServico == "" ||
                        $scope.acao.descricaoServico == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Descrição do Serviço");
                    }

                    if ($scope.listEvidencias.length == 0) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Anexos");
                    }
                    else {
                        let lista = $scope.listEvidencias;
                        for (let i = 0; i < lista.length; i++) {
                            if (lista[i].obrigatorio) {
                                let tipoEvidenciaID = lista[i].tipoEvidenciaID.toString();
                                if (
                                    !$scope.anexosReembolso[tipoEvidenciaID] ||
                                    $scope.anexosReembolso[tipoEvidenciaID].length === 0
                                ) {
                                    ret = false;
                                    msgType = 0;
                                    errorFields.push(lista[i].descricao);
                                }
                            }
                        }
                    }

                }
                if (id == 2) {
                    if (
                        $scope.acao.documento == undefined
                    ) {
                        ret = false;
                        msgType = 2;
                        errorFields.push("CPF/CNPJ");
                    }
                }

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

                if (msgType == 1) {
                    sysServicos.sendWarnMsg("Selecione uma imagem");
                }
                if (msgType == 2) {
                    sysServicos.sendWarnMsg("Informe um CPF/CNPJ válido");
                }
                if (msgType == 3) {
                    sysServicos.sendWarnMsg(
                        "O campo Data da NF não pode ser maior que a data de hoje e deve ser preenchido no formato DD/MM/YYYY"
                    );
                }

                return ret;
            };
        }
    ])

    .controller("acaoDetalheController", [
        "$scope",
        "$http",
        "$state",
        "$rootScope",
        "$q",
        "$cookieStore",
        "sysServicos",
        "Upload",
        "$timeout",
        "$stateParams",
        "manipulaString",
        "anexosReembolso",
        "applicationService",
        "reembolsoService",
        function (
            $scope,
            $http,
            $state,
            $rootScope,
            $q,
            $cookieStore,
            sysServicos,
            Upload,
            $timeout,
            $stateParams,
            manipulaString,
            anexosReembolso,
            applicationService,
            reembolsoService
        ) {

            var date = new Date();
            var month = date.getMonth();

            $scope.monthBlocked = month - 5;

            $scope.acao = { "documento": "" };
            $scope.modelosIncentivo = [];
            $scope.miSelected = [];
            $scope.tipoMidias = [];
            $scope.modelosIncentivoDetalhe = [];
            $scope.listEvidencias = [];
            $scope.dataAcaoNf = {};

            $scope.anexosReembolso = {};

            $scope.files = [];
            $scope.errFiles = [];
            $scope.selectTypes = {
                roles: []
            };

            $scope.statusPeriodo = 0;

            $scope.canEdit = true;

            $scope.tipoAcaoNF = null;
            $scope.dealersList = null;
            $scope.selectedDealer = null;

            $scope.selectTypes = {
                roles: []
            };

            $scope.currentNumNfRef = null;

            $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
            $scope.dealer = $cookieStore.get("dealerUsuario");

            $scope.goback = function () {
                window.history.go(-1);
            }

            $scope.getDealerRole = function () {
                let promise = $http.get(rootURL + 'conta/eu');
                promise.then(
                    function (ret) {
                        $scope.dealerRole = ret.data;
                    }
                )
            }

            $scope.openAnexo = function (link) {
                window.open(link, "_blank");
            };

            $scope.removerExcedentesNF = function () {
                var texto = $scope.acao.num_NF;
                $scope.acao.num_NF = texto.replace(/^0+(?!\.|$)/, '');
            };

            $scope.exists = function (item, list) {
                return list.indexOf(item) > -1;
            };

            $scope.isIndeterminate = function () {
                return (
                    $scope.miSelected.length !== 0 &&
                    $scope.miSelected.length !== $scope.items.length
                );
            };

            // controle de checkbox - modelo de incentivo
            ////////////////////////////////////////////

            $scope.calculaParcela = function (valor, entrada, parcelas) {
                var precoComEntrada = valor - entrada;

                return precoComEntrada / parcelas;
            };

            $scope.getDropModeloIncentivo = function () {
                promise = $http.get(
                    rootURL + "v1/veiculos?applicationId=" + $stateParams.applicationId
                );
                promise.then(
                    function (ret) {
                        $scope.modelosIncentivo = ret.data;
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

            $scope.selectModeloID = function (modelo) {
                modelo.checked = !modelo.checked;
            };

            $scope.getDropMidias = function () {
                promise = $http.get(rootURL + "v1/midias?applicationId=" + $stateParams.applicationId);
                promise.then(
                    function (ret) {
                        $scope.tipoMidias = ret.data;
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

            $scope.changeStatus = () => {
                var objEnvio = {};
                objEnvio.budgetDealerID = $stateParams.budgetId;
                objEnvio.budgetDealerStatusID = 20;
                objEnvio.motivo = "Inconsistência tratada pelo Dealer/Agência";
                let promise = $http.patch(
                    rootURL + "auditoria/processos/retornar",
                    objEnvio
                );
                promise.then(function (ret) {
                    console.log("Retorno da mudança de status", ret);
                });
            };

            $scope.editarAcao = function () {
                if (validate(1) && validate(2)) {
                    var objEnvio = $scope.createPostAlteraAcaoObject();
                    var budgetDealerNFID = null;
                    reembolsoService
                        .patchAlteraAcao(objEnvio)
                        .then(function (result) {
                            budgetDealerNFID = result.data.result.budgetDealerNFID;
                            var objVeiculo = $scope.createPostAcaoVeiculoObject(
                                budgetDealerNFID
                            );
                            return reembolsoService.postAcaoVeiculo(objVeiculo);
                        })
                        .then(function (result) {
                            var objReembolso = $scope.createPostEvidenciaObject(
                                budgetDealerNFID
                            );
                            return reembolsoService.postEvidencia(objReembolso);
                        })
                        .then(function (result) {
                            $state.go(`reembolsoDealer`);
                        })
                        .catch(function (error) {
                            sysServicos.sendWarnMsg(error.data.message);
                        });
                }
            };

            $scope.createPostAlteraAcaoObject = function () {
                var objEnvio = {};

                objEnvio.budgetDealerNFID = $stateParams.currentId;
                objEnvio.budgetDealerId = $stateParams.budgetId;
                objEnvio.fornecedor = $scope.acao.fornecedor;
                objEnvio.numPI = $scope.acao.numPI;
                objEnvio.num_NF = $scope.acao.num_NF;
                objEnvio.valorNF = $scope.acao.valorNF;
                objEnvio.valorPago = $scope.acao.valorPago;
                objEnvio.dataNF = $scope.dataAcaoNf.date.toISOString();

                objEnvio.userID = $scope.usuarioLogado.id;

                objEnvio.descricaoServico = $scope.acao.descricaoServico;
                objEnvio.estrategiaIDs = [];
                objEnvio.cnpJ_Fornecedor = $scope.acao.documento;
                objEnvio.applicationId = $stateParams.applicationId;
                objEnvio.veiculacoes = $scope.acao.veiculacoes;
                objEnvio.comissao = $scope.acao.comissao;
                objEnvio.tipoMidiaID = $scope.acao.tipoMidiaID;

                return objEnvio;
            };

            $scope.createPostAcaoVeiculoObject = function (budgetDealerNFID) {
                var modelo = {
                    budgetDealerNFID,
                    veiculos: []
                };

                for (var i = 0; i < $scope.modelosIncentivo.length; i++) {
                    if ($scope.modelosIncentivo[i].checked) {
                        var veiculo = {};
                        veiculo.veiculoID = $scope.modelosIncentivo[i].veiculoID;
                        modelo.veiculos.push(veiculo);
                    }
                }

                return modelo;
            };

            $scope.createPostEvidenciaObject = function (budgetDealerNFID) {
                var modelo = {
                    budgetDealerNFID,
                    evidencias: []
                };

                Object.keys($scope.anexosReembolso).forEach(function (anexoTipo) {
                    $scope.anexosReembolso[anexoTipo].forEach(function (anexo) {
                        modelo.evidencias.push({
                            nome: anexo.nome,
                            url: anexo.url,
                            tipo: anexoTipo
                        });
                    });
                });

                return modelo;
            };

            $scope.incluiFilesEvidencias = function () {
                var objEvidencia = {};

                var promise = $http.post(rootURL + "v1/evidencias", objEvidencia);
                promise.then(
                    function (ret) {
                        sysServicos.sendSuccessMsg("Evidencias Alteradas com sucesso");
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

            //upload de evidencias
            $scope.uploadFiles = function (files, errFiles, box) {
                var error = errFiles[0];
                if (error && error.$error === "maxSize")
                    sysServicos.sendWarnMsg(`O tamanho máximo para anexo permitido é de ${error.$errorParam}.`);

                angular.forEach(files, function (file) {
                    var nameFile = manipulaString.removeEspecialCaracteres(file.name);

                    if (!$scope.files[box]) {
                        $scope.files[box] = [];
                    }

                    if (!$scope.errFiles[box]) {
                        $scope.errFiles[box] = [];
                    }

                    $scope.files[box] = files;
                    $scope.errFiles[box] = errFiles;

                    file.upload = Upload.upload({
                        method: "POST",
                        url: rootURL + "v2/enviar/evidencias",
                        data: {
                            files: file
                        }
                    });

                    file.upload.then(
                        function (response) {
                            $timeout(function () {
                                file.result = response.data;
                                var item = {};
                                item.nome = nameFile;
                                item.url = response.data.result.filesUploaded[0];
                                item.tipo = box;
                                item.budgetDealerNFID = $stateParams.currentId;
                                item.novo = true;

                                if (!$scope.anexosReembolso[box]) {
                                    $scope.anexosReembolso[box] = [];
                                }

                                item.descricao = anexosReembolso[box];

                                $scope.anexosReembolso[box].push(item);
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

            $scope.excluirAnexo = function (item, box) {
                if ($scope.anexosReembolso[box]) {
                    $scope.anexosReembolso[box].splice(
                        $scope.anexosReembolso[box].indexOf(item), 1
                    );
                } else {
                    sysServicos.sendWarnMsg("Não foi possível identificar registro");
                }
            };

            $scope.getDetalheAcao = function () {
                var promise = $http.get(
                    rootURL +
                    "v1/detalheAcao?BudgetDealerNFID=" +
                    $stateParams.currentId
                );
                promise.then(
                    function (ret) {
                        $scope.ItemNFAudTipoA = ret.data.itens.filter(x=> x.budgetDealerNFAudTipoId === 'A')[0]
                        $scope.ItemNFAudTipoE = ret.data.itens.filter(x=> x.budgetDealerNFAudTipoId === 'E')[0]
                        $scope.ItemNFAudTipoF = ret.data.itens.filter(x=> x.budgetDealerNFAudTipoId === 'F')[0]
                        $scope.ItemNFAudTipoO = ret.data.itens.filter(x=> x.budgetDealerNFAudTipoId === 'O')[0]


                        $scope.acao = {};
                        $scope.acao = ret.data;
                        $scope.acao.statusID = ret.data.statusID;
                        $scope.acao.status = ret.data.status;

                        $scope.acao.budgetDealerNFID = ret.data.budgetDealerNFID;
                        $scope.acao.documento = ret.data.documento;
                        $scope.acao.fornecedor = ret.data.fornecedor;
                        $scope.acao.numPI = ret.data.numPI;
                        $scope.acao.num_NF = ret.data.num_NF;
                        $scope.acao.valorNF = ret.data.valor;
                        $scope.acao.valorPago = ret.data.valorPago;
                        $scope.acao.veiculacoes = ret.data.qtdeVeic;
                        $scope.acao.tipoMidiaID = ret.data.tipoMidiaID;
                        $scope.acao.comissao = ret.data.comissao.toString();
                        $scope.acao.gancho = ret.data.gancho;
                        $scope.acao.descricaoServico = ret.data.descricaoServico;
                        $scope.acao.appId = ret.data.applicationId;

                        if (ret.data.dataNF != null && ret.data.dataNF != undefined) {
                            ($scope.dataAcaoNf = this), (dateMaskFormat = "DD/MM/YYYY");
                            $scope.dataAcaoNf.date = new Date(ret.data.dataNF);
                            $scope.dataAcaoNf.default = moment($scope.dataAcaoNf.date).format(
                                dateMaskFormat
                            );
                        }

                        $scope.modelosIncentivoDetalhe = ret.data.modelosIncentivo;

                        let listaEvidencias = ret.data.tiposEvidencias;
                        for (let i = 0; i < listaEvidencias.length; i++) {
                            let tipoEvidenciaID = listaEvidencias[i].tipoEvidenciaID;
                            if (!$scope.anexosReembolso[tipoEvidenciaID])
                                $scope.anexosReembolso[tipoEvidenciaID] = listaEvidencias[i].evidencias;
                        }

                        $scope.setPageMode();
                        $scope.loadSelectedModels();
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


            $scope.maxDate = new Date();
            $scope.comparaData = function () {
                $scope.dataPermitida = false;
                if ($scope.maxDate < $scope.dataAcaoNf.date) {
                    $scope.dataPermitida = false;
                } else {
                    $scope.dataPermitida = true;
                }
            };

            $scope.preparaViewParaStatusMes = function () {
                $scope.statusPeriodo = $stateParams.statusPeriodo;
            };

            $scope.setPageMode = function () {
                $scope.canEdit = $scope.statusPeriodo == 2 || $scope.statusPeriodo == 1;
            };

            $scope.loadSelectedModels = function () {
                if (
                    $scope.modelosIncentivo.length > 0 &&
                    $scope.modelosIncentivoDetalhe.length > 0
                ) {
                    $scope.modelosIncentivoDetalhe.forEach(function (detalhe) {
                        $scope.modelosIncentivo.forEach(function (element) {
                            if (detalhe.veiculoID === element.veiculoID) {
                                element.checked = true;
                            }
                        });
                    });
                }
            };

            $scope.loadEvidencias = function () {
                return $q(function (resolve, reject) {
                    promise = $http.get(
                        rootURL + "v1/evidencias"
                    );
                    promise
                        .then(function (res) {
                            $scope.listEvidencias = res.data;
                            resolve();
                        })
                        .catch(function (err) {
                            sysServicos.sendErrorMsg(
                                err.status,
                                err.statusText,
                                err.config.url
                            );
                        });
                });
            };


            $scope.init = function () {
                $scope.getDealerRole();
                $scope.getDropModeloIncentivo();
                $scope.getDropMidias();
                $scope.loadEvidencias();
                $scope.getDetalheAcao();
                $scope.preparaViewParaStatusMes();
            };
            $scope.init();

            //validacao
            var validate = function (id) {
                var countError = 0;
                var errorFields = [];
                var msgType = 0;

                var ret = true;

                if (id == 1) {
                    if ($scope.acao.documento == "") {
                        ret = false;
                        msgType = 0;
                        errorFields.push("CPF/CNPJ");
                    }
                    if ($scope.acao.fornecedor == "" || $scope.acao.fornecedor == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Fornecedor");
                    }
                    if ($scope.acao.num_NF == "" || $scope.acao.num_NF == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Nº NF");
                    }
                    if (
                        $scope.dataAcaoNf.date == "" ||
                        $scope.dataAcaoNf.date == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Data NF");
                    }
                    if ($scope.dataPermitida == false) {
                        ret = false;
                        msgType = 3;
                        errorFields.push("Data da NF");
                    }
                    if ($scope.acao.valorNF == "" || $scope.acao.valorNF == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Valor NF");
                    }
                    if (
                        $scope.acao.tipoMidiaID == "" ||
                        $scope.acao.tipoMidiaID == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Mídia");
                    }
                    if ($scope.acao.comissao == "" || $scope.acao.comissao == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Tem comissão");
                    }
                    if ($scope.modelosIncentivo.filter(modelo => modelo.checked).length == 0 || $scope.modelosIncentivo.length == 0) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Linha Incentivada");
                    }
                    if (
                        $scope.acao.descricaoServico == "" ||
                        $scope.acao.descricaoServico == undefined
                    ) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Descrição do Serviço");
                    }

                    if ($scope.listEvidencias.length == 0) {
                        ret = false;
                        msgType = 0;
                        errorFields.push("Anexos");
                    }
                    else {
                        let lista = $scope.listEvidencias;
                        for (let i = 0; i < lista.length; i++) {
                            if (lista[i].obrigatorio) {
                                let tipoEvidenciaID = lista[i].tipoEvidenciaID.toString();
                                if (
                                    !$scope.anexosReembolso[tipoEvidenciaID] ||
                                    $scope.anexosReembolso[tipoEvidenciaID].length === 0
                                ) {
                                    ret = false;
                                    msgType = 0;
                                    errorFields.push(lista[i].descricao);
                                }
                            }
                        }
                    }
                }

                if (id == 2) {
                    if (
                        $scope.acao.documento == undefined
                    ) {
                        ret = false;
                        msgType = 2;
                        errorFields.push("CPF/CNPJ");
                    }
                }

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

                if (msgType == 1) {
                    sysServicos.sendWarnMsg("Selecione uma imagem");
                }
                if (msgType == 2) {
                    sysServicos.sendWarnMsg("Informe um CPF/CNPJ válido");
                }
                if (msgType == 3) {
                    sysServicos.sendWarnMsg(
                        "O campo Data da NF não pode ser maior que a data de hoje e deve ser preenchido no formato DD/MM/YYYY"
                    );
                }

                return ret;
            };
        }
    ])

    // tabelas
    // reembolso

     .controller("notasCadastradasTableCntrl", [
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
         "reembolsoService",
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
             applicationService,
             reembolsoService
         ) {
             var totalRows;
             var idFab;

             $scope.statusNota = 0
             $scope.dealerNFID = "";

             $scope.getDealerID = function () {
                 let promise = $http.get(rootURL + 'conta/eu');
                 promise.then(
                     function (ret) {
                         $scope.perfilID = ret.data.perfil.id;
                     }
                 )
             }

             $scope.getDealerID();


              $scope.removeNotas = function (budgetDealerNFID) {
                  let promise = $http.post(rootURL + "v1/nota/" + budgetDealerNFID);
                  promise.then(
                      function (ret) {
                          sysServicos.sendSuccessMsg("Ação apagada com sucesso!");
                          $scope.filtrar();
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


            $scope.novaNota = function () {
            $scope.isLoading = true;
            var objEnvio = $scope.createPostNovaNotaObject();
              reembolsoService
              .postNovaNota(objEnvio)
              .then(function (result) {
                         $scope.isLoading = false;
                         $scope.getNotasRealizadas(
                            $scope.abaActive
                        );
                     }
                 )
            };
        

            $scope.createPostNovaNotaObject = function () {
                var objEnvio = {};

                objEnvio.dealerID = $scope.dealer.dealerID;
                objEnvio.anoFiscal = $scope.filtro.ano;
                objEnvio.mes = $scope.filtro.mes;
                   
                objEnvio.applicationId = $scope.$parent.abaActive;
                objEnvio.userIDStatus = $scope.usuarioLogado.id;

                return objEnvio;
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
                        name: "NúmeroNota",
                        field: "budgetDealerID"
                    },
                     {
                         name: "Dealer",
                         field: "dealer"
                     },
                     {
                         name: "ValorSolicitadoBruto",
                         field: "valorSolicitadoBruto",
                         cellFilter: "currency"
                     },
                     {
                         name: "ValorAprovadoLiquido",
                         field: "valorAprovadoLiquido",
                        cellFilter: "currency"
                     },
                     {
                         name: "Status",
                         field: "statusNf",
                     },
                      {
                          //botao editar
                          name: "Ações",
                          width: 90,
                          enableFiltering: false,
                          cellTemplate:
                                '<button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.$parent.selecionarNota(row.entity.budgetDealerID, row.entity.status)"><i class="fa fa-eye font-18"></i></button>',
                          cellClass: "text-right"
                      }
                 ]
             };

             $scope.getNotasRealizadas = function (aba) {
                 var promise = $http.post(
                     rootURL + "v1/budgetDealers",
                     $scope.$parent.buildObjEnvio(aba)
                 );
                 promise.then(
                     function (ret) {
                         $scope.gridOptions1.data = ret.data;
                         $scope.notasRealizadas = ret.data;
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
             };

             $scope.toggleFiltering = function () {
                 $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
                     .enableFiltering;
                 $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
             };

             $scope.filter = function () {
                 $scope.gridApi.grid.refresh();
             };
         }
     ])

    .controller("acoesRealizadasTableCntrl", [
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

            $scope.statusNota = 0;
            $scope.dealerNFID = "";
            $scope.getDealerID = function () {
                let promise = $http.get(rootURL + 'conta/eu');
                promise.then(
                    function (ret) {
                        $scope.perfilID = ret.data.perfil.id;
                    }
                )
            }

            $scope.getDealerID();

            $scope.viewAcao = function (budgetId, aplication, id) {
                var stateParams = {
                    budgetId: budgetId,
                    applicationId: aplication,
                    currentId: id
                };

                $state.go("reembolsoAcaoDet", stateParams);
            };
            $scope.deleteAcaoModal = function (budgetDealerNFID) {
                abreModal("#modalExcluirAcao", "mfp-sign");
                $rootScope.dealerNFID = budgetDealerNFID;
            };

            $scope.removeAcao = function (budgetDealerNFID) {
                let promise = $http.post(rootURL + "v1/nota/" + budgetDealerNFID);
                promise.then(
                    function (ret) {
                        sysServicos.sendSuccessMsg("Ação apagada com sucesso!");
                        $scope.filtrar();
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
                        name: "Mês",
                        field: "mes"
                    },
                    {
                        name: "Data",
                        field: "data",
                        cellFilter: "date:'dd/MM/yyyy - HH.mm'",
                        filterCellFiltered: true
                    },
                    {
                        name: "Fornecedor",
                        field: "fornecedor"
                    },
                    {
                        name: "Mídia",
                        field: "midia"
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
                        name: "NotaStatus",
                        field: "nota.status"
                    },
                    {
                        //botao editar
                        name: "Ações",
                        width: 90,
                        enableFiltering: false,
                        cellTemplate:
                            '<button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.viewAcao(row.entity.budgetDealerID, row.entity.applicationId, row.entity.budgetDealerNFID)"><i class="fa fa-eye font-18"></i></button><button ng-show="grid.appScope.perfilID == row.entity.roleId" ng-if="row.entity.status == \'Pendente\' || row.entity.status == \'Inconsistente\' " class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.removeAcao(row.entity.budgetDealerNFID)" ><i class="fas fa-trash"></i></button>',
                        cellClass: "text-right"
                    }
                ]
            };

            $scope.getAcoesRealizadas = function (aba, budgetDealerID) {
                var promise = $http.post(
                    rootURL + "v1/acoes",
                    $scope.$parent.buildObjEnvio(aba, budgetDealerID)
                );
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.acoesRealizadas = ret.data;
                        $scope.hideGrid = false;
                        console.log($scope.statusNota);
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
            };

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1
                    .enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };
        }
    ])

    .controller("acoesExcluidasTableCntrl", [
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

            $scope.dealerNFID = "";

            $scope.getDealerID = function () {
                let promise = $http.get(rootURL + 'conta/eu');
                promise.then(
                    function (ret) {
                        $scope.perfilID = ret.data.perfil.id;
                    }
                )
            }

            $scope.getDealerID();

            $scope.viewAcao = function (budgetId, aplication, id) {
                var stateParams = {
                    budgetId: budgetId,
                    applicationId: aplication,
                    currentId: id
                };
                
                $state.go("reembolsoAcaoDet", stateParams);
            };

            $scope.deleteAcaoModal = function (budgetDealerNFID) {
                abreModal("#modalExcluirAcao", "mfp-sign");
                $rootScope.dealerNFID = budgetDealerNFID;
            };

            $scope.retornaAcao = function (budgetDealerNFID) {
                let promise = $http.post(rootURL + "v1/notaretorna/" + budgetDealerNFID);
                promise.then(
                    function (ret) {
                        sysServicos.sendSuccessMsg("Ação retornada com sucesso!");
                        $scope.filtrar();
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
                        name: "Mês",
                        field: "mes"
                    },
                    {
                        name: "Data",
                        field: "data",
                        cellFilter: "date:'dd/MM/yyyy - HH.mm'",
                        filterCellFiltered: true
                    },
                    {
                        name: "Fornecedor",
                        field: "fornecedor"
                    },
                    {
                        name: "Mídia",
                        field: "midia"
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
                    },
                    {
                        //botao editar
                        name: "Ações",
                        width: 90,
                        enableFiltering: false,
                        cellTemplate:
                            '<button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.viewAcao(row.entity.budgetDealerID, row.entity.applicationId, row.entity.budgetDealerNFID)"><i class="fa fa-eye font-18"></i></button><button ng-show="grid.appScope.perfilID == row.entity.roleId" ng-if="grid.appScope.verba.status == 1 || grid.appScope.verba.status == 2" class="btn see-detail btn-table" type="button" title="Retorna Ação" ng-click="grid.appScope.retornaAcao(row.entity.budgetDealerNFID)" ><i class="fa fa-reply"></i></button>',
                        cellClass: "text-right"
                    }
                ]
            };

            $scope.getAcoesExcluidas = function (aba) {
                var promise = $http.post(
                    rootURL + "v1/acoesexcluidas",
                    $scope.$parent.buildObjEnvio(aba)
                );
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.acoesRealizadas = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        // setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
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
        }
    ])


    .controller("etapasTableCntrl", [
        "$scope",
        "$http",
        "uiGridConstants",
        "$cookieStore",
        "sysServicos",
        "$interval",
        "$stateParams",
        "$timeout",
        "$state",
        "$rootScope",
        "applicationService",
        function (
            $scope,
            $http,
            uiGridConstants,
            $cookieStore,
            sysServicos,
            $interval,
            $stateParams,
            $timeout,
            $state,
            $rootScope,
            applicationService
        ) {
            var totalRows;
            var idFab;

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
                        name: "Mês",
                        field: "mes"
                    },
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

            $scope.getEtapas = function (aba) {
                var promise = $http.post(
                    rootURL + "v1/etapas",
                    $scope.$parent.buildObjEnvio(aba)
                );
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        // setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
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
        }
    ])

    .controller("atencaoTableCntrl", [
        "$scope",
        "$http",
        "uiGridConstants",
        "sysServicos",
        "$interval",
        "$stateParams",
        "$timeout",
        "$state",
        "$rootScope",
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
            applicationService
        ) {
            var totalRows;
            var idFab;

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
                        name: "Mês",
                        field: "mes"
                    },
                    {
                        name: "Data/Hora",
                        field: "data",
                        cellFilter: "date:'dd/MM/yyyy - HH.mm'",
                        filterCellFiltered: true
                    },
                    {
                        name: "Fornecedor",
                        field: "fornecedor"
                    },
                    {
                        name: "Número NF",
                        field: "num_NF"
                    },
                    {
                        name: "Motivo",
                        field: "motivo"
                    }
                ]
            };

            $scope.getAtencao = function (aba) {
                var promise = $http.post(
                    rootURL + "v1/atencao",
                    $scope.$parent.buildObjEnvio(aba)
                );
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        // setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
                        $interval(
                            function () {
                                $scope.gridApi.core.handleWindowResize();
                            },
                            500,
                            5
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

            function setTableHeight(rows) {
                if (rows >= $scope.gridOptions1.paginationPageSize) {
                    angular
                        .element(document.getElementsByClassName("grid")[2])
                        .css(
                            "min-height",
                            ($scope.gridOptions1.paginationPageSize + 1) *
                            $scope.gridOptions1.rowHeight +
                            56 +
                            "px"
                        );
                } else {
                    angular
                        .element(document.getElementsByClassName("grid")[2])
                        .css(
                            "min-height",
                            (rows + 1) * $scope.gridOptions1.rowHeight + 56 + "px"
                        );
                }
            }
        }
    ])


    .controller("inconsistenciaAcaoTableCntrl", [
        "$scope",
        "$http",
        "uiGridConstants",
        "sysServicos",
        "$interval",
        "$stateParams",
        "$timeout",
        "$state",
        "$rootScope",
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
            applicationService
        ) {
            var totalRows;
            var idFab;

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
                        name: "Usuário",
                        field: "userName"
                    },
                    {
                        name: "Data/Hora",
                        field: "dataAuditoria",
                        cellFilter: "date:'dd/MM/yyyy - HH.mm'",
                        filterCellFiltered: true
                    },
                    //{ name: 'Tipo da inconsistência', field: 'inconsistenciaTipo', },
                    {
                        name: "Motivo",
                        field: "motivo"
                    }
                ]
            };

            $scope.getInconAcao = function (acaoId) {
                var promise = $http.get(
                    rootURL + "v1/inconsistenciasPorAcao/" + acaoId
                );
                //promise = $http.get(rootJson + 'reembolso/etapas.json');
                promise.then(
                    function (ret) {
                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;

                        totalRows = $scope.gridOptions1.data.length;
                        // setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
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
        }
    ]);
