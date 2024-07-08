angular
  .module("gestaoBannersModule", [])

  .controller("gestaoBannersController", [
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
      $scope.getAllbanners = function() {
        console.log("Chamou a função");
        let promise = $http.get(rootURL + "banner/todos");
        promise.then(
          function(response) {
            $scope.gridOptions1.data = response.data;
            $scope.hideGrid = false;
            totalRows = $scope.gridOptions1.data.length;
            setTableHeight(totalRows);
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

      $scope.uploadFiles = function(files, errFiles) {        
        angular.forEach(files, function(file) {
          var ext = file.name.substr(file.name.lastIndexOf(".") + 1);
          if (verifyFileExt(ext)) {
            $scope.files = files;
            $scope.errFiles = errFiles;

            file.upload = Upload.upload({
              method: "POST",
              url: rootURL + "v2/enviar/banner",
              data: { files: file }
            });

            file.upload.then(
              function(response) {
                $scope.previsualizacao = response.data.result.filesUploaded[0];
                sysServicos.sendSuccessMsg("Arquivo enviado com sucesso");
              },
              function(response) {
                if (response.status > 0)
                  $scope.errorMsg = response.status + ": " + response.data;

                sysServicos.sendErrorMsg(
                  response.status,
                  response.statusText,
                  response.url,
                  response.data.message
                );
              },
              function(evt) {
                file.progress = Math.min(
                  100,
                  parseInt((100.0 * evt.loaded) / evt.total)
                );
              }
            );
          } else {
            sysServicos.sendWarnMsg(
              "O arquivo deve ser em formato de imagem (JPG ou PNG)."
            );
          }
          //verifica qual a ext do arquivo de upload
          function verifyFileExt(ext) {
            var extArray = ["jpg", "png"];

            for (var n = 0; n < extArray.length; n++) {
              if (extArray[n].toUpperCase() == ext.toUpperCase()) {
                return true;
              }
            }
            return false;
          }
        });
      };

      $scope.gridOptions1 = {
        enableFiltering: false,

        paginationPageSizes: [10, 25, 50, 75],
        paginationPageSize: 10,

        enableHorizontalScrollbar: 2,
        enableVerticalScrollbar: 2,

        enableRowSelection: false,
        enableSelectAll: false,
        enableRowHeaderSelection: false,

        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: false,

        enableGridMenu: false,

        rowHeight: 32,

        // rowTemplate: rowTemplate(),

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.gridApi.selection.clearSelectedRows();
          $scope.gridApi.core.notifyDataChange(
            uiGridConstants.dataChange.OPTIONS
          );

          //evento de mudanca da qtde de registros visiveis na tabela
          gridApi.pagination.on.paginationChanged($scope, function(
            newPage,
            pageSize
          ) {
            $scope.gridOptions.paginationPageSize = pageSize;
            setTableHeight(totalRows);
          });
        },

        columnDefs: [
          {
            name: "Nome do Banner",
            field: "titulo"
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
              '<button class="btn-auditar" type="button" title="Ver Banner" ng-click="grid.appScope.seeBanner(row.entity.url)"><i class="fas fa-search" font-18></i></button><button  class="btn-auditar" type="button" title="Excluir Banner" ng-click="grid.appScope.deleteBanner(row.entity.bannerID)"><i class="fas fa-trash" font-18></i></button>',
            cellClass: "text-right"
          }
        ]
      };

      $scope.disliked = function() {
        $scope.previsualizacao = "";
      };

      $scope.liked = function() {
        var objEnvio = {};
        objEnvio.data = new Date();
        objEnvio.titulo = $scope.bannerName;
        objEnvio.url = $scope.previsualizacao;

        let promise = $http.post(rootURL + "banner/inserir", objEnvio);
        promise.then(
          function(ret) {
            sysServicos.sendSuccessMsg("Banner adicionado com sucesso.");
            $scope.getAllbanners();
            $scope.bannerName = "";
            $scope.previsualizacao = "";
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

      $scope.deleteBanner = function(bannerID) {
        console.log(bannerID);
        let promise = $http.delete(rootURL + "banner/" + bannerID + "/excluir");

        promise.then(
          function(response) {
            sysServicos.sendSuccessMsg("Banner apagado com sucesso.");
            $scope.getAllbanners();
            $scope.bannerName = "";
            $scope.previsualizacao = "";
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

      $scope.seeBanner = function(url) {
        window.open(url, "_blank");
      };

      $scope.init = function() {
        $scope.getAllbanners();
      };

      $scope.init();
    }
  ]);
