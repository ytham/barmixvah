// app.filter('DrinkFilter', function () {
//   return function (input, criteria) {
//     var filtered = [];
//     for (var i = 0; i < input.length; i++) {
//       var max = pumps.length > input[i].ingredients.length ? pumps.length : input[i].ingredients.length;
//       var count = 0;
//       for (var j = 0; j < input[i].ingredients.length; j++) {
//         for (var k = 0; k < pumps.length; k++) {
//           if (input[i].ingredients[j] === pumps[i].ingredient) {
//             count++;
//             if (count >= max) {
//               filtered.push(input[i]);
//             }
//           }
//         }
//       }
//     }
//     return filtered;
//   };
// });