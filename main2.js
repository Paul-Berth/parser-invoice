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

// // =================================================
// // 2 -- ADDRESS && TIME
// const address = getInfo({
//   html,
//   words: ['suisse', 'france'],
//   onlyReg: false,
//   keepBeforeAfter: true,
// });
// console.log(address);
// results.departureAddress = address?.[0]?.unit || '';
// results.departureTime = address?.[0]?.value || '';
// results.arrivalAddress = address?.[1]?.unit || '';
// results.arrivalTime = address?.[1]?.value || '';

// // 3 -- DISTANCE && DISTANCEUNIT
// const distance = getInfo({ html, words: ['kilomètre', 'kilometre'] });
// console.log(distance);
// results.distanceUnit = distance.unit;
// results.distance = distance.value;

// // 4 -- DURATION
// const duration = getInfo({ html, words: ['durée', 'duree'] });
// console.log(duration);
// results.duration = duration.value;

// // 5 -- DISTANCEFEE
// const distancefee = getInfo({ html, words: ['distance'] });
// console.log(distancefee);
// results.distanceFee = distancefee.value;

// // 6 -- TIMEFEE
// const timefee = getInfo({ html, words: ['temps'] });
// console.log(timefee);
// results.timeFee = timefee.value;

// // 7 -- TOTALPRICEPAID && CURRENCY
// const totalPricePaid = getInfo({ html, words: ['sous-total'] });
// console.log(totalPricePaid);
// results.totalPricePaid = totalPricePaid.value;
