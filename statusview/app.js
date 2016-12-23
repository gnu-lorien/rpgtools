//$.event.special.tap.emitTapOnTaphold = false;

window.addEventListener("load", function() {
  console.log("Hello World!");
});

var to_node = function(position, trait_name) {
  var st = _.clone(status_traits_by_name[trait_name]);
  return {
    data:
    {
      id: _.join([position, st.type, trait_name], "_"),
      label: trait_name
    }
  }
}

var get_position = function(position) {
  var ret = [{
    data: {
      id: position,
      label: position
    },
    classes: "position"
  }];
  var d = positions_by_name[position];
  var ns = [];
  _.each(["abiding", "abiding_choose_one", "abiding_absent"], function (abiding_style) {
    ns = _.concat(ns, _.map(d[abiding_style], function (p) {
      return {
        data: {
          id: p,
          label: p
        },
        classes: abiding_style
      }
    }));
  })
  var edges = _.map(ns, function (p) {
    return {
      data: {
        id: _.join(["edge", p.data.label, position], "_"),
        source: position,
        target: p.data.id
      }
    }
  })
  return _.concat(ret, ns, edges);
}

var make_edge = function(source, target) {
  return {
    data: {
      id: source + "_" + target,
      source: source,
      target: target
    }
  }
}

var make_edge_passive = make_edge;
var make_edge_spent = make_edge;

var make_node = function(n) {
  return {data: {id: n, label: n}}
}

$(function(){ // on dom ready

  var sect = "Camarilla";
  var elements = [];
  /* Positions */
  if ("Sabbat" == sect) {
    elements = _.concat(
      elements,
      get_position("Regent"),
      get_position("Cardinal"),
      get_position("Archbishop"),
      get_position("Bishop"),
      get_position("Ductus"),
      get_position("Priest"),
      get_position("Abbot"),
      get_position("Priscus"),
      make_node("Prisci Council"),
      make_edge("Prisci Council", "Priscus"),
      make_edge("Regent", "Cardinal"),
      make_edge("Cardinal", "Archbishop"),
      make_edge("Archbishop", "Bishop"),
      make_node("Pack"),
      make_edge("Pack", "Ductus"),
      make_edge("Pack", "Priest"),
      make_edge("Pack", "Abbot"),
      make_node("Inquisition"),
      make_edge("Regent", "Inquisition"),
      make_node("Black Hand"),
      make_edge("Regent", "Black Hand"),
      make_edge("Priest", "Scholar"));
  } else {
    elements = _.concat(
      elements,
      get_position("Inner Circle"),
      get_position("Imperator"),
      get_position("Justicar"),
      get_position("Archon"),
      get_position("Josian Archon"),
      get_position("Alastor"),
      get_position("Prince"),
      get_position("Petty Prince"),
      get_position("Seneschal"),
      get_position("Primogen"),
      get_position("Whip"),
      get_position("Harpy"),
      get_position("Lesser Harpy"),
      get_position("Keeper of Elysium"),
      get_position("Sheriff"),
      get_position("Deputy Sheriff"),
      get_position("Scourge"),
      get_position("Elder"),
      get_position("Ancilla"),
      get_position("Neonate"),
      make_edge("Inner Circle", "Imperator"),
      make_edge("Inner Circle", "Justicar"),
      make_edge("Justicar", "Archon"),
      make_node("Tegyrius"),
      make_edge("Justicar", "Tegyrius"),
      make_edge("Tegyrius", "Josian Archon"),
      make_edge("Inner Circle", "Alastor"),
      make_edge("Prince", "Seneschal"),
      make_edge("Prince", "Primogen"),
      make_node("Primogen Council"),
      make_edge("Primogen", "Primogen Council"),
      make_edge("Primogen", "Whip"),
      make_edge("Primogen Council", "Harpy"),
      make_edge("Harpy", "Lesser Harpy"),
      make_edge("Prince", "Keeper of Elysium"),
      make_edge("Prince", "Sheriff"),
      make_edge("Sheriff", "Deputy Sheriff"),
      make_edge("Prince", "Scourge"));

  }

  /* Storyteller */
  var storyteller = {
    data: {
      id: "storyteller",
      label: "Storyteller"
    },
    classes: "storyteller"
  };
  var all_fleeting = _.chain(status_traits)
    .filter(function (t) {
      return t.type == "fleeting";
    })
    .filter(function (t) {
      if ("Sabbat" == sect) {
        return !_.eq(t.venue, "Camarilla");
      } else {
        return !_.eq(t.venue, "Sabbat");
      }
    })
    .map(function (t) {
      return {
        data: {
          id: "storyteller_" + t.name,
          source: "storyteller",
          target: t.name
        }
      }
    })
    .value();
  elements = _.concat(elements, storyteller, all_fleeting);

  /* Rituals */
  if ("Sabbat" == sect) {
    var auct_names = [
      "Binding",
      "Blood Bath",
      "Blood Feast",
      "Rite of Contrition",
      "Creation Rite",
      "Fire Dance",
      "Games of Instinct",
      "High Holidays",
      "Monomacy",
      "Sermons of Caine",
      "Vaulderie",
      "War Party",
      "Wild Hunt",
    ];
    elements = _.concat(
      elements,
      [
        make_node("Ignoblis Ritae"),
        make_node("Auctoritas Ritae"),
      ]
    );
    elements = _.concat(
      elements,
      _.map(auct_names, function(n) {
        return make_node(n);
      }),
      _.map(auct_names, function(n) {
        return make_edge("Auctoritas Ritae", n);
      })
    );
    var rituals = [
      make_edge("Fire Dance", "Cowardly"),
    ];
    elements = _.concat(elements, rituals);
  }

  /* Status */
  var other_status = [
    make_edge_spent("Warned", "Disgraced"),
    make_edge_spent("Disgraced", "Forsaken"),
    make_edge_passive("Authority", "Courageous"),
    make_edge_passive("Authority", "Defender"),
    make_edge_passive("Authority", "Honorable"),
    make_edge_passive("Authority", "Loyal"),
    make_edge_spent("Authority", "Warned"),
    make_edge_spent("Authority", "Forsaken"),
    make_edge_passive("Commander", "Enforcer"),
    make_edge_spent("Commander", "Courageous"),
    make_edge_spent("Commander", "Loyal"),
    make_edge_passive("Enforcer", "Defender"),
    make_edge_spent("Enforcer", "Warned"),
    make_edge_passive("Established", "Warned"),
    make_edge_spent("Established", "Favored"),
    make_edge_passive("Prominent", "Honorable"),
    make_edge_passive("Prominent", "Courteous"),
    make_edge_spent("Prominent", "Disgraced"),
    make_edge_passive("Favored", "Warned"),
    make_edge_spent("Victorious", "Warned"),
  ];
  if ("Sabbat" == sect) {
    other_status = _.concat(
        other_status,
        make_edge_passive("Sacrosanct", "Favored"),
        make_edge_passive("Sacrosanct", "Resolute"),
        make_edge_passive("Purified", "Disgraced"),
        make_edge_passive("Branded", "Warned"),
        make_edge_spent("Branded", "Disgraced"),
        make_edge_passive("Ordained", "Devout"),
        make_edge_spent("Ordained", "Anointed"),
        make_edge_spent("Ordained", "Battle-Scarred"),
        make_edge_spent("Ordained", "Ignorant"),
        make_edge_passive("Infamous", "Warned"),
        make_edge_passive("Infamous", "Favored"),
        make_edge_spent("Infamous", "Consecrated"),
        make_edge_spent("Infamous", "Anointed"),
        make_edge_spent("Infamous", "Ignorant"),
        make_edge_passive("Blessed", "Battle-Scarred"),
        make_edge_passive("Blessed", "Loyal"),
        make_edge_passive("Glorious", "Consecrated"),
        make_edge_spent("Glorious", "Cowardly"),
        make_edge_spent("Glorious", "Warned"),
        make_edge_passive("Glorious", "Devout"),
        make_edge_spent("Blessed", "Cowardly"),
        make_edge_passive("Glorious", "Wild Hunt"),
        make_edge_spent("Glorious", "Rite of Contrition"),
        make_edge_spent("Ordained", "Rite of Contrition"),
        make_edge_passive("Sacrosanct", "Favored"),
        make_edge_passive("Sacrosanct", "Resolute"),
        make_edge_spent("Sacrosanct", "Rite of Contrition"),
        make_edge_spent("Sacrosanct", "Blood Feast"),
        make_edge_spent("Sacrosanct", "Wild Hunt"),
        make_edge_spent("Anointed", "Ignoblis Ritae"),
        make_edge_spent("Anointed", "Auctoritas Ritae"));
  } else {
    other_status = _.concat(
        other_status,
        make_edge_spent("Ascendant", "Disgraced"),
        make_edge_spent("Ascendant", "Blood Hunt"),
        make_edge_spent("Ascendant", "Red Listed"),
        make_node("Blood Hunt"),
        make_node("Red Listed"),
        make_edge_passive("Blood Hunt", "Forsaken"),
        make_edge_passive("Red Listed", "Forsaken"),
        make_edge_passive("Guardian", "Warned"),
        make_edge_spent("Guardian", "Disgraced"),
        make_edge_passive("Noble", "Acclaimed"),
        make_edge_passive("Noble", "Loyal"),
        make_edge_spent("Noble", "Vulgar"),
        make_edge_spent("Privileged", "Vulgar"),
        make_edge_passive("Sovereign", "Courteous"),
        make_edge_passive("Sovereign", "Enforcer"),
        make_edge_passive("Sovereign", "Loyal"),
        make_edge_spent("Sovereign", "Sanctioned"),
        make_edge_spent("Sovereign", "Blood Hunt"),
        make_edge_spent("Primus Inter Pares", "Authority"),
        make_edge_spent("Primus Inter Pares", "Established"),
        make_edge_spent("Primus Inter Pares", "Privileged")
        );
  }

  elements = _.concat(elements, other_status);
  if ("Sabbat" == sect) {
    var ordained_rite_names = _.xor(auct_names, ["Blood Bath", "Blood Feast", "Wild Hunt"]);
    var ordained_rites = _.map(ordained_rite_names, function (n) {
      return make_edge_spent("Ordained", n);
    });
    elements = _.concat(elements,  ordained_rites);
  }
  var status_nodes = _.chain(status_traits)
    .filter(function (t) {
      if ("Sabbat" == sect) {
        return !_.eq(t.venue, "Camarilla");
      } else {
        return !_.eq(t.venue, "Sabbat");
      }
    })
    .map(function (st) {
      return {
        data: {
          id: st.name,
          label: st.name
        },
        classes: st.type
      }
    })
    .value();
  elements = _.concat(elements, status_nodes);

var cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  //autounselectify: true,
  autoungrabify: true,
  selectionType: 'single',

  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': 'white',
        'text-outline-width': 2,
        'text-outline-color': 'black',
        'label': 'data(label)'
      }
    },
    {
      selector: '$node > node',
      css: {
        'padding-top': '10px',
        'padding-left': '10px',
        'padding-bottom': '10px',
        'padding-right': '10px',
        'text-valign': 'top',
        'text-halign': 'center',
        'background-color': '#bbb'
      }
    },
    {
      selector: 'edge',
      css: {
        'target-arrow-shape': 'triangle'
      }
    },
    {
      selector: ':selected',
      css: {
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      }
    },
    {
      selector: '.highlighted',
      css: {
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      }
    },
    {
      selector: '.position',
      css: {
        'background-color': 'green',
      }
    },
    {
      selector: '.abiding',
      css: {
        'background-color': 'blue',
      }
    },
    {
      selector: '.abiding_absent',
      css: {
        'background-color': 'purple',
      }
    },
    {
      selector: '.abiding_choose_one',
      css: {
        'background-color': '#E2A76F',
      }
    },
    {
      selector: '.negative',
      css: {
        'background-color': 'red',
      }
    },
    {
      selector: '.fleeting',
      css: {
        'background-color': 'yellow',
      }
    },
    {
      selector: '.innate',
      css: {
        'background-color': '#D2B9D3',
      }
    }
  ],

  elements: elements,


  /*
  layout: {
    name: 'concentric',
    directed: true,
  }*/
  layout: {
    name: 'grid'
  }
  /*
  layout: {
  name: 'cose-bilkent',
            idealEdgeLength: 100,
            nodeOverlap: 20
  }
  */
});

  var show_text = function(lbl) {
    if (_.has(status_traits_by_name, lbl)) {
      var st = status_traits_by_name[lbl];
      console.log(status_traits_by_name[lbl]);
      $("#status_trait_flavor").html(st.flavor || "");
      $("#status_trait_passive").html(st.passive || "");
      $("#status_trait_spent").html(st.spent || "");
      if (st.type == "negative") {
        $("#st_first_text").html("Censure");
        $("#st_second_text").html("Punishment");
      } else {
        $("#st_first_text").html("Passive");
        $("#st_second_text").html("Spent");
      }
      $("#status_trait_dialog").dialog({
        modal: true,
        title: _.join([lbl, st.type, st.venue], " "),
        draggable: false,
        resizable: false,
        show: 'blind',
        hide: 'blind',
        buttons: {
          "Done": function () {
            $(this).dialog("close");
          }
        }
      });
    };
    if (_.has(positions_by_name, lbl)) {
      var p = positions_by_name[lbl];
      $("#position_dialog").load(lbl + ".html", function (response, status, xhr) {
        $("#position_dialog").dialog({
          modal: true,
          title: lbl,
          draggable: false,
          resizable: false,
          show: 'blind',
          hide: 'blind',
          buttons: {
            "Done": function () {
              $(this).dialog("close");
            }
          }
        });
      })
    };
  };

  var elements_removed;
  var currently_selected_node_id;
  var highlight_node = function(node) {
    cy.$(".highlighted").removeClass("highlighted");
    if (node.id() == currently_selected_node_id) {
      elements_removed.restore();
      elements_removed = undefined;
      currently_selected_node_id = undefined;
    } else {
      currently_selected_node_id = node.id();
      if (elements_removed) {
        elements_removed.restore();
      }
      node.addClass("highlighted");
      node.incomers().addClass("highlighted");
      node.outgoers().addClass("highlighted");
      elements_removed = cy.filter(function (i, ele) {
        return !ele.hasClass("highlighted");
      });
      elements_removed.remove();
    }
  };

  cy.on('tap', 'node', _.debounce(function(evt) {
    var node = evt.cyTarget;
    console.log( 'tapped ' + node.id() );
    highlight_node(node);
    var lbl = this.data('label');
    console.log(lbl);
    //show_text(lbl);
  }, 1000));

  cy.on('taphold', 'node', function(evt) {
    var lbl = this.data('label');
    console.log("taphold " + lbl);
    show_text(lbl);
  });

  cy.on('cxttap', 'node', function(evt) {
    var lbl = this.data('label');
    console.log("cxttap " + lbl);
    show_text(lbl);
  })
}); // on dom ready
