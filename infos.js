const infosToSearch = [
  {
    words: ['suisse', 'france'],
    keys: [
      ['departureAddress', 'departureTime'],
      ['arrivalAddress', 'arrivalTime'],
    ],
    onlyReg: false,
    keepBeforeAfter: true,
    log: true,
  },
  {
    words: ['kilomètre', 'kilometre'],
    keys: [['distanceUnit', 'distance']],
    log: true,
  },
  {
    words: ['durée', 'duree'],
    keys: [['duration']],
    log: true,
  },
  {
    words: ['distance'],
    keys: [['distanceFee']],
    log: true,
  },
  {
    words: ['temps'],
    keys: [['timeFee']],
    log: true,
  },
  {
    words: ['sous-total'],
    keys: [['totalPricePaid']],
    log: true,
  },
];

exports.infosToSearch = infosToSearch;
