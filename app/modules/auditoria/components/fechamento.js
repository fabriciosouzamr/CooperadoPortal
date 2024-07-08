angular
  .module("sysMaster")
  .component("auditoriaFechamento", {
    templateUrl: "./modules/auditoria/components/views/fechamento.html",
    controller: "auditoriaFechamentoController",
    bindings: {
      name: "<", //one way data binding
      onChange: "&",
      onTeste: "&"
    }
  })
  .controller("auditoriaFechamentoController", function() {
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
