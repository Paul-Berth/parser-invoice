const fs = require('fs');
const { infosToSearch } = require('./infos');

// todo:
// Clean data to correct format
// Find Currency
// Put comments

function cleanStr(str) {
  return str.replace(/\s+/g, ' ').trim();
}

function cleanHtml(html, writeFile = false) {
  const regexComments = /<!--.*?-->/gi;
  const regexStyle = /<style.*?>.*?<\/style>/gi;

  html = html.replace(regexComments, '');
  html = html.replace(regexStyle, '');
  html = html.replace(/(\r\n|\n|\r)/gm, '');
  if (writeFile) {
    fs.writeFile('./newhtml.html', html, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  return html;
}

function getRegInnerHtml({
  html,
  reg,
  onlyReg = true,
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

function getInfo({ html, words, onlyReg = false, keepBeforeAfter = false }) {
  const units = getRegInnerHtml({
    html,
    reg: `(${words.join('|')})`,
    onlyReg,
    keepBeforeAfter,
  });

  // Find the closest number (mix of distance character and nb tag btw them)
  const numbers = getRegInnerHtml({
    html,
    reg: '((?:€?|\\$?)\\d+(?:\\.?|,?|:?)(?:\\d+:?(?:\\d+)?)(?:€?|\\$?))',
    onlyReg: false,
  });

  const infos = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const coefDistance = 0.002;
    const coefTags = 0.998;
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

function parseSample(sample) {
  let results = {
    arrivalAddress: '',
    arrivalTime: '',
    departureAddress: '',
    departureTime: '',
    distance: 0,
    distanceUnit: '',
    duration: 0,
    distanceFee: '',
    timeFee: '',
    totalPricePaid: '',
  };

  // 1 -- CLEAN (remove comments and css)
  const html = cleanHtml(sample.html);

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

  console.log(results);
  return results;
}

const sample1 = require('./samples/sample_2').default;
parseSample(sample1);

exports.parseSample = parseSample;
