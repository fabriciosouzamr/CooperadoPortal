angular
  .module("gestaoNoticiasModule", [])

  .controller("gestaoNoticiasController", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    "$state",
    "$stateParams",
    "$q",
    "uiGridConstants",
    "Upload",
    function(
      $scope,
      $http,
      $rootScope,
      sysServicos,
      $cookieStore,
      $state,
      $stateParams,
      $q,
      uiGridConstants,
      Upload
    ) {
      $scope.addNews = false;

      $scope.showForm = function() {
        if ($scope.addNews == false) {
          $scope.addNews = true;
        } else {
          $scope.addNews = false;
          $scope.newsTitle = "";
          $scope.newsDescription = "";
          $scope.addNews = false;
        }
      };

      $scope.createNews = function() {
        var objEnvio = {};
        objEnvio.data = new Date();
        objEnvio.noticiaAssuntoID = 1;
        objEnvio.chapeu = "Toyota Mídia Cooperada - Notícias";
        objEnvio.titulo = $scope.newsTitle;
        objEnvio.descricao = $scope.newsDescription;

        let promise = $http.post(rootURL + "noticia/inserir", objEnvio);
        promise.then(
          function(ret) {
            sysServicos.sendSuccessMsg("Notícia criada com sucesso.");
            $scope.getAllNotices();
            $scope.newsTitle = "";
            $scope.newsDescription = "";
            $scope.addNews = false;
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url,
              err.data.message
            );
          }
        );
      };

      $scope.getAllNotices = function() {
        let promise = $http.get(rootURL + "noticia/todas");
        promise.then(
          function(ret) {
            $scope.gridOptions1.data = ret.data;
            $scope.acoesRealizadas = ret.data;
            $scope.hideGrid = false;

            totalRows = $scope.gridOptions1.data.length;
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url,
              err.data.message
            );
          }
        );
      };

      $scope.hideGrid = true;

      function rowTemplate() {
        return (
          "<div ng-class=\"{ 'inactiveRow': grid.appScope.rowFormatter( row ) }\">" +
          '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
          "</div>"
        );
      }

      $scope.rowFormatter = function(row) {
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

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //recebe numero do ato quando selecionado
          gridApi.selection.on.rowSelectionChanged($scope, function(row) {});

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions1.paginationPageSize = pageSize;
            // setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Título",
            field: "titulo"
          },
          {
            name: "Descrição",
            field: "descricao",
            width: 500
          },
          {
            name: "Data de Criação",
            field: "data",
            cellFilter: "date:'dd/MM/yyyy'"
          },
          {
            name: "Ações",
            width: 100,
            enableFiltering: false,
            cellTemplate:
              '<button class="btn-auditar" type="button" title="Reativar" ng-hide="row.entity.ativo" ng-click="grid.appScope.ativarNoticia(row.entity.noticiaId)"><i class="fas fa-undo" font-18></i></button>' +
              '<button class="btn-auditar" type="button" title="Inativar" ng-show="row.entity.ativo" ng-click="grid.appScope.inativarNoticia(row.entity.noticiaId)"><i class="fas fa-trash" font-18></i></button>' +
              '<button  class="btn-auditar" type="button" title="Reenviar notificação" ng-click="grid.appScope.resendEmail(row.entity.noticiaId)"><i class="fa fa-envelope" font-18></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      $scope.ativarNoticia = function(noticiaId) {
        $http.post(rootURL + "noticia/" + noticiaId + "/ativar")
          .then(
            function(response) {
              sysServicos.sendSuccessMsg("Notícia reativada com sucesso!");
              $scope.getAllNotices();
            },
            function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.config.url,
                response.data.message
              );
            }
          );
      };

      $scope.inativarNoticia = function(noticiaId) {
        $http.post(rootURL + "noticia/" + noticiaId + "/inativar")
          .then(
            function(response) {
              sysServicos.sendSuccessMsg("Notícia inativada com sucesso!");
              $scope.getAllNotices();
            },
            function(response) {
              sysServicos.sendErrorMsg(
                response.status,
                response.statusText,
                response.config.url,
                response.data.message
              );
            }
          );
      };

      $scope.resendEmail = function(noticiaId) {
        let promise = $http.post(
          rootURL + "noticia/" + noticiaId + "/reenviar"
        );

        promise.then(
          function(response) {
            sysServicos.sendSuccessMsg("Reenviado e-mail de notificação aos Dealers e Agência(s).");
            $scope.getAllNotices();
          },
          function(err) {
            sysServicos.sendErrorMsg(
              err.status,
              err.statusText,
              err.config.url,
              err.data.message
            );
          }
        );
      };
      $scope.init = function() {
        $scope.getAllNotices();
      };

      $scope.init();
    }
  ]);
