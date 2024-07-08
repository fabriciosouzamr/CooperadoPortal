angular
  .module("gestaoPrazosModule", [])

  .controller("gestaoPrazosController", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    "$state",
    "$stateParams",
    "$q",
    "uiGridConstants",
    function (
      $scope,
      $http,
      $rootScope,
      sysServicos,
      $cookieStore,
      $state,
      $stateParams,
      $q,
      uiGridConstants
    ) {
      var prazo;
      $scope.filtro = {};

      $scope.dropMeses = function() {
        return $q(function(resolve, reject) {
          $http({
            method: 'GET',
            url: rootURL + "periodo/meses",
            params: {anoFiscal: $scope.filtro.anoFiscal}
          }).then(
            function(response) {
              $scope.meses = response.data;
              $scope.filtro.mes = response.data.find(mes => mes.atual).mesId;
              resolve();
            },
            function(response) {
              reject(response);
            }
          );
        });
      };

      $scope.getAnos = function() {
        return $q(function(resolve, reject) {
          $http.get(rootURL + "periodo/anos")
            .then(
              function(response) {
                $scope.anos = response.data;
                $scope.filtro.anoFiscal = response.data.find(ano => ano.atual).anoFiscal;
                resolve();
              },
              function(response) {
                reject(response);
              }
            );
        });
      };

      $scope.getDealers = function () {
        let promise = $http.get(rootURL + 'dealer/consultar');
        promise.then(
          function (ret) {
            $scope.dealers = ret.data;
            $scope.filtro.dealer = '0';
          }
        )
      };

      $scope.getPeriodo = function() {
        var url = rootURL + 'periodo/prazo';
        var params = {
          anoFiscal: $scope.filtro.anoFiscal,
          mes: $scope.filtro.mes,
          dealerId: $scope.filtro.dealer
        };

        $http.get(url, { params }).then(
          function (response) {
            if (response.data.length > 0){
                prazo = response.data[0];
                $scope.dataLimite = prazo.dataLimite == null ? null : moment(prazo.dataLimite).toDate();
            }
            else
                $scope.dataLimite = null;
          },
          function (response) {
            sysServicos.sendErrorMsg(
              response.status,
              response.statusText,
              response.config.url,
              response.data.message
            );
          }
        );
      }

      $scope.salvar = function() {
        if (!$scope.dataLimite) {
          sysServicos.sendWarnMsg("Digite a data limite.");
          return;
        }

        var url = rootURL + 'periodo/prazo/alterar';
        var body = { 
            anoFiscal: $scope.filtro.anoFiscal,
            mes: $scope.filtro.mes,
            dealerID: $scope.filtro.dealer,
            dataLimite: $scope.dataLimite.toISOString()
        };
        
        $http.post(url, body)
          .then(function (resultado) {
            sysServicos.sendSuccessMsg('Data limite atualizada com sucesso');
          });
      }

      $scope.getAnos()
        .then($scope.dropMeses)
        .then($scope.getPeriodo);
      $scope.getDealers();
    }
  ]);