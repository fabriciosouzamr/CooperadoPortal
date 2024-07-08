angular
  .module("regulamentoModule", [])

  .controller("regulamentoController", [
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
        $scope.pdffile = null;
        $scope.regulamentoName = null;

        $scope.usuarioLogado = $cookieStore.get("perfilUsuario");

        $scope.getRegulamentos = function(){
            let promise = $http.get(rootURL + "regulamento/todos");
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
        }

        if($scope.usuarioLogado.perfil == 'Administrador'){
            $scope.perfil = 1;
        }else{
            $scope.perfil = 2;
        }

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
    
            rowHeight: 42,
    
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
                name: "Data de Criação",
                field: "data",
                cellFilter: "date:'dd/MM/yyyy'"
              },
              {
                name: "Título",
                field: "titulo"
              },
              
              {
                name: "Ações",
                width: 100,
                enableFiltering: false,
                cellTemplate:
                  '<button class="btn-auditar" type="button" title="Ver Regulamento" ng-click="grid.appScope.seeRegulamento(row.entity.url)"><i class="fas fa-search" font-18></i></button><button ng-show="grid.appScope.perfil == 1" class="btn-auditar" type="button" title="Excluir Regulamento" ng-click="grid.appScope.deleteRegulamento(row.entity.regulamentoID)"><i class="fas fa-trash" font-18></i></button>',
                cellClass: "text-right"
              }
            ]
        };

        $scope.seeRegulamento = function(url) {
            window.open(url, "_blank");
        };

        $scope.deleteRegulamento = function(regulamentoID) {
            let promise = $http.delete(rootURL + "regulamento/" + regulamentoID + "/excluir");
    
            promise.then(
              function(response) {
                sysServicos.sendSuccessMsg("Regulamento apagado com sucesso.");
                $scope.getRegulamentos();
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

        function setTableHeight(rows) {
            if (rows >= $scope.gridOptions1.paginationPageSize) {
                angular.element(document.getElementsByClassName('grid')[0]).css('min-height', (($scope.gridOptions1.paginationPageSize + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
            } else {
                angular.element(document.getElementsByClassName('grid')[0]).css('min-height', ((rows + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
            }
        }

        $scope.uploadFiles = function(files, errFiles) {
            angular.forEach(files, function(file) {
              var ext = file.name.substr(file.name.lastIndexOf(".") + 1);
              if (verifyFileExt(ext)) {
                $scope.files = files;
                $scope.errFiles = errFiles;
    
                file.upload = Upload.upload({
                  method: "POST",
                  url: rootURL + "v2/enviar/regulamento",
                  data: { files: file }
                });
    
                file.upload.then(
                  function(response) {
                    $scope.pdffile = response.data.result.filesUploaded[0];
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
                  "O arquivo deve ser em formato de (PDF)."
                );
              }
              //verifica qual a ext do arquivo de upload
              function verifyFileExt(ext) {
                var extArray = ["pdf"];
    
                for (var n = 0; n < extArray.length; n++) {
                  if (extArray[n].toUpperCase() == ext.toUpperCase()) {
                    return true;
                  }
                }
                return false;
              }
            });
        };

        $scope.saveRegulamento = function () {
            if (!$scope.regulamentoName) {
                sysServicos.sendWarnMsg("Informe o Nome do regulamento.");
                return;
            }
            if (!$scope.pdffile) {
                sysServicos.sendWarnMsg("Informe o Anexo do regulamento.");
                return;
            }

            var objEnvio = {};
            objEnvio.data = new Date().toISOString();
            objEnvio.titulo = $scope.regulamentoName;
            objEnvio.descricao = $scope.regulamentoName;
            objEnvio.url = $scope.pdffile;

            let promise = $http.post(rootURL + 'regulamento/inserir', objEnvio);
            promise.then(
                function(ret){
                    sysServicos.sendSuccessMsg("Regulamento cadastrado com sucesso!");
                    $scope.regulamentoName = '';
                    $scope.pdffile= '';
                    $scope.getRegulamentos();
                },function(err){
                    sysServicos.sendErrorMsg(
                        err.status,
                        err.statusText,
                        err.url,
                        err.data.message
                      );
                }
            )
        }

        $scope.init = function(){
            $scope.getRegulamentos();
        }
      
        $scope.init();
    }
  ]);