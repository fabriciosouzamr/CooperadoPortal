app.service("sysServicos", [
  "$rootScope",
  function($rootScope) {
    this.sendErrorMsg = function(status, statusText, configUrl, mensagem) {
      var item;

      switch (status) {
        case 400:
          item = "<small>" + mensagem + "</small>";
          break;
        case 401:
          item =
            "<small>Não autorizado. <br>Você não tem permissão para realizar essa ação.</small>";
          break;
        case 405:
          item = "<small>" + mensagem + "</small>";
          break;
        case 406:
          item = "<small>" + mensagem + "</small>";
          break;
        case 412:
          item = "<small>" + mensagem + "</small>";
          break;
        case 500:
          item = "<small>Erro interno</small>";
          break;
      }
      $rootScope.$broadcast("alert", item);
    };

    this.sendWarnMsg = function(msgText) {
      var item = msgText;
      $rootScope.$broadcast("warn", item);
    };

    this.sendSuccessMsg = function(msgText) {
      var item = msgText;
      $rootScope.$broadcast("success", item);
    };
  }
]);

app.service("applicationService", [
  "$rootScope",
  "applicationId",
  function($rootScope, applicationId) {
    this.fomataApplicationId = function(aba, marca) {
      return applicationId[`${marca}/${aba}`];
    };
  }
]);

app.service("serviceScrollTop", [
  "$rootScope",
  function($rootScope) {
    this.scrollTop = function() {
      window.scrollTo(0, 0);
    };
  }
]);

app.service("manipulaString", [
  "$rootScope",
  function($rootScope) {
    this.removeEspecialCaracteres = function(str) {
      str = str.toLowerCase();
      str = str.replace(" ", "");
      str = str.replace(/[áàãâä]/g, "a");
      str = str.replace(/[éèêë]/g, "e");
      str = str.replace(/[íìîï]/g, "i");
      str = str.replace(/[óòõôö]/g, "o");
      str = str.replace(/[úùûü]/g, "u");
      str = str.replace("ç", "c");
      str = str.replace(/[^a-z0-9]/i, "_");
      str = str.replace(/_+/, "_");
      str = str.replace(/["!@#$%¨&*()+={}´`^~?:;><"'*,ºª°]/g, "");
      return str;
    };
  }
]);

app.service("httpService", [
  "$q",
  "$http",
  function($q, $http) {
    this.httpPost = function(endPoint, data) {
      return $q(function(resolve, reject) {
        $http.post(rootURL + endPoint, data).then(
          function(result) {
            resolve(result);
          },
          function(error) {
            reject(error);
          }
        );
      });
    };

    this.httpGet = function(endPoint, data) {
      return $q(function(resolve, reject) {
        $http.get(rootURL + endPoint, { params: data }).then(
          function(result) {
            resolve(result);
          },
          function(error) {
            reject(error);
          }
        );
      });
    };

    this.httpPatch = function(endPoint, data) {
      return $q(function(resolve, reject) {
        $http.patch(rootURL + endPoint, data).then(
          function(result) {
            resolve(result);
          },
          function(error) {
            reject(error);
          }
        );
      });
    };
  }
]);
