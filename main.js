const fs = require('fs');
const { infosToSearch, currencies } = require('./infos');
const sample1 = require('./samples/sample_1').default;

// ===============UTILS===============
/** Format a string to a number.
 * ex: €2,35 -> 2.35
 */
function stringToNumber(str) {
  str = str.replace(',', '.');
  const reg = new RegExp(currencies.join('|'), 'i');
  str = str.replace(reg, '');
  return parseFloat(str);
}

/** Format a string to a formatted time \d\d:\d\d or \d\d:\d\d:\d\d.
 * ex: 2:30 -> 02:30
 */
function formatTime(str) {
  const strSplit = str.split(':');
  if (strSplit.length == 2)
    str = `${strSplit[0].length > 1 ? strSplit[0] : '0' + strSplit[0]}:${
      strSplit[1].length > 1 ? strSplit[1] : '0' + strSplit[1]
    }`;
  if (strSplit.length == 3)
    str = `${strSplit[0].length > 1 ? strSplit[0] : '0' + strSplit[0]}:${
      strSplit[1].length > 1 ? strSplit[1] : '0' + strSplit[1]
    }:${strSplit[2].length > 1 ? strSplit[2] : '0' + strSplit[2]}`;
  return str;
}

/** Clean a string from spaces.
 * ex: '  a    good example   ' -> 'a good example'
 */
function cleanStr(str) {
  return str.replace(/\s+/g, ' ').trim();
}

// ===============MAIN FUNCTION===============
/** Clean html from comments, css and newlines. */
function cleanHtml(html, writeFile = false) {
  const regexComments = /<!--.*?-->/gi;
  const regexStyle = /<style.*?>.*?<\/style>/gi;

  html = html.replace(regexComments, '');
  html = html.replace(regexStyle, '');
  html = html.replace(/(\r\n|\n|\r)/gm, '');
  if (writeFile) {
    fs.writeFile('./cleanHtml.html', html, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  return html;
}

/** Clean data to normalize format. */
function cleanData(data) {
  // string to number
  typeof data?.distance == 'string' && data?.distance != ''
    ? (data.distance = stringToNumber(data.distance))
    : (data.distance = 0);
  typeof data?.distanceFee == 'string' && data?.distanceFee != ''
    ? (data.distanceFee = stringToNumber(data.distanceFee))
    : (data.distanceFee = 0);
  typeof data?.timeFee == 'string' && data?.timeFee != ''
    ? (data.timeFee = stringToNumber(data.timeFee))
    : (data.timeFee = 0);
  typeof data?.totalPricePaid == 'string' && data?.totalPricePaid != ''
    ? (data.totalPricePaid = stringToNumber(data.totalPricePaid))
    : (data.totalPricePaid = 0);
  if (data?.distanceUnit?.match(/kilo|km/i)?.length > 0)
    data.distanceUnit = 'kilomètres';

  // format time
  data.arrivalTime = formatTime(data.arrivalTime);
  data.departureTime = formatTime(data.departureTime);
  data.duration = formatTime(data.duration);

  // discount
  typeof data?.discount == 'string' && data?.discount != ''
    ? (data.discount = stringToNumber(data.discount))
    : (data.discount = 0);
  if (data.discount > 0) data.totalPricePaid -= data.discount;
  delete data.discount;

  // currency
  if (data.currency == '€') data.currency = 'EUR';
  if (data.currency == '$') data.currency = 'USD';
  return data;
}

/** Find all currencies in the inner html and return the most frequent. */
function findCurrency(html) {
  let currenciesHtml = getRegInnerHtml({
    html,
    reg: `(${currencies.join('|')})`,
  });
  currenciesHtml = currenciesHtml.map((e) => e.value);
  const currenciesHtmlType = [...new Set(currenciesHtml)];
  const max = { currency: '', value: -1 };
  for (let i = 0; i < currenciesHtmlType.length; i++) {
    const countCurrency = currenciesHtml.filter(
      (e) => e == currenciesHtmlType[i]
    ).length;
    if (countCurrency > max.value) {
      max.currency = currenciesHtmlType[i];
      max.value = countCurrency;
    }
  }
  return max.currency;
}

/** Get all match of a regex in innerHtml. */
function getRegInnerHtml({
  html,
  reg,
  onlyReg = false,
  keepBeforeAfter = false,
}) {
  const regex = new RegExp('>([^<]*?)' + reg + '([^>]*?)<', 'gi');
  const res = [...html.matchAll(regex)];
  const newRes = [];
  for (let i = 0; i < res.length; i++) {
    if (onlyReg && (cleanStr(res[i][1]) != '' || cleanStr(res[i][3]) != ''))
      continue;
    newRes.push({
      value: keepBeforeAfter
        ? cleanStr(res[i][1] + res[i][2] + res[i][3])
        : cleanStr(res[i][2]),
      index: res[i].index + res[i][1].length + 1,
    });
  }
  return newRes;
}

/** Get the value of a word in the inner html.
 * ex: words=['kilometre','kilomètre'] -> {unit: 'kilometre', value: 6.66, confidence: 2.5}
 */
function getInfo({ html, words, onlyReg = false, keepBeforeAfter = false }) {
  const coefDistance = 0.002;
  const coefTags = 0.998;

  const units = getRegInnerHtml({
    html,
    reg: `(${words.join('|')})`,
    onlyReg,
    keepBeforeAfter,
  });

  const numbers = getRegInnerHtml({
    html,
    reg: `((?:${currencies
      .map((e) => (e += '?'))
      .join('|')})\\d+(?:\\.?|,?|:?)(?:\\d+:?(?:\\d+)?)(?:${currencies
      .map((e) => (e += '?'))
      .join('|')}))`,
    onlyReg: false,
  });

  // For each unit, we filter, find the nearest number and calculate the score.
  // Score depends on the physical position and the logic position in the html.
  const infos = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    let min = { value: '', index: -100000000 };
    let max = { value: '', index: 100000000 };
    for (let i = 0; i < numbers.length; i++) {
      if (
        numbers[i].index < unit.index &&
        !html.substring(numbers[i].index, unit.index).includes('>')
      )
        continue;
      if (
        numbers[i].index > unit.index &&
        !html.substring(unit.index, numbers[i].index).includes('>')
      )
        continue;
      if (numbers[i].index < unit.index && numbers[i].index > min.index)
        min = {
          value: numbers[i].value,
          index: numbers[i].index,
          score: (unit.index - numbers[i].index) * coefDistance,
        };
      if (numbers[i].index > unit.index && numbers[i].index < max.index)
        max = {
          value: numbers[i].value,
          index: numbers[i].index,
          score: (numbers[i].index - unit.index) * coefDistance,
        };
    }
    min.score +=
      (html.substring(min.index, unit.index).split('<').length - 1) * coefTags;
    max.score +=
      (html.substring(unit.index, max.index).split('<').length - 1) * coefTags;
    infos.push({
      unit: unit.value,
      value: max.score < min.score ? max.value : min.value,
      otherValue: max.score < min.score ? min.value : max.value,
      confidence: +Math.abs(max.score - min.score).toFixed(2),
    });
  }
  return infos;
}

// ===============PARSER===============
function parseSample(sample) {
  let results = {
    arrivalAddress: '',
    arrivalTime: '',
    currency: '',
    departureAddress: '',
    departureTime: '',
    distance: 0,
    distanceUnit: '',
    duration: 0,
    distanceFee: '',
    timeFee: '',
    totalPricePaid: '',
    discount: '',
  };

  // 1 -- Clean html
  const html = cleanHtml(sample.html);

  // 2 -- Get all infos
  for (let i = 0; i < infosToSearch.length; i++) {
    const res = getInfo({
      html,
      words: infosToSearch[i].words,
      onlyReg: infosToSearch[i].onlyReg,
      keepBeforeAfter: infosToSearch[i].keepBeforeAfter,
    });
    if (infosToSearch[i].log == true) console.log(res);
    for (let j = 0; j < infosToSearch[i].keys.length; j++) {
      if (infosToSearch[i].keys[j].length == 1) {
        results[infosToSearch[i].keys[j][0]] = res?.[j]?.value || '';
        continue;
      }
      results[infosToSearch[i].keys[j][0]] = res?.[j]?.unit || '';
      results[infosToSearch[i].keys[j][1]] = res?.[j]?.value || '';
    }
  }
  results.currency = findCurrency(html);

  // 3 -- Format data
  results = cleanData(results);
  return results;
}

// const results = parseSample(sample1);
// console.log(results);

exports.parseSample = parseSample;
