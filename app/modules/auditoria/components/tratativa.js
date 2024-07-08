angular
  .module("sysMaster")
  .component("auditoriaTratativa", {
    templateUrl: "./modules/auditoria/components/views/tratativa.html",
    controller: "auditoriaTratativaController",
    bindings: {
      name: "<", //one way data binding
      onChange: "&",
      onTeste: "&"
    }
  })
  .controller("auditoriaTratativaController", function() {
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
