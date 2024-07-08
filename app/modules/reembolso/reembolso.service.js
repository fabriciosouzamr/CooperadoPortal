app.service("reembolsoService", [
  "$rootScope",
  "$q",
  "$http",
  function($rootScope, $q, $http) {
    this.getItemIncentivoDetalhe = function(
      budgetDealerNFID,
      applicationId,
      descricao,
      veiculoID,
      relevancia,
      valorUnidade,
      entrada,
      parcelas,
      valorParcela
    ) {
      return {
        budgetDealerNFID: budgetDealerNFID || "",
        applicationId: applicationId || "",
        descricao: descricao || "",
        veiculoID: veiculoID || "",
        relevancia: relevancia || "",
        valorUnidade: valorUnidade || "",
        entrada: entrada || "",
        parcelas: parcelas || "",
        valorParcela: valorParcela || ""
      };
    };

    this.getDealersList = function(data) {
      return this.httpGet("dealer/consultar", data);
    };

    this.getDealersByRegionId = function(data) {
      return this.httpGet("dealer/consultar?RegiaoId=" + data);
      // return this.httpGet("v1/dealers", data);
    };

    this.getRegionsList = function(data) {
      return this.httpGet("v1/regioes", data);
    };

    this.getStrategies = function(data) {
      return this.httpGet("v1/estrategias", data);
    };

    this.getDetalheAcao = function(data) {
      return this.httpGet("v1/detalheAcao", data);
    };

    this.postNovaAcao = function(data) {
      return this.httpPost("v1/novaAcao", data);
    };

    this.postNovaNota = function(data) {
      return this.httpPost("v1/novaNota", data);
    };

    this.patchAlteraAcao = function(data) {
      return this.httpPatch("v1/alteraAcao", data);
    };

    this.patchGerarNota = function(data) {
      return this.httpPatch("v1/geraNF", data);
    };

    this.patchReenviarNota = function(data) {
      return this.httpPatch("v1/reencaminhar?budgetDealerId=", data);
    };

    this.postAcaoVeiculo = function(data) {
      return this.httpPost("v1/acaoVeiculo", data);
    };

    this.postEvidencia = function(data) {
      return this.httpPost("v1/evidencias", data);
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
