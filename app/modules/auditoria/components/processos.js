angular
  .module("sysMaster")
  .component("auditoriaProcessos", {
    templateUrl: "./modules/auditoria/components/views/processos.html",
    controller: "auditoriaProcessosController",
    bindings: {
      name: "<", //one way data binding
      onChange: "&",
      onTeste: "&"
    }
  })
  .controller("auditoriaProcessosController", function() {
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
