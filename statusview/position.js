var positions = [
  {
    name: "Archbishop",
    type: "Sabbat",
    abiding: ["Authority", "Glorious", "Ordained"],
  },
  {
    name: "Bishop",
    type: "Sabbat",
    abiding_choose_one: ["Blessed", "Enforcer"],
    abiding_absent: ["Ordained"],
  },
  {
    name: "Templar",
    type: "Sabbat",
    abiding: ["Enforcer"],
  },
  {
    name: "Ductus",
    type: "Sabbat",
    abiding: ["Blessed"]
  },
  {
    name: "Priest",
    type: "Sabbat",
    abiding: ["Ordained"]
  },
  {
    name: "Abbot",
    type: "Sabbat",
  },
  {
    name: "Cardinal",
    type: "Sabbat",
    abiding: ["Authority", "Glorious", "Sacrosanct"]
  },
  {
    name: "Regent",
    type: "Sabbat",
    abiding: ["Authority", "Commander", "Ominous", "Sacrosanct"]
  },
  {
    name: "Priscus",
    type: "Sabbat",
    abiding: ["Infamous", "Prominent", "Sacrosanct"]
  },
{
  name: "Inner Circle",
  abiding: ["Ascendant", "Authority", "Commander", "Ominous"]
},
{
  name: "Imperator",
  abiding: ["Ascendant", "Authority", "Commander"]
},
  {
    name: "Justicar",
    abiding: ["Ascendant", "Authority", "Commander"]
  },
  {
    name: "Archon",
    abiding: ["Commander", "Noble"]
  },
  {
    name: "Josian Archon",
    abiding: ["Commander", "Noble"]
  },
{
  name: "Alastor",
  abiding: ["Commander"]
},
  {
    name: "Prince",
    type: "Camarilla",
    abiding: ["Authority", "Commander", "Sovereign"]
  },
  {
    name: "Petty Prince",
    type: "Camarilla",
    abiding: ["Authority", "Sovereign"]
  },
{
  name: "Seneschal",
  abiding: ["Noble"],
  abiding_absent: ["Authority"]
},
  {
    name: "Primogen",
    type: "Camarilla",
    abiding: ["Noble"]
  },
{
  name: "Whip",
  abiding_absent: ["Noble"]
},
{
  name: "Harpy",
  abiding: ["Prominent", "Noble", "Guardian"]
},
{
  name: "Lesser Harpy",
  abiding_absent: ["Guardian"]
},
{
  name: "Keeper of Elysium",
  abiding: ["Enforcer", "Guardian"]
},
{
  name: "Sheriff",
  abiding: ["Enforcer", "Privileged"]
},
{
  name: "Deputy Sheriff"
},
{
  name: "Scourge",
  abiding: ["Enforcer"]
},
{
  name: "Elder",
  abiding: ["Confirmed", "Established", "Privileged"],
},
{
  name: "Ancilla",
  abiding: ["Confirmed"]
},
{
  name: "Neonate",
}

]

var positions_by_name = _
  .chain(positions)
  .map(function (st) {
    return [st.name, st];
  })
  .fromPairs()
  .value();
