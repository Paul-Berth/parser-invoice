const infosToSearch = [
  {
    words: ['suisse', 'france'],
    keys: [
      ['departureAddress', 'departureTime'],
      ['arrivalAddress', 'arrivalTime'],
    ],
    keepBeforeAfter: true,
    log: false,
  },
  {
    words: ['kilomètre', 'kilometre'],
    keys: [['distanceUnit', 'distance']],
    log: false,
  },
  {
    words: ['durée', 'duree'],
    keys: [['duration']],
    log: false,
  },
  {
    words: ['distance'],
    keys: [['distanceFee']],
    log: false,
  },
  {
    words: ['temps'],
    keys: [['timeFee']],
    log: false,
  },
  {
    words: ['total'],
    keys: [['totalPricePaid']],
    log: false,
  },
  {
    words: ['arrondi'],
    keys: [['discount']],
    log: false,
  },
];

const currencies = ['€', '\\$', 'chf'];

module.exports = { infosToSearch, currencies };
