var app = angular.module("sysMaster", [
    "oc.lazyLoad",
    "ngNotify",
    "loader",
    "ui.router",
    "ngResource",
    "ngAnimate",
    "ngCookies",
    "ngAria",
    "ngMessages",
    "angularMoment",
    "ngSanitize",
    "ui.grid",
    'ui.grid.treeView',
    "ui.grid.pagination",
    "ui.grid.autoResize",
    "ui.grid.resizeColumns",
    "ui.grid.moveColumns",
    "ui.grid.selection",
    "ngMaterial",
    "ncy-angular-breadcrumb",
    "ngMask",
    "ui.utils.masks",
    "Authentication",
    "ngFileUpload",
    "ngTagsInput",
    "ng.deviceDetector",
    "textAngular",
    'mwl.calendar',
    "checklist-model"
]).constant('anexosReembolso', {
  F: 'fiscal',
  A: 'autorizações',
  E:'evidências',
  O:'outros'
}).constant('applicationId', {
  'toyota/midia50': '01e4d121-0c9a-422b-a5c3-aa6ad2de9234',
  'toyota/midia100': '565a319a-71a0-40f1-a860-c007ae86dc56',
  'lexus/midia50':'cffa3A0c-c1f3-4dd3-8256-dc29a12b21b4',
  'lexus/midia100':'8053b030-bb15-4caf-b552-843b53d33b4f'
});

//inicia scripts
app.run([
  "$http",
  "$rootScope",
  "$cookieStore",
  function($http, $rootScope, $cookieStore) {
    $rootScope.globals = $cookieStore.get("globals");

    //verifica se o cookie de autenticacao existe
    if ($rootScope.globals === null) {
      //if ($rootScope.globals != null) {
      window.open(rootURLInter, "_self");
    } else {
      $http.defaults.headers.common["Authorization"] =
        "Bearer " + $rootScope.globals[0].access_token;
    }
  }
]);
