app
  .config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/home");

    $ocLazyLoadProvider.config({
      debug: false, // For debugging 'true/false'
      events: true, // For Event 'true/false'
      modules: [
        ///////// dealer
        {
          name: "home",
          files: [
            "../app/modules/home/homeCtrl.js",
            "../app/modules/home/table.css",
            "../assets/js/ui-bootstrap-tpls-2.0.0.js"
          ]
        },
        {
          name: "planoMidia",
          files: [
            "../app/modules/planoMidia/planoMidia.js",
            "../app/modules/planoMidia/table.css"
          ]
        },
        {
          name: "PreAprovacaoAdmin",
          files: [
            "../app/modules/PreAprovacaoAdmin/PreAprovacaoAdmin.js",
            "../app/modules/PreAprovacaoAdmin/table.css"
          ]
        },
        {
          name: "PreAprovacaoDealer",
          files: [
            "../app/modules/PreAprovacaoDealer/PreAprovacaoDealer.js",
            "../app/modules/PreAprovacaoDealer/table.css"
          ]
        },
        {
          name: "reembolsoDealer",
          files: [
            "../app/modules/reembolso/reembolsoDealer.controller.js",
            "../app/modules/reembolso/table.css"
          ]
        },
        {
          name: "perfil",
          files: ["../app/modules/perfil/perfilCtrl.js"]
        },
        {
          name: "fale",
          files: [
            "../app/modules/fale/faleCtrl.js",
            "../app/modules/fale/table.css"
          ]
        },
        {
          name: "cadastros",
          files: [
            "../app/modules/cadastros/cadastrosCtrl.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "meuCadastro",
          files: [
            "../app/modules/cadastros/cadastrosCtrl.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "usuarios",
          files: ["../app/modules/usuarios/usuariosCtrl.js"]
        },
        {
          name: "relatorios",
          files: ["../app/modules/relatorios/relatoriosCtrl.js"]
        },
        {
          name: "inicial",
          files: ["../app/modules/inicial/inicialCtrl.js"]
        },
        {
          name: "administrador",
          files: ["../app/modules/administrador/controllers/admController.js"]
        },
        // Toyota Admin
        {
          name: "dashboard",
          files: ["../app/modules/dashboard/dashboardCtrl.js"]
        },
        // menu verba
        {
          name: "verba",
          files: [
            "../app/modules/verba/verbaCtrl.js",
            "../app/modules/verba/table.css"
          ]
        },
        {
          name: "financeiro",
          files: [
            "../app/modules/verba/financeiroCtrl.js",
            "../app/modules/auditoria/table.css"
          ]
        },
        {
          name: "criarDealer",
          files: [
            "../app/modules/cadastros/cadastrosCtrl.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "detalheDealer",
          files: [
            "../app/modules/cadastros/cadastrosCtrl.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "cadastrarDealer",
          files: [
            "../app/modules/cadastros/cadastroDealer.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "gestaoBanners",
          files: [
            "../app/modules/banners/banners.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "regulamentos",
          files: [
            "../app/modules/regulamento/regulamento.js"
          ]
        },
        {
          name: "gestaoNoticias",
          files: [
            "../app/modules/noticias/noticias.js",
            "../app/modules/noticias/noticias.css",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "gestaoPrazos",
          files: [
            "../app/modules/prazos/prazos.js"
          ]
        },
        {
          name: "consultaRapida",
          files: [
            "../app/modules/consulta/consulta.js"
          ]
        },
        {
          name: "gestaoEventos",
          files: [
            "../app/modules/eventos/eventos.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "cadastrarUser",
          files: [
            "../app/modules/cadastros/cadastroUser.js",
            "../app/modules/cadastros/table.css"
          ]
        },
        {
          name: "auditoria",
          files: [
            "../app/modules/auditoria/auditoria.controller.js",
            "../app/modules/auditoria/table.css"
          ]
        },
        {
          name: "auditar",
          files: [
            "../app/modules/auditoria/auditar.controller.js",
            "../app/modules/auditoria/auditar.css"
          ]
        }
      ]
    });

    $stateProvider
      .state("inicial", {
        url: "/",
        views: {
          "": {
            templateUrl: "../app/modules/inicial/views/inicial.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("inicial");
            }
          ]
        }
      })
      /////////////////////////////////
      ////////////////////////// DEALER
      .state("home", {
        url: "/home",
        views: {
          "": {
            templateUrl: "../app/modules/home/views/home.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("home");
            }
          ]
        }
      })

      ////////////
      // planoMidia
      .state("planoMidia", {
        url: "/planoMidia/planoMidia",
        views: {
          "": {
            templateUrl: "../app/modules/planoMidia/views/planoMidia.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("planoMidia");
            }
          ]
        }
      })
      ////////////
      // PreAprovacaoAdmin
      .state("PreAprovacaoAdmin", {
        url: "/PreAprovacaoAdmin/PreAprovacaoAdmin",
        views: {
          "": {
            templateUrl: "../app/modules/PreAprovacaoAdmin/views/PreAprovacaoAdmin.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("PreAprovacaoAdmin");
            }
          ]
        }
      })
      ////////////
      // PreAprovacaoDealer
      .state("PreAprovacaoDealer", {
        url: "/PreAprovacaoDealer/PreAprovacaoDealer",
        views: {
          "": {
            templateUrl: "../app/modules/PreAprovacaoDealer/views/PreAprovacaoDealer.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("PreAprovacaoDealer");
            }
          ]
        }
      })

      ////////////
      // reembolso
      .state("reembolsoDealer", {
        url: "/reembolso/dealer",
        views: {
          "": {
            templateUrl: "../app/modules/reembolso/views/reembolsoDealer.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("reembolsoDealer");
            }
          ]
        }
      })

      .state("processoDetalhe", {
        url: "/processo/:dealerID/:profile/:statusPeriodo",
        views: {
          "": {
            templateUrl: "../app/modules/reembolso/views/processoDetalhe.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("reembolsoDealer");
            }
          ]
        }
      })

      //.state("impressao", {
      //  url: "/impressao/:budgetDealerID",
      //  views: {
      //    "": {
      //      templateUrl: "../app/modules/reembolso/views/impressao.html"
      //    }
      //  },
      //  resolve: {
      //    loadMyCtrl: [
      //      "$ocLazyLoad",
      //      function($ocLazyLoad) {
      //        return $ocLazyLoad.load("reembolsoDealer");
      //      }
      //    ]
      //  }
      //})

      .state("impressaoAdmin", {
        url: "/admin/impressao/:budgetDealerID",
        params: {
          dealer: null
        },
        views: {
          "": {
            templateUrl: "../app/modules/auditoria/views/impressao.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("auditoria");
            }
          ]
        }
      })

      .state("impressaoVerba", {
        // url: "/admin/verba/impressao/:type/:budgetDealerIDs",
        // url: "/admin/verba/impressao/:budgetDealerIDs",
         url: "/admin/verba/impressao/:type/:budgetDealerIDs",
        views: {
          "": {
            templateUrl: "../app/modules/verba/views/impressao.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("financeiro");
            }
          ]
        }
      })

      .state("reembolsoAcaoDealer", {
        url: "/reembolso/dealer/nova-acao/:ano/:mes/:abaId/:bdId",
        views: {
          "": {
            templateUrl: "../app/modules/reembolso/views/novaAcao.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("reembolsoDealer");
            }
          ]
        }
      })
      .state("reembolsoAcaoDet", {
        url:
          "/reembolso/dealer/acao/:budgetId/:applicationId/:currentId/:statusPeriodo",
        views: {
          "": {
            templateUrl: "../app/modules/reembolso/views/detAcao.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("reembolsoDealer");
            }
          ]
        }
      })

      // reembolso
      ////////////

      .state("perfil", {
        url: "/meu-cadastro",
        views: {
          "": {
            templateUrl: "../app/modules/perfil/views/perfil.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("perfil");
            }
          ]
        }
      })

      .state("faleConosco", {
        url: "/contato",
        views: {
          "": {
            templateUrl: "../app/modules/fale/views/faleConosco.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("fale");
            }
          ]
        }
      })

      .state("faleDetalhe", {
        url: "/contato/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/fale/views/faleDetalhe.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("fale");
            }
          ]
        }
      })

      .state("faleNovo", {
        url: "/novo-contato",
        views: {
          "": {
            templateUrl: "../app/modules/fale/views/faleNovo.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("fale");
            }
          ]
        }
      })

      // Toyota Admin
      .state("dashboard", {
        url: "/",
        views: {
          "": {
            templateUrl: "../app/modules/dashboard/views/dashboard.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("dashboard");
            }
          ]
        }
      })
      // menu verba
      .state("verba", {
        url: "/verba",
        views: {
          "": {
            templateUrl: "../app/modules/verba/views/verba.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("verba");
            }
          ]
        }
      })

      .state("financeiro", {
        url: "/verba/financeiro",
        views: {
          "": {
            templateUrl: "../app/modules/verba/views/financeiro.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("financeiro");
            }
          ]
        }
      })

      .state("auditoria", {
        url: "/auditoria",
        views: {
          "": {
            templateUrl: "../app/modules/auditoria/views/auditoria.html"
          }
        },
        params: {
          aba: null,
          detalhe: null
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("auditoria");
            }
          ]
        }
      })

      .state("auditar", {
        url: "/auditar/:BudgetDealerNFID",
        views: {
          "auditar@": {
            templateUrl: "../app/modules/auditoria/views/auditar.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("auditar");
            }
          ]
        }
      })

      .state("cadastrosDealer", {
        url: "/cadastros/dealer/:id",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastrarDealer.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastrarDealer");
            }
          ]
        }
      })

      .state("cadastrosUser", {
        url: "/cadastros/usuario/:id",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastrarUser.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastrarUser");
            }
          ]
        }
      })

      .state("cadastrosNewUser", {
        url: "/cadastros/usuario/",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastrarUser.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastrarUser");
            }
          ]
        }
      })

      .state("cadastrosNewUserAgency", {
        url: "/cadastros/agencia/",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastrarUser.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastrarUser");
            }
          ]
        }
      })

      .state("cadastros", {
        url: "/cadastros",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastros.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastros");
            }
          ]
        }
      })

      .state("ativarCadastro", {
        url: "/ativarCadastro",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/ativar.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastros");
            }
          ]
        }
      })

      .state("inativarCadastro", {
        url: "/inativarCadastro",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/inativar.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastros");
            }
          ]
        }
      })

      .state("cadastrar", {
        url: "/cadastrar",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastrar.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastros");
            }
          ]
        }
      })

      .state("criarDealer", {
        url: "/criarDealer",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/criarDealer.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("criarDealer");
            }
          ]
        }
      })

      .state("detalheDealer", {
        url: "/detalheDealer/:id",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/detalheDealer.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("detalheDealer");
            }
          ]
        }
      })
      .state("cadastroEditar", {
        url: "/cadastroEditar/:cadastroId",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastroEditar.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastros");
            }
          ]
        }
      })

      .state("cadastroBase", {
        url: "/cadastroBase/:cpf",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastroEditar.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastros");
            }
          ]
        }
      })

      .state("cadastrosListagem", {
        url: "/cadastroListar/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/cadastros/views/cadastrosListar.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("cadastros");
            }
          ]
        }
      })

      .state("usuarios", {
        url: "/usuarios",
        views: {
          "": {
            templateUrl: "../app/modules/usuarios/views/usuarios.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("usuarios");
            }
          ]
        }
      })

      /////////// PORTAL /////////////

      .state("portal", {
        url: "/portal",
        views: {
          "": {
            templateUrl: "../app/modules/portal/views/portal.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("portal");
            }
          ]
        }
      })

      .state("bannersHome", {
        url: "/bannershome/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/portal/views/banners.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("portal");
            }
          ]
        }
      })

      .state("relatorios", {
        url: "/relatorios",
        views: {
          "": {
            templateUrl: "../app/modules/relatorios/views/relatorios.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("relatorios");
            }
          ]
        }
      })      

      .state("programador", {
        url: "/programador/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/programadores/views/programador.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("programadores");
            }
          ]
        }
      })

      .state("bannerProgramador", {
        url: "/bannerProgramador/:programadorId/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/programadores/views/banners.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("programadores");
            }
          ]
        }
      })

      .state("calendarioProgramador", {
        url: "/calendario/:programadorId/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/programadores/views/calendario.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("programadores");
            }
          ]
        }
      })

      .state("destaqueProgramador", {
        url: "/destaques/:programadorId/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/programadores/views/destaque.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("programadores");
            }
          ]
        }
      })

      .state("gestaoBanners", {
        url: "/gestaodebanners",
        views: {
          "": {
            templateUrl: "../app/modules/banners/views/gestaoBanners.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("gestaoBanners");
            }
          ]
        }
      })

      .state("gestaoNoticias", {
        url: "/gestaodenoticias",
        views: {
          "": {
            templateUrl: "../app/modules/noticias/views/gestaoNoticias.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("gestaoNoticias");
            }
          ]
        }
      })

      .state("gestaoEventos", {
        url: "/gestaodeeventos",
        views: {
          "": {
            templateUrl: "../app/modules/eventos/views/gestaoEventos.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("gestaoEventos");
            }
          ]
        }
      })

      .state("gestaoPrazos", {
        url: "/prazos",
        views: {
          "": {
            templateUrl: "../app/modules/prazos/views/prazos.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("gestaoPrazos");
            }
          ]
        }
      })

      .state("consultaRapida", {
        url: "/consulta-rapida",
        views: {
          "": {
            templateUrl: "../app/modules/consulta/views/consulta-rapida.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("consultaRapida");
            }
          ]
        }
      })

      .state("consultaRapidaDetalhe", {
        url: "/consulta-rapida/detalhe/:budgetDealerId/:dealerId/:mes/:periodoNum/:anoFiscal/:appID",
        views: {
          "": {
            templateUrl: "../app/modules/consulta/views/consulta-rapida-detalhe.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("consultaRapida");
            }
          ]
        }
      })

      .state("regulamentos", {
        url: "/regulamentos",
        views: {
          "": {
            templateUrl: "../app/modules/regulamento/views/regulamento.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("regulamentos");
            }
          ]
        }
      })
      ////////  fale conosco  //////////

      .state("faleResponder", {
        url: "/faleResponder/:chamadoId",
        views: {
          "": {
            templateUrl: "../app/modules/fale/views/faleResponder.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("fale");
            }
          ]
        }
      })

      .state("relatoriosParticipantes", {
        url: "/relatorios/participantes",
        views: {
          "": {
            templateUrl: "../app/modules/relatorios/views/participantes.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("relatorios");
            }
          ]
        }
      })

      ////////////////// Administrador \\\\\\\\\\\\\\\\\\\\\
      .state("administrador", {
        url: "/administrador",
        views: {
          "": {
            templateUrl: "../app/modules/administrador/views/admView.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("administrador");
            }
          ]
        }
      })
      .state("administradorEditar", {
        url: "/administrador/:currentId",
        views: {
          "": {
            templateUrl: "../app/modules/administrador/views/admDetailView.html"
          }
        },
        resolve: {
          loadMyCtrl: [
            "$ocLazyLoad",
            function($ocLazyLoad) {
              return $ocLazyLoad.load("administrador");
            }
          ]
        }
      });
  })
  .run(function($rootScope, $state) {
    $rootScope.$state = $state;
  });
