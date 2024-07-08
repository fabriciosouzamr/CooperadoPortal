angular
  .module("cadastrosDealerModule", [])

  .controller("cadastrosDealerController", [
    "$scope",
    "$http",
    "$state",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    "$stateParams",
    function(
      $scope,
      $http,
      $state,
      $rootScope,
      sysServicos,
      $cookieStore,
      $stateParams
    ) {
      console.log(" >>> init cadastrosDealerController", $stateParams);
      $scope.dealer = {};

      $scope.salvarClickHandler = function() {
        console.log("onclick voltar >>");
      };
      $scope.voltarClickHandler = function() {
        console.log("onclick voltar >>");
        $state.go("cadastros", { aba: "dealer" });
      };
    }
  ]);
