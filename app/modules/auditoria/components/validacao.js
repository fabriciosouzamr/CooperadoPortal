angular
  .module("sysMaster")
  .component("auditoriaValidacao", {
    templateUrl: "./modules/auditoria/components/views/validacao.html",
    controller: "auditoriaValidacaoController",
    bindings: {
      name: "<", //one way data binding
      onChange: "&",
      onTeste: "&"
    }
  })
  .controller("auditoriaValidacaoController", function() {
    //component controller
    var ctrl = this;

    ctrl.onClick = function(value) {
      console.log("clicked", value);
      ctrl.onChange({ value: "teste" });
    };
    ctrl.onTeste = function(value) {
      console.log("clicked", value);
      ctrl.onChange({ value: "teste" });
    };
  });
