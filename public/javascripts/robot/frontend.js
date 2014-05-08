var socket = io.connect();
var $scope = angular.element($('#drinkScope')).scope();

$(document).ready(function () {
  // Initialize
  $('#makeProgress').hide();
  $('.hiddenIngredientFloat').each(function () {
    $(this).hide();
  });
  resizeContainers();
  

  // Sizing
  window.onresize = function () {
    resizeContainers();
  };

  $('.mixers').on('change click touch blur', function () {
    console.log('mixers click');
    resizeContainers();
  });

  $('#make').on('click touch', function () {
    if ($('#make').hasClass('noselection') === true) {
      alert('Please select a drink first.');
      return;
    }

    if ($('#make').hasClass('disabled') === true) {
      return;
    }

    // Visual goodies
    console.log('Making Drink');
    $('#make').addClass('disabled');
    $('#makeProgress').show();
    $('#makeProgress').animate({
      'margin-left': '250px'
    }, parseInt($scope.drinkTime), 'linear', function () {
      $('#make').removeClass('disabled');
      $('#makeProgress').hide();
      $('#makeProgress').css('margin-left', '-10px');
    });

    // Start dispensing drink
    makeDrink($scope.selectedDrink.ingredients, $scope.pumps, parseInt($scope.drinkTime));
  });

  $('.drinkContainer').mouseover(function () {
    $(this).children('.hiddenIngredientFloat').show();
    $(this).fadeTo(0, 0.8);
  });

  $('.drinkContainer').mouseout(function () {
    $(this).children('.hiddenIngredientFloat').hide();
    $(this).fadeTo(0, 1.0);
  });

  $('.drinkSize').on('click touch', function () {
    $('.drinkSize').each(function () {
      $(this).removeClass('selected');
    });
    $(this).addClass('selected');
  });

  $('#allPumps').on('click touch', function () {
    if ($(this).hasClass('active')) {
      $(this).text('All');
      $(this).removeClass('active');
      socket.emit('Stop All Pumps');
    } else {
      $(this).text('Stop');
      $(this).addClass('active');
      socket.emit('Start All Pumps');
    }
  });

  // setInterval(function () {
  //   resizeContainers();
  // }, 500);
});

function resizeContainers() {
  $('.drinkContainer').each(function () {
    var size = $(this).width();
    $(this).height(size);

    var label = $(this).children('.drinkName');
    var margin = size - label.height() - 20;
    label.css('margin-top', margin);
  });
}

function makeDrink(ingredients, pumps, drinkSize) {
  // Find max amount and normalize to it
  // if ($scope.checkDuplicates() === false) {
  //   alert("Pump values must be unique");
  //   return;
  // }

  var largestAmount = 0;
  for (var i in ingredients) {
    if (Number(ingredients[i].amount) > largestAmount) {
      largestAmount = ingredients[i].amount;
    }
    for (var j in pumps.ingredients) {
      console.log(pumps.ingredients[j].ingredient);
      if (ingredients[i].name === pumps.ingredients[j].ingredient) {
        ingredients[i].pump = pumps.ingredients[j].label;
        continue;
      }
    }
  }

  // Normalize
  var normFactor = 1000/largestAmount;
  var totalPumpMilliseconds = 0;
  for (var i in ingredients) {
    ingredients[i].amount = parseInt(normFactor * Number(ingredients[i].amount));
    console.log("Ing: " + ingredients[i].amount);
    totalPumpMilliseconds += ingredients[i].amount;
  }
  console.log(totalPumpMilliseconds);
  var exactCycles = drinkSize / totalPumpMilliseconds;
  var fullCycles = Math.ceil(exactCycles);
  var remainder = exactCycles - (fullCycles-1);

  console.log(exactCycles);
  console.log(fullCycles);
  console.log(remainder);

  // Dispatch command to robot
  var intrCount = 0;
  var interval = setInterval(function () {
    if (intrCount >= fullCycles-1) {
      if (intrCount > fullCycles-1) {
        clearInterval(interval);
        return;
      }
      console.log("Last Cycle");
      for (var i in ingredients) {
        ingredients[i].amount = parseInt(ingredients[i].amount * remainder);
      }
    }

    socket.emit("Pump Cycle", ingredients);
    console.log(ingredients);
    // console.log("Amount: " + ingredients[0].amount);
    // console.log("intrCount: " + intrCount);
    // console.log("fullCycles-1: " + (fullCycles-1));
    // console.log("--------");
    intrCount++;
  }, 1000);
}