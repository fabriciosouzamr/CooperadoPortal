angular.module('relatoriosModule', [])
    .controller('relatoriosController', ['$scope', '$http', '$rootScope', 'sysServicos', '$q',
        function ($scope, $http, $rootScope, sysServicos, $q) {
            $scope.relatorios = {
                "solicitacao-reembolso": {
                    nome: "Solicitação de reembolso",
                    url: "relatorio/solicitacao-reembolso",
                    campos: {
                        "anoFiscal": {
                            visivel: true,
                            obrigatorio: false
                        },
                        "periodoDe": {
                            visivel: true,
                            obrigatorio: false
                        },
                        "periodoAte": {
                            visivel: true,
                            obrigatorio: false
                        }
                    }
                }
            };

            $scope.getMonths = function () {
                return $q(function (resolve, reject) {
                    $http({
                        method: 'GET',
                        url: rootURL + "periodo/meses",
                        params: { anoFiscal: $scope.anoFiscal }
                    }).then(
                        function (response) {
                            $scope.meses = response.data;
                            resolve();
                        },
                        function (response) {
                            reject(response);
                        }
                    );
                });
            };

            $scope.getYears = function () {
                return $q(function (resolve, reject) {
                    $http.get(rootURL + "periodo/anos")
                        .then(
                            function (response) {
                                $scope.anos = response.data;
                                resolve();
                            },
                            function (response) {
                                reject(response);
                            }
                        );
                });
            };

            $scope.reportExport = function () {
                let promise = $http.get(rootURL + $scope.relatorios[$scope.tiposRelatorio].url,
                    {
                        responseType: "arraybuffer",
                        headers: {
                            "Content-type": "application/json",
                            Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        },
                        params: {
                            anoFiscal: $scope.anoFiscal,
                            mesInicio: $scope.periodoDe,
                            mesFim: $scope.periodoAte
                        },
                    });
                promise.then(
                    function (ret) {
                        var blob = new Blob([ret.data], {
                            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        });
                        saveAs(blob, "Relatório Solicitação de Reembolso.xlsx");
                    },
                    function (error) {
                        if (error.status == 400 || error.status == -1) {
                            sysServicos.sendWarnMsg('Este filtro não possuí dados para serem exportados.')
                        }
                    }
                );
            };

            $scope.limpar = function () {
                $scope.anoFiscal = null;
                $scope.periodoDe = null;
                $scope.periodoAte = null;
            }

            $scope.init = function () {
                $scope.getYears()
                    .then($scope.getMonths);
            }

            $scope.init();
        }

    ])
