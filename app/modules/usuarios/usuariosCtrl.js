angular.module('usuariosModule', [])
    .controller('usuariosController', ['$scope', '$http', '$rootScope', 'sysServicos',
        function ($scope, $http, $rootScope, sysServicos) {
            jQuery(function(){
                jQuery("input#telefone")
                .mask("(99) 9999-9999?9")
                .focusout(function (event) {  
                    var target, phone, element;  
                    target = (event.currentTarget) ? event.currentTarget : event.srcElement;  
                    phone = target.value.replace(/\D/g, '');
                    element = $(target);  
                    element.unmask();  
                    $scope.userNew.telefone = phone;
                    if(phone.length > 10) {  
                        element.mask("(99) 99999-999?9");  
                    } else {  
                        element.mask("(99) 9999-9999?9");  
                    }  
                });
                $("#cpf").on('focusin',function(){
                    var target = $(this);
                    var val = target.val();
                    target.unmask();
                    val = val.split(".").join("");
                    val = val.split("-").join("");
                    val = val.split("/").join("");
                    target.val(val);
                    $scope.userNew.documentoParticipante = val;
                });
                $("#cpf").on('focusout',function(){
                    var target = $(this);
                    var val = target.val();
                    val = val.split(".").join("");
                    val = val.split("-").join("");
                    val = val.split("/").join("");
                    if (val.length==11) {
                        target.mask("999.999.999-99");
                        target.val(val);
                        $scope.userNew.documentoParticipante = val;
                    } else {
                        if (val.length==14) {
                            target.mask("99.999.999/9999-99");
                            target.val(val);
                            $scope.userNew.documentoParticipante = val;
                        } else {
                            target.val('');
                            $scope.userNew.documentoParticipante = '';
                        }
                    }
                });
                
            })
            

            $scope.user = {};
            $scope.userNew = {};

            $scope.abreModal = function (modal,effect){
                $.magnificPopup.open({
                    removalDelay: 500, //delay removal by X to allow out-animation,
                    items: {
                        src: modal
                    },
                    // overflowY: 'hidden', // 
                    callbacks: {
                        beforeOpen: function (e) {
                            this.st.mainClass = effect;
                        }
                    },
                    midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
                });
            }

            $scope.limpaNewUser = function () {
                $scope.userNew.nome = '';
                $scope.userNew.documentoParticipante = '';
                $scope.userNew.email = '';
                $scope.userNew.telefone = '';
                $scope.userNew.senha = '';
                $scope.userNew.confirmacaoSenha = '';
            };

            $scope.limpaUser = function () {
                $scope.user.nome = '';
                $scope.user.documentoParticipante = '';
                $scope.user.email = '';
                $scope.user.telefone = '';
                $scope.user.senha = '';
                $scope.user.confirmacaoSenha = '';
            };

            $scope.newUser = function () {
                var ObjEnvioNewUser = {};
                if (validateNew(1)) {//preenchimento de campos 
                    if (validateNew(2)) {
                        if (validateNew(3)) {

                            ObjEnvioNewUser = $scope.userNew;
                            ObjEnvioNewUser.dealerId = $rootScope.dealerId;
                            ObjEnvioNewUser.funcaoParticipante="778261CE-A850-4F39-95CB-F0BD630AE6BE";
                            
                            var promise = $http.post(rootURL + '/participante/dealer', ObjEnvioNewUser);
                            promise.then(
                                function (ret) {
                                    sysServicos.sendSuccessMsg('Novo usuário cadastrado com sucesso.');

                                    $scope.limpaNewUser();
                                    $scope.$$childHead.getListaUser();

                                    $.magnificPopup.close();
                                },
                                function (err) {
                                    sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url, err.data.Message);
                                }
                            )

                        }
                    }
                }

            };

            var validateNew = function (id) {
                var countError = 0;
                var errorFields = [];
                var msgType = 0;

                var ret = true;
                //valida cadastro
                if (id == 1) {
                    if ($scope.userNew.nome == '' || $scope.userNew.nome == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push('Nome');
                    };
                    if ($scope.userNew.documentoParticipante == '' || $scope.userNew.documentoParticipante == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push('CPF');
                    };
                    if ($scope.userNew.email == '' || $scope.userNew.email == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push('E-mail');
                    };
                    if ($scope.userNew.senha == '' || $scope.userNew.senha == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push('Senha');
                    };
                    if ($scope.userNew.confirmacaoSenha == '' || $scope.userNew.confirmacaoSenha == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push('Confirmar Senha');
                    };
                };

                if (id == 2) {
                    if ($scope.userNew.senha.length < 9) {
                        ret = false;
                        msgType = 3;
                    }
                };

                if (id == 3) {
                    if ($scope.userNew.senha != $scope.userNew.confirmacaoSenha) {
                        ret = false;
                        msgType = 1;
                    }
                };

                //fim valida cadastro

                //envio de mensagens
                if (errorFields.length == 1 && msgType == 0) {
                    if (errorFields[0] == 'Celular') {
                        sysServicos.sendWarnMsg('O campo ' + errorFields[0] + ' deve ter pelo menos 10 digitos');
                    } else {
                        sysServicos.sendWarnMsg('O campo ' + errorFields[0] + ' é obrigatório.');
                    };

                };

                if (errorFields.length == 2 && msgType == 0) {
                    var concatString = '';
                    concatString += (errorFields[0] + ' e ' + errorFields[1]);
                    sysServicos.sendWarnMsg('Os campos ' + concatString + ' são obrigatórios.');
                };

                if (errorFields.length > 2 && msgType == 0) {
                    var concatString = '';
                    for (var n = 0; n < errorFields.length - 1; n++) {
                        concatString += (errorFields[n] + ', ');
                    };
                    concatString = concatString.slice(0, concatString.lastIndexOf(','));
                    concatString += ' e ' + errorFields[errorFields.length - 1];
                    sysServicos.sendWarnMsg('Os campos ' + concatString + ' são obrigatórios.');
                };

                if (msgType == 1) {
                    sysServicos.sendWarnMsg('Os campos Senha e Confirmação de senha devem ser iguais.');
                };
                if (msgType == 3) {
                    sysServicos.sendWarnMsg('A senha deve conter no mínimo 9 caracteres.');
                };
                

                return ret
            }

            $scope.alterarUser = function () {
                var ObjEnvioUser = {};
                if (validate(1)) {//preenchimento de campos 
                    ObjEnvioUser = $scope.user;                    
                    var promise = $http.put(rootURL + 'participante/dealer/' + $scope.$$childHead.tempId, ObjEnvioUser);
                    promise.then(
                        function (ret) {
                            sysServicos.sendSuccessMsg('Dados do usuário alterado com sucesso.');

                            $scope.limpaUser();
                            $scope.$$childHead.getListaUser();

                            $.magnificPopup.close();
                        },
                        function (err) {
                            sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url, err.data.Message);
                        }
                    )
                }
            };

            $scope.deletarUser = function () {               
                var promise = $http.delete(rootURL + 'participante/dealer/' + $scope.$$childHead.tempId);
                promise.then(
                    function (ret) {
                        sysServicos.sendSuccessMsg('Dados do usuário deletado com sucesso.');

                        $scope.limpaUser();
                        $scope.$$childHead.getListaUser();

                        $.magnificPopup.close();
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url, err.data.Message);
                    }
                )
            };
            //validacao 
            var validate = function (id) {
                var countError = 0;
                var errorFields = [];
                var msgType = 0;

                var ret = true;

                //valida cadastro
                if (id == 1) {
                    if ($scope.user.nome == '' || $scope.user.nome == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push('Nome');
                    };
                    if ($scope.user.documentoParticipante == '' || $scope.user.documentoParticipante == undefined) {
                        ret = false;
                        msgType = 0;
                        errorFields.push('CPF');
                    };
                };
                //fim valida cadastro

                //envio de mensagens
                if (errorFields.length == 1 && msgType == 0) {
                    if (errorFields[0] == 'Celular') {
                        sysServicos.sendWarnMsg('O campo ' + errorFields[0] + ' deve ter pelo menos 10 digitos');
                    } else {
                        sysServicos.sendWarnMsg('O campo ' + errorFields[0] + ' é obrigatório.');
                    };

                };

                if (errorFields.length == 2 && msgType == 0) {
                    var concatString = '';
                    concatString += (errorFields[0] + ' e ' + errorFields[1]);
                    sysServicos.sendWarnMsg('Os campos ' + concatString + ' são obrigatórios.');
                };

                if (errorFields.length > 2 && msgType == 0) {
                    var concatString = '';
                    for (var n = 0; n < errorFields.length - 1; n++) {
                        concatString += (errorFields[n] + ', ');
                    };
                    concatString = concatString.slice(0, concatString.lastIndexOf(','));
                    concatString += ' e ' + errorFields[errorFields.length - 1];
                    sysServicos.sendWarnMsg('Os campos ' + concatString + ' são obrigatórios.');
                };

                if (msgType == 1) {
                    sysServicos.sendWarnMsg('Os campos Senha e Confirmação de senha devem ser iguais.');
                };

                return ret
            }
            
        }])

    .controller('usuariosTableCntrl', ['$scope', '$http', '$rootScope', 'sysServicos', '$timeout', '$interval', 'uiGridConstants','$state',
        function ($scope, $http, $rootScope, sysServicos, $timeout, $interval, uiGridConstants,$state) {

            var totalRows;

            var idFab;

            $scope.userEdit = function (id, nome,documentoParticipante,email,telefone) {
                $scope.tempId = id;
                $scope.$parent.user.nome = nome;
                $scope.$parent.user.documentoParticipante = documentoParticipante;
                $scope.$parent.user.email = email;
                $scope.$parent.user.telefone = telefone;
                $scope.$parent.abreModal('#modalEditar','mfp-sign');
            }

            $scope.userDelete = function (id){
                $scope.tempId = id;

                $scope.$parent.abreModal('#modalDelete','mfp-sign');
            }

            $scope.hideGrid = false;

            function rowTemplate() {
                return $timeout(function () {
                    return '<div ng-class="{ \'inactiveRow\': grid.appScope.rowFormatter( row ) }">' +
                        '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                        '</div>'
                        ;
                }, 100)
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

                rowHeight: 46,

                rowTemplate: rowTemplate(),

                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.gridApi.selection.clearSelectedRows();
                    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);

                    //recebe numero do ato quando selecionado
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                    });

                    //evento de mudanca da qtde de registros visiveis na tabela
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        $scope.gridOptions1.paginationPageSize = pageSize;
                        setTableHeight(totalRows);
                    });
                },

                columnDefs: [
                    { name: 'CPF/CNPJ', field: 'documentoParticipante', cellFilter: 'docFormat:row.entity', filterCellFiltered: true, },
                    { name: 'Nome Completo', field: 'nome' },
                    { name: 'E-mail', field: 'email' },
                    { name: 'Telefone', field: 'telefone' },
                    {
                        name: ' ',
                        width: 30,
                        cellTemplate: '<button class="btn btn-primary btn-table" type="button" title="Detalhes" ng-click="grid.appScope.userEdit(row.entity.participanteId, row.entity.nome, row.entity.documentoParticipante, row.entity.email, row.entity.telefone)"><i class="fa fa-edit"></i></button>',
                        cellClass: 'text-right'
                    },
                    {
                        name: ' ',
                        width: 30,
                        cellTemplate: '<button class="btn btn-danger btn-table" type="button" title="Excluir" ng-click="grid.appScope.userDelete(row.entity.participanteId)"><i class="fa fa-trash"></i></button>',
                        cellClass: 'text-right'
                    },
                ],
            };


            $scope.getListaUser = function () {
                var promise = $http.get(rootURL + '/participante/dealer');
                promise.then(
                    function (ret) {

                        $scope.gridOptions1.data = ret.data;
                        $scope.hideGrid = false;
                        
                        totalRows = $scope.gridOptions1.data.length;
                        setTableHeight(totalRows);

                        //corrige bug com alinhamento das colunas da tabela no Firefox
                        $interval(function () {
                            $scope.gridApi.core.handleWindowResize();
                        }, 500, 5);
                    },
                    function (err) {
                        sysServicos.sendErrorMsg(err.status, err.statusText, err.config.url);
                    }
                );
            }

            $scope.toggleFiltering = function () {
                $scope.gridOptions1.enableFiltering = !$scope.gridOptions1.enableFiltering;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            };

            $scope.filter = function () {
                $scope.gridApi.grid.refresh();
            };

            function setTableHeight(rows) {
                if (rows >= $scope.gridOptions1.paginationPageSize) {
                    angular.element(document.getElementsByClassName('grid')[0]).css('min-height', (($scope.gridOptions1.paginationPageSize + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
                } else {
                    angular.element(document.getElementsByClassName('grid')[0]).css('min-height', ((rows + 1) * $scope.gridOptions1.rowHeight + 56) + 'px');
                }
            }
            $scope.getListaUser();

        }])
