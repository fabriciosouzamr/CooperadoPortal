app.controller("appController", [
  "$scope",
  "$http",
  "$rootScope",
  "ngNotify",
  "AuthenticationService",
  "sysServicos",
  "deviceDetector",
  function(
    $scope,
    $http,
    $rootScope,
    ngNotify,
    AuthenticationService,
    sysServicos,
    deviceDetector
  ) {
    var controllerMaster; //usado para passar o nome do controller quando ocorre um erro na promise
    $scope.flagMsgRecSenha = true;

    //verifica se o navegador esta com cookies habilitados
    if (!navigator.cookieEnabled) {
      $rootScope.$broadcast(
        "alertLogin",
        '<span class="ngn-alertLogin">Este sistema utiliza Cookies.</span>'
      );
    }

    $scope.recuperaSenha = function() {
      if ($scope.recuperaCpf == undefined) {
        //sysServicos.sendWarnMsg("Preencher o campo CPF com um número válido.");
        sysServicos.sendWarnMsg("Informe seu login.");
      } else {
        //var strCpf = $scope.recuperaCpf.toString();

        //var promise = $http.post(rootURL + "acesso/esqueceuSenha", { documento: $scope.recuperaCpf});
        var promise = $http.patch(
          rootURL + "conta/senha/resetar?userName=" + $scope.recuperaCpf 
        );
        promise.then(
          function (res) {
              sysServicos.sendWarnMsg(res.data.message);
              console.log(res.data.message)
          },
          function (err) {
            sysServicos.sendWarnMsg(err.data.message);
          }
      );
      }
    };

    //esqueci minha senha
    $scope.esqueciSenha = function() {
      if ($scope.initializedCpf == undefined) {
        sysServicos.sendWarnMsg("Preencher o campo CPF com um número válid.");
      } else {
        var strCpf = $scope.initializedCpf.toString();
        $scope.initializedCpf =
          strCpf.substr(0, 3) +
          "." +
          strCpf.substr(3, 3) +
          "." +
          strCpf.substr(6, 3) +
          "-" +
          strCpf.substr(9, 2);

        console.log("esqueci a senha ::");

        var promise = $http.post(rootURL + "acesso/esqueceuSenha", {
          cpf: $scope.initializedCpf
        });
        promise.then(
          function(ret) {
            sysServicos.sendWarnMsg(ret.data);
            setTimeout(animPop("boxForgot"), 3000);
          },
          function(err) {
            if (err.data.Message != undefined) {
              sysServicos.sendErrorMsgEsp(
                err.status,
                err.statusText,
                err.data.Message
              );
            } else {
              sysServicos.sendErrorMsg(
                err.status,
                err.statusText,
                err.config.url
              );
            }
          }
        );
      }
    };

    $scope.login = function() {
      //$scope.usuario = $scope.usuario.replace(" ", "").replace(".", "").replace("-", "");

      debugger

      AuthenticationService.Login($scope.usuario, $scope.senha, function(
        response,
        response2
      ) {

        debugger

        //console.log('000', response, response2);
        $scope.access_token_01 = response.result.token;
        //Aqui pegamos o tempo de retorno da expiração e armazenamos para posterior consulta
        $scope.token_expires = moment().add(1209599, "seconds");

        AuthenticationService.ClearCredentials();
        //Passamos para frente o momento de expiração do token
        AuthenticationService.SetCredentials(
          $scope.token_expires,
          response,
          response2
        );
        window.open(rootURLInter + "app/", "_self");
      });
    };

    var formatUsuario = function(doc) {
      /*return (
        doc.substr(0, 3) +
        "." +
        doc.substr(3, 3) +
        "." +
        doc.substr(6, 3) +
        "-" +
        doc.substr(9, 2)
      );*/
      return doc;
      //Precisamos limpar o campo quando o usuário digitar com formatação
    };
  }
]);
