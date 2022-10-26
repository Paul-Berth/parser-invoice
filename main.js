const fs = require('fs');

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

function getRegInnerHtml(html, reg, keepBefore = false) {
  const regex = new RegExp('((?=[^>]+?))' + reg, 'gi');
  const res = [...html.matchAll(regex)];
  // if (keepBefore == true) console.log(res);
  const newRes = [];
  for (let i = 0; i < res.length; i++) {
    if (res[i][1].includes('<')) continue;
    // if (keepBefore == true && i == 0)
    //   console.log([
    //     html
    //       .substring(
    //         res[i].index - 1000 > 0 ? res[i].index - 1000 : 0,
    //         res[i].index
    //       )
    //       .trim()
    //       .slice(-1) != '>',
    //   ]);
    if (
      res[i].index > 0 &&
      html
        .substring(
          res[i].index - 1000 > 0 ? res[i].index - 1000 : 0,
          res[i].index
        )
        .trim()
        .slice(-1) != '>'
    )
      continue;
    console.log([res[i][1], res[i][2]]);
    newRes.push({
      value: keepBefore ? cleanStr(res[i][1] + res[i][2]) : cleanStr(res[i][2]),
      index: res[i].index + res[i][1].length,
    });
  }
  return newRes;
}

function getInfo(html, words, keepBefore = false) {
  const unit = getRegInnerHtml(
    html,
    `(${words.join('|')})`,
    keepBefore
  )?.[0] || {
    value: '',
    index: 0,
  };

  // Find the closest number (mix of distance character and nb tag btw them)
  const numbers = getRegInnerHtml(
    html,
    '((?:€?|\\$?)\\d+(?:\\.?|,?|:?)(?:\\d+:?(?:\\d+)?)(?:€?|\\$?))'
  );

  const coefDistance = 0.002;
  const coefTags = 0.998;
  let min = { value: '', index: -100000000 };
  let max = { value: '', index: 100000000 };
  for (let i = 0; i < numbers.length; i++) {
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
  return {
    unit: unit.value,
    value: max.score < min.score ? max.value : min.value,
    otherValue: max.score < min.score ? min.value : max.value,
    confidence: +Math.abs(max.score - min.score).toFixed(2),
  };
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

  // =================================================
  // 2 -- ADDRESS && TIME
  // const resultsAddTime = getAddTime(html);
  // results = { ...results, ...resultsAddTime };
  const address = getInfo(html, ['suisse'], true); // put all the countries name
  // juste garder le premier groupe du match, c-a-d le match de '>' au mot matché
  console.log(address);
  results.departureAddress = address.unit;
  results.departureTime = address.value;

  // 3 -- DISTANCE && DISTANCEUNIT
  const distance = getInfo(html, ['kilomètre', 'kilometre']);
  console.log(distance);
  results.distanceUnit = distance.unit;
  results.distance = distance.value;

  // 4 -- DURATION
  const duration = getInfo(html, ['durée', 'duree']);
  console.log(duration);
  results.duration = duration.value;

  // 6 -- DISTANCEFEE
  const distancefee = getInfo(html, ['distance']);
  console.log(distancefee);
  results.distanceFee = distancefee.value;

  // 7 -- TIMEFEE
  const timefee = getInfo(html, ['temps']);
  console.log(timefee);
  results.timeFee = timefee.value;

  // 8 -- TOTALPRICEPAID && CURRENCY
  const totalPricePaid = getInfo(html, ['sous-total']);
  console.log(totalPricePaid);
  results.totalPricePaid = totalPricePaid.value;

  console.log(results);
  return results;
}

const sample1 = require('./samples/sample_2').default;
parseSample(sample1);

exports.parseSample = parseSample;

// function regexHtml(tag, classAttr) {
//   return new RegExp(
//     `<${tag}[^>]*?class="[^"]*?(?:${classAttr.join(
//       '|'
//     )})[^"]*?"[^>]*?>(.*?)</${tag}>`,
//     'gi'
//   );
// }

// function getAddTime(html) {
//   const regexTime = /(\d+:\d+)/gi;
//   const regexInnerHtmlStart = /^([^<]+?)/gi;
//   const regexInnerHtmlEnd = /([^>]+?)$/gi;
//   const regexTdAddress = regexHtml('td', ['time', '\\baddress\\b']);
//   const regexSpanTime = regexHtml('span', ['time']);
//   const regexSpanAddress = regexHtml('span', ['address']);

//   const results = {
//     arrivalAddress: '',
//     arrivalTime: '',
//     departureAddress: '',
//     departureTime: '',
//   };
//   const tdAddress = [...html.matchAll(regexTdAddress)];
//   // console.log('results.length = ', tdAddress.length);
//   // console.log(tdAddress.map((e) => [e[0], cleanStr(e[1]), e.index]));
//   for (let i = 0; i < tdAddress.length; i++) {
//     const isDeparture =
//       results.departureTime == '' && results.departureAddress == '';
//     const innerTd = tdAddress?.[i]?.[1] || '';

//     // Get innerHTML
//     const innerHtmlStart = cleanStr(
//       [...innerTd.matchAll(regexInnerHtmlStart)]?.[0]?.[1] || ''
//     );
//     const innerHtmlEnd = cleanStr(
//       [...innerTd.matchAll(regexInnerHtmlEnd)]?.[0]?.[1]?.trim() || ''
//     );
//     innerHtmlStart != ''
//       ? (timeOrAddress = innerHtmlStart)
//       : (timeOrAddress = innerHtmlEnd);
//     let timeInnerHtml = timeOrAddress.match(regexTime)?.[0] || '';
//     isDeparture
//       ? timeInnerHtml == ''
//         ? (results.departureAddress = timeOrAddress)
//         : (results.departureTime = timeInnerHtml)
//       : timeInnerHtml == ''
//       ? (results.arrivalAddress = timeOrAddress)
//       : (results.arrivalTime = timeInnerHtml);

//     // Get Span with time tag
//     const spanTime = [...innerTd.matchAll(regexSpanTime)];
//     let time = cleanStr(spanTime?.[0]?.[1] || '');
//     time = time.match(regexTime)?.[0] || '';
//     time != '' &&
//       (isDeparture
//         ? (results.departureTime = time)
//         : (results.arrivalTime = time));

//     // Get Span with address tag
//     const spanAddress = [...innerTd.matchAll(regexSpanAddress)];
//     const address = cleanStr(spanAddress?.[0]?.[1] || '');
//     address != '' &&
//       (isDeparture
//         ? (results.departureAddress = address)
//         : (results.arrivalAddress = address));
//   }
//   return results;
// }
