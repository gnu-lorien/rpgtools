angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.service('Rolls', function() {
    var self = this;
    self.rolls = [];

    self.all = function () {
        var rolls = window.localStorage['rolls'];
        if (rolls) {
            return angular.fromJson(rolls);
        }
        return [];
    };

    self.save = function (rolls) {
        window.localStorage['rolls'] = angular.toJson(rolls);
    };

    self.rollDie = function () {
        return 1 + Math.floor(Math.random() * 6);
    };

    self.rollDice = function (number) {
        return _(number)
            .range()
            .map(function () {
                return self.rollDie();
            })
            .value();
    };

    self.evaluateResult = function(roll) {
        roll.hits = _.filter(roll.result, function (r) {
            return r >= 5;
        });
        roll.glitches = _.filter(roll.result, function (r) {
            return r == 1;
        });
        roll.half = _.floor(roll.result.length / 2);
        roll.is_glitch = roll.glitches.length > roll.half;
        roll.is_critical_glitch = roll.is_glitch && roll.hits.length == 0;
        if (roll.hits.length > 10) {
            roll.difficulty = "a greater than extreme";
        } else if (roll.hits.length >= 8) {
            roll.difficulty = "an extreme";
        } else if (roll.hits.length >= 6) {
            roll.difficulty = "a very hard";
        } else if (roll.hits.length >= 4) {
            roll.difficulty = "a hard";
        } else if (roll.hits.length >= 2) {
            roll.difficulty = "an average";
        } else if (roll.hits.length >= 1) {
            roll.difficulty = "an easy";
        }
        roll.dice_message = _.join(roll.result, ", ");
        if (roll.is_critical_glitch) {
            roll.message = "CRITICAL GLITCH";
        } else {
            roll.message = "" + roll.hits.length + " hits on " + roll.final_number + " dice";
            if (roll.difficulty) {
                roll.message += " beating " + roll.difficulty + " threshold"
            } else {
                roll.message += " resulting in failure"
            }
            if (roll.is_glitch) {
                roll.message = "Glitched with " + roll.message;
            }
        }
    };

    self.rerollFailures = function(roll) {
        roll.rerolledFailures = true;
        var failures = _.remove(roll.result, function (r) {
            return r < 5;
        });
        failures = self.rollDice(failures.length);
        roll.debug.push(_.map(failures));

        var next = _.concat([], failures);
        do {
            var sixes = _.filter(next, function (r) {
                return r == 6;
            });
            next = self.rollDice(sixes.length);
            failures = _.concat(failures, next);
            roll.debug.push(next);
        } while (next.length != 0);
        roll.result = _.concat(roll.result, failures);

        self.evaluateResult(roll);
        roll.message = "Rerolled to get " + roll.message;
    };

    self.addNewRoll = function(inputroll) {
        var roll = _.defaults({}, inputroll, {
            number: "6",
            reroll: false,
            description: "Default",
            id: _.uniqueId("rolls_")
        });
        roll.final_number = math.eval(roll.number);
        roll.result = self.rollDice(roll.final_number);
        roll.debug = [_.map(roll.result)];
        if (roll.reroll) {
            var next = _.concat([], roll.result);
            do {
                var sixes = _.filter(next, function (r) {
                    return r == 6;
                });
                next = self.rollDice(sixes.length);
                roll.result = _.concat(roll.result, next);
                roll.debug.push(next);
            } while (next.length != 0);
        }
        self.evaluateResult(roll);
        self.rolls.push(roll);
        return roll;
    }
})

.factory('Status', function () {
  var status_traits = [
    {
      name: "Blessed",
      venue: "Sabbat",
      type: "abiding",
      flavor: "You are responsible for guiding the Sword of Caine, offering gentle persuasion and mild condemnation. While you hold this office, you are entrusted to provide leadership.",
      passive: "While you possess Blessed, you can award any individual the fleeting status Battle-Scarred or Loyal without expending this status. An individual can only hold a single status from your Blessed at a time, but can benefit from repeated uses of Blessed so long as they originate from separate sources.",
      passive_can_award: ["Battle-Scarred", "Loyal"],
      spent: "You can expend the status Blessed to assign the negative status Cowardly to an individual who behaves inappropriately within your jurisdiction.",
      spent_can_award: ["Cowardly"]
    },
    {
      name: "Loyal",
      type: "fleeting",
      flavor: "You have proven your loyalty to your sect. Other individuals do not question your allegiance to sect law and custom.",
      passive: "If you receive the Warned status while you possess Loyal, the status of Loyal is stripped without expenditure rather than applying the status Warned.",
      passive_sacrifice_block: ["Warned"],
      spent: "You may expend Loyal to acquire any one piece of equipment or general information (such as the known location of another character) on short notice. This assistance comes from NPC minions of your sect within five minutes of this expenditure. You cannot use Loyal to gain secret or protected information, or unique equipment, but you can use it to acquire anything that a group of ghouls or low-level vampires can acquire with relative ease."
    },
    {
      name: "Cowardly",
      venue: "Sabbat",
      type: "negative",
      flavor: "Others question your courage, and your activities in combat have been a hindrance to the Sabbat. You have been condemned by a minor rite of the sect, and you must suffer the burden of your failures. You must learn to be more resilient, less afraid, and it is the duty of others in the sect to toughen you up.",
      passive: "The Cowardly status has no censure; so long as you possess Cowardly, you are affected by the punishment of this status. Cowardly remains for four games or two months, whichever is longer. Anyone who causes a Cowardly character injury (but not death) or defeats that character in a symbel or Monomacy gains the fleeting status trait Praised.",
      spent: "While you hold the Cowardly status, your maximum Willpower is reduced by 1. Once this status is removed, your Willpower returns to normal."
    },
    {
      name: "Glorious",
      venue: "Sabbat",
      type: "abiding",
      flavor: "You are a sacred figure within the Sabbat. You hold a prestigious position and are tasked with the responsibility of leading the sect in matters both religious and martial.",
      passive: "While you possess Glorious, you can award an individual the fleeting status traits Consecrated or Devout, without expending the Glorious status. Further, you can issue orders to any member of your sect who does not possess the status Authority or Sacrosanct and expect to have those orders obeyed. Those who defy you or disobey a direct order have all fleeting status traits they possess expended without effect. Fleeting traits lost in this manner are lost temporarily and return after two games or one month. Your target cannot gain any further fleeting status while under this effect.",
      spent: "You can expend the status Glorious to order someone to perform a Rite of Contrition. You may expend the status Glorious to assign an individual either the Cowardly or Warned negative status."
    },
    {
      name: "Ignorant",
      venue: "Sabbat",
      type: "negative",
      flavor: "If your presence causes a ritual to fail, or if you prove your ignorance and doubt to important members of the sect, you become the object of scorn and ridicule.",
      passive: "While you carry the Ignorant status, you may not actively participate in a Sermon of Caine (you may listen, but not preach), and you may not proselytize the doctrine of the sect, nor quote the Book of Nod in public. Further, you must listen and pay attention to any sermons performed, and you may not contradict anyone who is quoting doctrine or the religious philosophy of the sect." ,
      spent: "If you disobey the censure of the Ignorant negative status, you cannot be positively affected by the magic of the Ignoblis or Auctoritas Ritae. You may still participate in the ritae, and negative effects still apply."
    },
    {
      name: "Scholar",
      venue: "Sabbat",
      type: "fleeting",
      flavor: "Paths of Enlightenment are sacred to the Sabbat, and those who adopt such moralities are outspoken and vociferous in converting others. When you tutor another character in your Path of Enlightenment and she purchases the merit to convert to your path, your Priest can award you this status." ,
      passive: "While you possess Scholar, you gain 1 less Beast trait for any violation of your path, to a minimum of 0. The Scholar status trait lasts for four games or two months, whichever is longer.",
      spent: "The Scholar status cannot be expended."
    },
    {
      name: "Resolute",
      venue: "Sabbat",
      type: "fleeting",
      flavor: "Your bravery and endurance in combat have gained the approval \
of important members in the sect, and they have rewarded you \
for those outstanding efforts.",
      passive: "While you possess Resolute, you have a +3 \
wild card bonus to resist fear frenzy.",
      spent: "You can expend Resolute to gain a free \
Willpower retest when challenging to avoid any effect \
that would force you to leave combat. Only one \
Resolute can be spent to retest against an individual \
per combat scenario."
    },
    {
      name: "Devout",
      venue: "Sabbat",
      type: "fleeting",
      flavor: "You have been recognized for your dedication to Caine and your \
adherence to the doctrine of the sect.",
      passive: "For each Devout status you possess, once per \
game you can expend a Blood point and spend five \
minutes praying, meditating, or studying the doctrine \
of Caine. When you do, you heal a point of aggravated \
damage."
    },
    {
      name: "Consecrated",
      venue: "Sabbat",
      type: "fleeting",
      flavor: "On occasion, those who are elevated among the Cainites of the \
Sabbat will recognize another vampireâs intelligence and ambition, \
consecrating her with the blood of religious approbation.",
      passive: "While  you  possess  Consecrated,  you \
automatically win the static challenge to awaken \
during the day. You must still pay all other costs of \
awakening, as covered in Chapter Seven: Dramatic \
Systems, Daytime, page 293.",
      spent: "You can expend Consecrated when another \
character would gain Beast traits for an action that \
someone on your Path of Enlightenment would not \
gain Beast traits for performing. The other character \
gains no Beast traits for performing this action."
    },
    {
      name: "Battle-Scarred",
      venue: "Sabbat",
      type: "fleeting",
      flavor: "You have often thrown yourself into battle, and the tales of your \
exploits have spread through the sect. You have been sanctified in \
a private ceremony lauding your fearlessness and valor.",
      passive: "While you possess Battle-Scarred, when you \
reach the Incapacitated wound track for the first time \
in a night, you immediately heal 2 health levels.",
      spent: "So long as you are not in the process of violating \
the laws of your sect, you can expend Battle-Scarred to \
use the assist attacker or assist defender mass combat \
tactic without spending the action that would normally \
be required for these tactics. This does not prevent you \
from initiating these tactics with your normal actions \
in the same round.",
    },
    {
      name: "Anointed",
      venue: "Sabbat",
      type: "fleeting",
      flavor: "Typically, the clergy and Priests of the sect are the ones with the \
rightful authority to initiate the Auctoritas Ritae. Under some \
circumstances, those who have studied the ritae but do not \
currently hold position (clergy or pack) are given temporary \
permission to lead large rituals.",
      passive: "The Anointed status has no passive benefit.",
      spent: "Expend Anointed to initiate and perform a \
specifically defined Ignoblis or Auctoritas Ritae (one \
your patron could cast). This action grants permission \
for anyone with the Rituals ability to initiate such a ritae; \
it does not grant levels of the Rituals background or \
knowledge of ritus the character does not already possess."
    },
    {
      name: "Purified",
      venue: "Sabbat",
      type: "innate",
      flavor: "As a member of the Sabbat Inquisition, you are charged with the \
duty to seek out heretics and infernalists within the sect.",
      passive: "While you possess Purified, you can name \
someone who falls under the definition of heresy (see \
page 426) as a heretic, giving her the Disgraced status.",
      spent: "You can expend the Purified status to remove \
the stigma of heretic from an individual who has been \
proven innocent of heresy and give her an ad cautelum \
(see page 425). The ad cautelum lasts for six games or \
three months, whichever is longer."
    },
    {
      name: "Branded",
      venue: "Sabbat",
      type: "innate",
      flavor: "You bear the black crescent on your right palm, marking you \
eternally as a member of the elite order known as the Black \
Hand. From operative to Seraphim, all who join the Hand are \
branded with this symbol of loyalty to the Sabbat.",
      passive: "While you possess the Branded status, any \
member of the Sabbat who physically attacks you or \
is discovered using a power on you against your will, \
gains the negative status Warned. Powers that can be \
justified as âmonitoring your brothersâ (such as Scry, \
Clairvoyance, or Heightened Senses) do not trigger \
this effect.",
      spent: "You can expend the Branded status in order to \
command a member of the Sabbat to expend a status on \
your behalf, give you a piece of equipment she possesses, \
or utilize her powers as you direct, so long as that order \
does not cause her to break the Code of Milan. If she \
refuses to do so, she gains the status Disgraced."
    },
    {
      name: "Warned",
      type: "negative",
      flavor: "You have been warned to cease your poor behavior. Should you \
continue acting in this manner, you will be severely punished for \
your continued malfeasance",
      passive: "While you carry the Warned status, you \
may not speak to any officer of your sect in public \
unless that officer first speaks to you; further, you may \
not contradict an officer of your sect. If you speak \
inappropriately, or contradict an officer, you can avoid \
breaking this censure by apologizing and offering the \
officer a minor boon. \
Creative officers may impose alternate restrictions. \
These might include cutting off the offenderâs finger \
and ordering the Warned character not to regrow it until \
this status is removed or forcing the offender to bear \
a visible mark of failure for the duration of the status \
Warned. These alternate restrictions cannot be used to \
significantly handicap a character or to force a character \
into a dangerous situation. If the Storyteller believes this \
status is being abused, she may overrule the alternate \
restriction and impose the default censure instead. \
The Warned negative status lasts for two games or one \
month, whichever is longer. If a character receives \
another Warned status while she already possesses \
Warned, the total duration is increased by two games \
or one month, whichever is longer. This continues with \
every further application of Warned.",
      spent: "If a character with the Warned status is \
found to break the censure of this status, she gains the \
additional status trait Disgraced. A character does not lose \
the negative status Warned when she receives Disgraced."
    },
    {
      name: "Disgraced",
      type: "negative",
      flavor: "Your activities have placed a stain on your reputation; you are \
distinctly out-of-favor among your sectmates.",
      passive: "While you carry the Disgraced status, the sect \
prohibits you from carrying weapons or actively using \
powers in the presence of an officer of your sect, unless you \
    receive the officer's express permission. Further, you may \
not feed within your sect's territories, but must seek scraps \
elsewhere. A character cannot spend or gain status while \
she possesses the Disgraced status trait. Other characters \
are not required to repay boons owed to a character \
possessing this status. If you are found in violation of this \
censure by a sect officer, you can avoid punishment by \
apologizing and offering the officer a major boon. \
Anyone who publicly insults a Disgraced character gains \
the fleeting status trait Praised. Multiple characters can \
gain status for insulting a Disgraced individual, but \
no character can benefit from a single individualâs \
Disgraced censure more than once per game. \
The Disgraced status lasts as long as you hold one or \
more Warned negative status traits. If you do not \
possess a Warned negative status when you are awarded \
Disgraced, then the negative status lasts for two games \
or one month, whichever is longer.",
      spent: "If a character with the Disgraced status is \
found to break the censure of this status, she gains the \
additional status trait Forsaken. A character does not \
lose the negative status Warned or Disgraced when she \
receives Forsaken."
    },
    {
      name: "Forsaken",
      type: "negative",
      flavor: "You have broken society's boundaries so often that the sect has \
ceased to grant you its protection. Although you may or may not be \
actively hunted, your death would not count as a breach of sect law.",
      passive: "While you hold the Forsaken negative status, \
you are no longer considered Accepted by your sect. You \
hold no status or position, and you may be destroyed \
without repercussion from your sect. Society's laws \
prohibiting your Final Death no longer apply to you. \
A character who possesses the Authority status trait \
may allow you to visit or reside within her domain, but \
cannot remove the Forsaken negative status without \
an expenditure of the Authority status. A Forsaken \
character retains this status until she is formally \
forgiven by a character expending the Authority status \
on her behalf. \
Normally a character cannot become Forsaken unless she \
was first Warned and then Disgraced. However, it is possible \
for some sect officers to declare an individual Forsaken \
by their sect as part of a formal hunt for that characterâs \
Final Death. If another sect member kills a vampire who \
possesses the status trait Forsaken, that individual gains \
the status trait Triumphant. Only one character may gain \
status from the death of a Forsaken vampire.",
      spent: ""
    },
    {
      name: "Infamous",
      venue: "Sabbat",
      type: "abiding",
      flavor: "Offering advice to a sect of vampires is a delicate business, and \
those who are elevated to such station quickly become well- \
known throughout the Sword of Caine.",
      passive: "While you possess Infamous, an individual who \
openly insults, threatens, or attacks you automatically \
receives the negative status Warned. Offenses made \
entirely in private, or which are subtle enough to be \
obscured, do not trigger this passive effect. Characters \
who currently possess the Sacrosanct or Triumphant status \
traits are immune to this passive effect. You can award \
the fleeting status Favored without expending this status.",
      spent: "You can expend Infamous to award an individual \
the fleeting status Consecrated or Anointed, or the \
negative status Ignorant."
    },
    {
      name: "Loyalist",
      venue: "Sabbat",
      type: "abiding",
      flavor: "As a Loyalist, you are proud of your freedom. You are capable \
of ignoring the commands from the clergy (but not the Regent \
himself), without being indirectly punished for your defiance.",
      passive: "You are immune to the passive and spent \
effects of the status Glorious.",
      spent: "The Loyalist status cannot be expended."
    },
    {
      name: "Ordained",
      venue: "Sabbat",
      type: "abiding",
      flavor: "You have been consecrated with the rites of the Church of the \
Dark Father and taken sacred vows to serve your fellow Cainites. \
Your faithfulness is an inspiration to the sect.",
      passive: "While you possess Ordained, you can perform \
the Ignoblis Ritae without expenditure. While you \
possess Ordained, you can award the fleeting status \
Devout without expending the Ordained status. An \
individual can only hold a single status from your use of \
Ordained at a time, but can benefit from repeated uses of \
Ordained so long as they originate from separate sources.",
      spent: "Expend Ordained to initiate and perform all \
Auctoritas Ritae of the sect, except for the Blood Bath, \
the Blood Feast, and the Wild Hunt ritae. You can also \
expend Ordained to grant a target Anointed or Battle- \
scarred, to award the negative status Ignorant to anyone \
who behaves inappropriately within your jurisdiction, \
or to order someone to perform a Rite of Contrition."
    },
    {
      name: "Sacrosanct",
      venue: "Sabbat",
      type: "abiding",
      flavor: "You are an ultimate authority within the Sabbat. Your commands \
are sacred, and your will is hallowed among the sect. You also \
have the right to perform any of the Auctoritas Ritae.",
      passive: "While you possess Sacrosanct, you are immune \
to the powers of, and may contradict orders given by, \
any individual who does not also have the Sacrosanct \
status. You can, without expenditure, initiate any \
Ignoblis Ritae, and all Auctoritas Ritae except the \
Blood Feast and the Wild Hunt. Lastly, you can award \
an individual the fleeting status Favored or Resolute \
without expending Sacrosanct.",
      spent: "Expend Sacrosanct to order someone to undergo \
a Rite of Contrition, to perform the Blood Feast, or to \
initiate the ritus of the Wild Hunt against a target. \
Sacrosanct can also be spent to issue letters patent, \
altering the practices of the sect within your jurisdiction. \
The power to issue letters patent is further defined by \
each position that provides Sacrosanct."
    },
    {
      name: "Authority",
      type: "abiding",
      flavor: "You enjoy complete control over your jurisdiction. You may issue \
praise and respect, or command punishment â corporal or capital \
â to all those within.",
      passive: "While you possess Authority, you can award \
an individual the fleeting status Courageous, Defender, \
Honorable, or Loyal or without expending this status. An \
individual can only hold a single status from your use of \
Authority at a time, but can benefit from repeated uses of \
Authority, so long as they originate from separate sources.",
      spent: "You can expend Authority to punish or pardon \
another character, giving or removing the negative \
status Warned or Forsaken."
    },
    {
      name: "Commander",
      type: "abiding",
      flavor: "You are a sword of your sect, empowered by the highest leadership \
to enforce justice anywhere within the sectâs dominion. You can \
administer punishments, both corporal and social, as you see fit.",
      passive: "While you possess Commander, you may issue \
orders to any member of your sect who does not possess \
the status Authority, and you expect those orders to be \
obeyed. Those who defy you or disobey a direct order \
have all fleeting status traits they possess expended \
without effect. Fleeting traits lost in this manner are \
lost temporarily, and they return after one month or \
two games. The target cannot gain any further fleeting \
status while under this effect. Further, you may award \
up to three individuals the status Enforcer for a single \
night, deputizing them under your command.",
      spent: "You may expend Commander to award fleeting \
status to up to three characters, awarding each \
individual either Courageous or Loyal."
    },
    {
      name: "Enforcer",
      type: "abiding",
      flavor: "You are authorityâs right hand. You have the power to enforce \
societyâs laws and to ensure punishment for those who break the \
codes of your sect or defy the will of the local authority.",
      passive: "While you possess Enforcer, you may carry \
weapons to any gathering, including restricted locations. \
Vampiric authorities must allow you to go armed. (Note \
that mortal authorities, and individuals not of your sect, \
are under no such agreement.) You may also deputize \
up to two other members of your sect, granting them \
the fleeting status Defender for a single night.",
      spent: "You can expend Enforcer to issue the negative \
status Warned to an individual whom you legitimately \
believe has broken the law of your sect or local domain."
    },
    {
      name: "Established",
      type: "abiding",
      flavor: "You are a voice of a faction within the sect, possibly the leader of \
a clan, pack, or gang. Your words are respected, and others seek \
your advice in difficult decisions.",
      passive: "While you possess Established, an individual \
who openly insults, threatens, or attacks you \
automatically receives the negative status Warned. \
Offenses made entirely in private, or which are subtle \
enough to be obscured, do not trigger this passive \
effect. Characters that currently possess the Authority, \
Commander, or Triumphant status traits are immune to \
this passive effect.",
      spent: "You can expend Established to award an \
individual the fleeting status Favored."
    },
    {
      name: "Prominent",
      type: "abiding",
      flavor: "You are societyâs voice, and others listen to you on matters of \
propriety. You can determine which actions are proper social \
behavior and which actions are against the customs of your sect.",
      passive: "While you possess Prominent, you may award \
any individual the fleeting status Honorable or Courteous \
without expending this status. An individual can only \
hold a single status from your Prominent at a time, but \
can benefit from repeated uses of Prominent so long as \
they originate from separate sources.",
      spent: "If you expend Prominent, an individual you \
target must physically leave a scene (small area or \
single room) for the next 10 minutes, effectively exiling \
them from a social situation. If they do not do so, they \
gain the negative status Disgraced. Prominent cannot be \
expended in combat."
    },
    {
      name: "Courteous",
      type: "fleeting",
      flavor: "Your words and actions are always the height of Kindred courtesy. \
You are known to adhere the customs of your sect and provide a \
genteel role-model for others",
      passive: "While you possess Courteous, you cannot be \
targeted by another characterâs use of the Subterfuge \
skill to redirect blame for the use of a supernatural \
power. For more information on the Subterfuge system \
mechanic, see Chapter Three: Character Creation, \
page 97.",
      spent: "You can expend Courteous to overcome any \
political gaffe or etiquette-related error you have made \
in the last five minutes. The error did occur, but those \
who would be offended by it must accept your apology \
and cannot hold the error against you."
    },
    {
      name: "Courageous",
      type: "fleeting",
      flavor: "You have often thrown yourself into battle or controversy, and \
the tales of your exploits have spread through the sect. You are \
known for your courage and competitive prowess.",
      passive: "While you possess Courageous, you can use \
a combat maneuver once per game without spending \
Willpower. You can only use this passive ability when \
following the directives of someone who possesses the \
Authority or Commander abiding status.",
      spent: "So long as you are not in the process of violating \
the laws of your sect, you may expend Courageous to \
allow one character (yourself or another individual) to \
use a combat maneuver without spending Willpower."
    },
    {
      name: "Defender",
      type: "fleeting",
      flavor: "You have been chosen to protect the citizens of your sect, in part \
or in whole, and as such, you are allowed to carry weapons into \
peaceful gatherings.",
      passive: "While you possess Defender, you may carry \
weapons to any gathering, including restricted locations. \
Vampiric authorities must allow you to go armed. (Note \
that mortal authorities, and individuals not of your sect, \
are under no such agreement.)",
      spent: "You may expend Defender when you perform an \
action that would cause you to gain Beast traits to reduce \
the number of Beast traits gained by 1. You cannot use \
more than one Defender status on a single sin."
    },
    {
      name: "Favored",
      type: "fleeting",
      flavor: "You have been lauded by a patron within your clan or sect. This \
patron supports your advancement and shields you from harm.",
      passive: "While you possess Favored, you are known to \
have the active support of a patron. An individual who \
openly attacks you automatically receives the negative \
status Warned. Characters who currently possess the \
Authority, Commander, or Triumphant status traits are \
immune to this passive effect.",
      spent: "If you expend Favored when someone awards \
you negative status, that negative status is negated \
before it is applied. The same character cannot attempt \
to award you negative status for the rest of the evening."
    },
    {
      name: "Honorable",
      type: "fleeting",
      flavor: "In a world of lies, deception, and subterfuge, you are known for \
your sterling reputation. Your word is solid enough that it can even \
protect others; all you need do is give your oath on their behalf",
      passive: "While you possess Honorable, individuals \
who wish to openly accuse you of lying must expend \
one positive status (of any kind) in order to make \
the accusation. Even if you possess more than one \
Honorable trait, only one status must be expended to \
overcome this passive effect.",
      spent: "You can expend Honorable during a scene in \
which you would otherwise be politically forced to \
leave. You are allowed to join the scene or remain \
present. When you expend Honorable in this manner, \
you are immune to the spend bonus of the abiding \
status Prominent for the rest of the scene."
    },
    {
      name: "Praised",
      type: "fleeting",
      flavor: "You have rightfully obeyed the custom of status, enforcing peer \
pressure on an individual who has been socially incompetent, or \
otherwise upholding the social norm. Your presence is welcomed \
in the territories of your patron.",
      passive: "",
      spent: "You can expend Praised to claim a small favor \
(the level of assistance required from a trivial boon) \
from any other Accepted member of your sect. You \
cannot use this to gain a boon from a character who is \
already in your debt."
    },
    {
      name: "Triumphant",
      type: "fleeting",
      flavor: "You have publically defeated an impressive enemy of the sect \
without aid or otherwise performed a critical and life-risking \
service to your sect. When this event occurs, you gain the status \
trait of Triumphant. \
The status trait Triumphant can only be given by NPCs. For \
more information on gaining this status, check the setting \
guide for your chronicle or speak with your Storyteller.",
      passive: "While you possess Triumphant, you are granted \
special privileges at important gatherings of your sect: \
the best seating, advance notice of important attendees, \
and other advantages. You are granted the right to feed \
in any domain controlled by your sect. The number of \
downtime actions required for you to feed is reduced by \
1, to a minimum of 0.",
      spent: "You can expend Triumphant to ignore the \
censure of all negative status possessed by you or \
another character for one hour. You gain this benefit \
even if you have negative status that would otherwise \
prevent you from using status traits."
    },
    {
      name: "Victorious",
      type: "fleeting",
      flavor: "You have participated in a symbel, whether a duel or an ordeal, \
and emerged victorious. The sect lauds your prowess.",
      passive: "On the night you gain the Victorious status \
trait, other characters capable of giving positive status \
can give you such status without expenditure.",
      spent: "You can expend Victorious when you expend \
any other status to immediately regain the spent trait. \
Alternately, you can expend the Victorious status to \
remove Warned from yourself or another character \
within the same jurisdiction where you gained the \
Victorious trait."
    },
    {
      name: "Ascendant",
      venue: "Camarilla",
      type: "abiding",
      flavor: "You are an ultimate authority within the Camarilla. Your voice can shake political mountains and alter the sects future.",
      passive: "While you possess Ascendant status, you are \
immune to the powers of, and may contradict orders \
given by, any individual who does not have the \
Ascendant status.",
      spent: "Expend the status trait Ascendant to give your \
target the negative status Disgraced or to initiate \
a blood hunt against your target that is global in \
scope. If Ascendant is expended three times to target \
the same individual (all from different sources), the \
individual is Red Listed. If you are blood hunted or \
Red Listed, you receive the negative status Forsaken, \
which applies to all Camarilla domains. Further, the \
possessor of Ascendant may also expend this status \
to issue a doctrinal edict altering the practices of the \
sect. The power to issue edicts is further defined by \
each position that provides Ascendant."
    },
    {
      name: "Confirmed",
      venue: "Camarilla",
      type: "abiding",
      flavor: "You are a staunch member of the sect, trusted to know and \
uphold sect laws. You are given more credibility and respect than \
those who are new or untested.",
      passive: "While you possess Confirmed, you \
may approach any officer of the sect without a formal \
introduction, without social penalty.",
      spent: "You can expend Confirmed to order a \
non-supernatural mortal (including ghouls, revenants \
and the like) who is beholden to your sect to obey your \
instructions, unless they directly contradict with prior \
orders from the mortals master (domitor, etc.). If the \
target refuses, you have the authority to kill the mortal \
(or have her killed) without reprisal, as part of the \
Camarillas rules of social conduct. Confirmed cannot \
be expended in combat."
    },
    {
      name: "Guardian",
      venue: "Camarilla",
      type: "abiding",
      flavor: "You are a protector of one of the most important customs of the \
Camarilla: either the physical champion of Elysium or the social \
conscience of the Kindred court. Your power within that specific \
arena is formidable.",
      passive: "While you possess Guardian, you may award \
the negative status Warned to anyone who behaves \
inappropriately within your jurisdiction or does not \
respect the authority of your proclamations.",
      spent: "You may expend the status trait Guardian to \
award someone the negative status Disgraced. Keepers \
of Elysium may thus punish defilers of Elysium, calling \
them Profane, while Harpies may punish someone \
who has been proven to have broken a legitimate boon, \
calling them Boonbreaker."
    },
    {
      name: "Noble",
      venue: "Camarilla",
      type: "abiding",
      flavor: "You are responsible for guiding a small faction of your sect, offering \
gentle persuasion and mild condemnation. While you hold this \
office, you must guide your fellows and provide a Noble example",
      passive: "While you possess Noble status, you may \
award any individual the fleeting status Acclaimed or \
Loyal without expending this status. An individual can \
only hold a single status from your Noble status at a \
time, but may benefit from repeated uses of Noble so \
long as they originate from separate sources.",
      spent: "Expend Noble to award an individual who has \
caused significant offense the negative status Vulgar."
    },
    {
      name: "Privileged",
      venue: "Camarilla",
      type: "abiding",
      flavor: "You are a venerated member of your sect, and vampires give your \
opinion great weight. The sect owes you respect.",
      passive: "While you possess Privileged, you cannot be \
openly or effectively accused of lying unless the accuser \
possesses the status traits Privileged, Commander, \
Triumphant, or Authority. This does not mean other \
characters must believe what you say, only that they \
cannot publically challenge its veracity.",
      spent: "You may expend Privileged status to give \
someone the Vulgar negative status trait."
    },
    {
      name: "Sovereign",
      venue: "Camarilla",
      type: "abiding",
      flavor: "You hold praxis over one of the domains of the Camarilla. So long \
as you are within your domain, your order is inviolate according \
to the Second Tradition.",
      passive: "While you possess Sovereign status, you control \
the praxis of a domain. You may award an individual \
the fleeting status Courteous, Enforcer, or Loyal without \
expending this status. An individual can only hold a \
single status from your use of Sovereign at a time, but may \
benefit from repeated uses of Sovereign so long as they \
originate from separate sources. Further, you cannot be \
openly contradicted within the domain where you hold \
praxis, unless the individual possesses either the status \
trait Privileged or the status trait Authority.",
      spent: "Expend the status trait Sovereign to  give your \
target the fleeting status Sanctioned or to initiate \
a blood hunt against your target. If you are blood \
hunted, you are considered to have the negative \
status Forsaken while in that Princes city. This has no \
effect if you travel to a city where you are not blood \
hunted . If the wielder of this status dies or is removed \
from praxis, your blood hunt is also removed."
    },
    {
      name: "Architect",
      venue: "Camarilla",
      type: "innate",
      flavor: "You fought for the Camarilla during the Anarch Revolt and were \
present at the signing of the Treaty of Thorns. You are considered \
one of the founding members of the Camarilla.",
      passive: "While you hold the status Architect, \
you are granted special privileges. You may attend and \
witness any Judicial Conclaves (but may not speak \
unless given permission), and you may approach and \
petition any Justicar or hosting Prince at a conclave.",
      spent: "You may spend the Architect status to \
place an item on the agenda as a topic for the Speaker \
at conclave. Unless you specifically wish to include \
your name, the item will be listed simply as, Submitted \
for consideration by an Architect of the Camarilla."
    },
    {
      name: "Primus Inter Pares",
      venue: "Camarilla",
      type: "innate",
      flavor: "When a conclave is called, the Prince who hosts the conclave \
is considered First Among Equals. She gains this status for the \
duration of the conclave.",
      passive: "While you possess Primus Inter Pares, your \
Authority status outranks other possessors of Authority. \
Passive and expended status effects that cannot target \
someone with Ascendant also cannot target you, and \
uses of Authority cannot undo your uses of status.",
      spent: "Primus Inter Pares may be spent to expend \
another characters Authority, Established, or Privileged \
status without effect, or to undo any previous use of \
those status traits within your domain."
    },
    {
      name: "Acclaimed",
      venue: "Camarilla",
      type: "fleeting",
      flavor: "You have publically protected the Masquerade or otherwise \
upheld the Traditions when they were in jeopardy. You have been \
lauded by the sect. Your friends, allies, and hangers-on bask in \
the glory of your acclaim.",
      passive: "While you possess Acclaimed, you may extend \
the passive bonus of any one status you currently \
possess (which is not expended) to one individual per \
night. This bonus lasts for one hour, so long as they \
remain within 10 feet of you.",
      spent: "You may expend Acclaimed to request that an officer \
of the sect share her views or offer advice, publically or \
privately (as you wish), about a subject that is pertinent to \
the domain. This may be used to further political agendas \
or for personal gain, such as having the Prince speak \
about your party in order to encourage people to go or to \
maneuver a rival into saying something compromising."
    },
    {
      name: "Gallant",
      venue: "Camarilla",
      type: "fleeting",
      flavor: "You have fulfilled a great boon-debt (such as a blood boon or a \
life boon) to an individual of significance within the Camarilla \
(such as an elder of the Camarilla, a Prince, or even a Justicar). \
That vampires good word travels far, convincing others to allow \
you a bit of latitude in your social dealings.",
      passive: "",
      spent: "You can expend Gallant to overcome any \
political or etiquette-related error you have made in \
the last five minutes. The error did occur, but those \
who would be offended by it must accept your apology, \
and may not hold the error against you."
    },
    {
      name: "Sanctioned",
      venue: "Camarilla",
      type: "fleeting",
      flavor: "You have been granted permission to be an exception to the laws \
of the sect. This responsibility is not conferred lightly, and misuse \
of this status will be punished in turn.",
      passive: "",
      spent: "When granted, this status allows a specifically \
defined breach of one sect law. You can expend \
Sanctioned to break that law without incurring \
punishment. This action is a exception to the specific \
law, allowed by an Authority of a domain."
    },
    {
      name: "Vulgar",
      venue: "Camarilla",
      type: "negative",
      flavor: "Youve committed some minor grievance against the Camarilla, \
enough to be scolded, but not so much as to be severely censured. \
You should learn from your mistakes, or you will be punished \
more harshly.",
      passive: "All fleeting status traits you possess are \
expended without effect. Fleeting traits lost in this \
manner are lost temporarily and return at the end of \
the game session. You cannot gain any further fleeting \
status while under this effect. The Vulgar trait lasts only \
for the night in which you are given the status.",
      spent: "If you receive a second Vulgar, this \
negative status automatically upgrades to Warned."
    }
  ];

  _.each(status_traits, function (st) {
    st.id = _.uniqueId(st.name);
    if (!_.has(st, "venue")) {
      st.venue = "Generic";
    }
  });

  var status_traits_by_name = _
    .chain(status_traits)
    .map(function (st) {
      return [st.name, st];
    })
    .fromPairs()
    .value();

  return {
    all: function() {
      return status_traits;
    },
    by_name: function() {
      return status_traits_by_name;
    },
    get: function(id) {
      return _.find(status_traits, function(st) {
        return st.id == id;
      })
    }
  }
});
