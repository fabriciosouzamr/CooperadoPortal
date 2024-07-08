angular
  .module("planoMidiaModule", [])
  .controller("planoMidiaController", [
    "$scope",
    "$http",
    "$rootScope",
    "sysServicos",
    "$cookieStore",
    "$state",
    "Upload",
    "$timeout",
    "$stateParams",
    "$q",
    "planoMidiaService",
    "manipulaString",
    "uiGridConstants",
    function (
      $scope,
      $http,
      $rootScope,
      sysServicos,
      $cookieStore,
      $state,
      Upload,
      $timeout,
      $stateParams,
      $q,
      planoMidiaService,
      manipulaString,
      uiGridConstants
    ) {
      var prazo;
      $scope.filtro = {};
      $scope.anoFiscal = [];
      $scope.periodos = [];
      $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
      $scope.dealer = $cookieStore.get("dealerUsuario");
        
      $scope.filter = function () {

        if( $scope.usuarioLogado.perfil = "Administrador"){
            $scope.$$childHead.getPlanoLista($scope.filtro.dealerID);
        }else{
            $scope.$$childHead.getPlanoLista($scope.dealer.dealerID);
        }

      };

      // upload novaMidia e novaMidiaArquivo
      $scope.uploadFiles = function (files, errFiles) {
        var _objEnvio = {};
        _objEnvio.AnoFiscal = $scope.filtro.ano
        _objEnvio.periodo = $scope.filtro.periodo
        if( $scope.usuarioLogado.perfil = "Administrador"){
            _objEnvio.dealerId = $scope.filtro.dealerID
        }else{
            _objEnvio.dealerId = $scope.dealer.dealerID
        }
        var planoMidiaID = 0;

        planoMidiaService.postNovaMidia(_objEnvio)
        .then(function (result) {

          planoMidiaID = result.data.result;
          if(planoMidiaID == 0){
            sysServicos.sendErrorMsg(
              400,
              '',
              result.url,
              result.data.message
            );
            return false;
          }
            
          var error = errFiles[0];
          var box = 0;
          if (error && error.$error === "maxSize")
              sysServicos.sendWarnMsg(`O tamanho máximo para anexo permitido é de ${error.$errorParam}.`);
  
            var file = files[0];
            var nameFile = manipulaString.removeEspecialCaracteres(file.name);

            if (!files[box]) {
                files[box] = [];
            }
            if (!errFiles[box]) {
                errFiles[box] = [];
            }

            files[box] = files;
            errFiles[box] = errFiles;
              
            file.upload = Upload.upload({
                method: "POST",
                url: rootURL + "v2/enviar/planoMidia",
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
                        item.PlanoMidiaID = planoMidiaID;
                        var planoMidiaUploadID = planoMidiaService.postNovoPlanoMidiaUpload(item).then(
                            function (retorno) {
                            sysServicos.sendSuccessMsg("Arquivo enviado com sucesso");
                            window.location.reload();
                            }
                        );
                    
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

            //recarregar lista aqui
            
        });
      }



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

      $scope.changeAno = function () {
        $scope
            .dropPeriodos()
            .catch(function (err) {
                sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
            });
      }
      $scope.getDealers = function () {
        let promise = $http.get(rootURL + 'dealer/consultar');
        promise.then(
          function (ret) {
            $scope.dealers = ret.data;
            $scope.filtro.dealerID = ret.data[0].dealerID;
            $scope.$$childHead.getPlanoLista($scope.filtro.dealerID);
          }
        )
      };

      $scope
      .dropAnoFiscal()
      .then(function (res) {
          return $scope.dropPeriodos();
      })
      .then(function (res) {
          return $scope.getDealers();
      })
      


      $scope.reportExport = function () { 
        let promise = $http.get(rootURL + "v1/exportarPlanoMidiaPorDealer/" + $scope.filtro.dealerID,
            {
                responseType: "arraybuffer",
                headers: {
                    "Content-type": "application/json",
                    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                },
            });
        promise.then(
            function (ret) {
                var blob = new Blob([ret.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                saveAs(blob, "RelatorioPlanoMidia.xlsx");
            },
            function (error) {
                if (error.status == 400 || error.status == -1) {
                    sysServicos.sendWarnMsg('Sem dados para serem exportados.')
                }
            }
        );
    };


    }
])
.controller("planosTableCntrl", [
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
  "planoMidiaService",
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
      planoMidiaService,
      applicationService
  ) {
      var totalRows;
      var idFab;
      $scope.usuarioLogado = $cookieStore.get("perfilUsuario");
      $scope.getDealerID = function () {
          let promise = $http.get(rootURL + 'conta/eu');
          promise.then(
              function (ret) {
                  $scope.perfilID = ret.data.perfil.id;
              }
          )
      }

      $scope.getDealerID();

      $scope.removePlanoMidia = function (planoMidiaID) {
        
        if($scope.usuarioLogado.perfil == "Administrador"){
            sysServicos.sendErrorMsg(
                401,
                "",
                ""
            );
            return;
        }


          let promise = $http.get(rootURL + "v1/inativarPlanoMidia/" + planoMidiaID);
          promise.then(
              function (ret) {
                  sysServicos.sendSuccessMsg("Plano apagado com sucesso!");
                  $scope.$parent.filter();
                  //recarregar lista aqui
                    // if( $scope.usuarioLogado.perfil = "Administrador"){
                    //     $scope.$$childHead.getPlanoLista($scope.filtro.dealerID);
                    // }else{
                    //     $scope.$$childHead.getPlanoLista($scope.dealer.dealerID);
                    // }
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
                  name: "Dealer",
                  field: "dealer_Base.nomeFantasia"
              },
              {
                  name: "Data",
                  field: "dataCadastro",
                  cellFilter: "date:'dd/MM/yyyy - HH.mm'",
                  filterCellFiltered: true
              },
              {
                  name: "Ano",
                  field: "anoFiscal"
              },
              {
                  name: "Trimestre",
                  field: "periodoFormatado"
              }, 
              {
                  name: "Usuário",
                  field: "usuario.name"
              }, 
              {
                  //botao editar
                  name: "Ações",
                  width: 90,
                  enableFiltering: false,
                  cellTemplate:
                        ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.pdf\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-pdf-o font-18"></i></a> '
                    +   ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.xlsx\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-excel-o font-18"></i></a> '
                    +   ' <a ng-if="row.entity.planoMidiaUpload.url.includes(\'.jpg\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-image-o font-18"></i></a> '
                    +   ' <a ng-if="!row.entity.planoMidiaUpload.url.includes(\'.pdf\') && !row.entity.planoMidiaUpload.url.includes(\'.xlsx\') && !row.entity.planoMidiaUpload.url.includes(\'.jpg\')"  href="{{row.entity.planoMidiaUpload.url}}" target="_blank"><i class="fa fa-file-image-o font-18"></i></a> '
                    +   ' <button class="btn see-detail btn-table" type="button" title="Detalhes" ng-click="grid.appScope.removePlanoMidia(row.entity.planoMidiaID)" ><i style="color: red !important;" class="fas fa-trash"></i></button>',
                  cellClass: "text-right"
              }
          ]
      };

    //   console.log( $scope.$parent.filtro);
      
      $scope.getPlanoLista = function (dealerIDFiltrado) {
        var caminho = ""
        $scope.dealer = $cookieStore.get("dealerUsuario");
        // console.log(dealerIDFiltrado);
        var dealerID = 0;
        if($scope.usuarioLogado.perfil == "Administrador"){
            
            dealerID = dealerIDFiltrado;
        }
        else{
            dealerID = $scope.dealer.dealerID;
        }
        var promise = $http.get(
            rootURL + "v1/buscarPlanoMidiaPorDealer/"+ dealerID
        );
        promise.then(
              function (ret) {
                  $scope.gridOptions1.data = ret.data.result;
                  $scope.acoesRealizadas = ret.data;
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
        }
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