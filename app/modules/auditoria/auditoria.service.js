app.service('auditoriaService', [
  'httpService',
  function(httpService) {
    this.getContagem = function() {
      return httpService.httpGet('auditoria/contagem');
    };
    this.getListaRecebimento = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/recebimento/listagem', data);
    };

    this.getListaValidacao = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/validacao/processo/listagem', data);
    };

    this.getListaInconsistencia = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/inconsistencia/listagem', data);
    };

    this.getListaFechamentos = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/fechamento/listagem', data);
    };

    this.getListaTratados = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/tratados/listagem', data);
    };

    this.getCabecalhoAcao = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/detalhes/cabecalho', data);
    };

    this.getRodapeAcao = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/detalhes/rodape', data);
    };

    this.getDetalhesAcao = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/detalhes/acoes', data);
    };

    this.getContatoListagem = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/contato/listagem', data);
    };

    this.getProcessoNfListagem = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/processos/listagem', data);
    };

    this.getProcessosRetornadosByBudgetId = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/processos/retornados', data);
    };

    this.getProcessosStatus = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/processos/status');
    };

    this.getValidacaoNotaMotivos = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/validacao/nota/motivos');
    };

    this.pathProcessoSalvar = function(data) {
      // var params = { marca: data };
      return httpService.httpPatch(
        'auditoria/validacao/processo/salvar?BudgetDealerID=' +
          data.BudgetDealerID
      );
    };

    this.pathValidacaoNotaSalvar = function(data) {
      // var params = { marca: data };
      return httpService.httpPatch('auditoria/validacao/nota/salvar', data);
    };

    this.pathProcessoFechar = function(data) {
      // var params = { marca: data };
      return httpService.httpPatch(
        // "auditoria/fechamento/lote/salvar" , data
        'auditoria/validacao/processo/fechar?BudgetDealerID=' +
          data.BudgetDealerID
      );
    };

    this.pathProcessoRetornar = function(data) {
      // var params = { marca: data };
      return httpService.httpPatch('auditoria/processos/retornar', data);
    };

    this.postContatoSalvar = function(data) {
      // var params = { marca: data };
      return httpService.httpPost('auditoria/contato/salvar', data);
    };

    this.postFechamentoLoteSalvar = function(data) {
      // var params = { marca: data };
      return httpService.httpPost('auditoria/fechamento/lote/salvar', data);
    };

    this.getListaReaberturaLote = function(data) {
      return httpService.httpGet('auditoria/reabertura-lote/listagem', data);
    };

    this.getPodeReabrirLote = function(data) {
      return httpService.httpGet('auditoria/reabertura-lote/pode-reabrir', data);
    }

    this.postReabrirLote = function(data) {
      return httpService.httpPost('auditoria/reabertura-lote/reabrir', data);
    }

    this.pathReceber = function(data) {
      // var params = { marca: data };
      return httpService.httpPatch('auditoria/recebimento/receber', data);
    };

    this.pathReabrir = function(data) {
      var params = { BudgetDealerID: data };
      return httpService.httpPatch(
        'auditoria/recebimento/reabrir?BudgetDealerID=' + data
      );
    };

    this.getListaReabertos = function(data) {
      // var params = { marca: data };
      return httpService.httpGet('auditoria/recebimento/reabertos', data);
    };
    this.patchAlteraAcao = function(data) {
      return httpService.httpPatch('v1/alteraAcao', data);
    };
  }
]);
