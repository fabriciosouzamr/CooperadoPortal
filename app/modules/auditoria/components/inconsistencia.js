angular
  .module("sysMaster")
  .component("auditoriaInconsistencia", {
    templateUrl: "./modules/auditoria/components/views/inconsistencia.html",
    controller: "auditoriaInconsistenciaController",
    bindings: {
      name: "<", //one way data binding
      onChange: "&",
      onTeste: "&"
    }
  })
  .controller("auditoriaInconsistenciaController", function() {
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
