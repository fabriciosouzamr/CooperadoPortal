app.service("planoMidiaService", [
  "$rootScope",
  "$q",
  "$http",
  function($rootScope, $q, $http) {
    // this.getDealersList = function(data) {
    //   return this.httpGet("dealer/consultar", data);
    // };

    
    // this.postEvidencia = function(data) {
    //   return this.httpPost("v1/evidencias", data);
    // };
    this.postNovaMidia = function(data) {
         return this.httpPost("v1/novoPlanoMidia", data);
    };
    this.postNovoPlanoMidiaUpload = function(data) {
         return this.httpPost("v1/novoPlanoMidiaUpload", data);
    };
    this.inativarPlanoMidia = function(data) {
         return this.httpPost("v1/inativarPlanoMidia/", data);
    };
    this.getPlanosPorDealer = function(data) {
         return this.httpGet("v1/buscarPlanoMidiaPorDealer/"+data);
    };

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
