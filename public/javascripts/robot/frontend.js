$(document).ready(function () {
  // Initialize
  $('#makeProgress').hide();
  $('.hiddenIngredientFloat').each(function () {
    $(this).hide();
  });
  resizeContainers();
  var socket = io.connect();

  // Sizing
  window.onresize = function () {
    resizeContainers();
  };

  var $scope = angular.element($('#drinkScope')).scope();

  $('#make').on('click', function () {
    console.log('click');
    if ($('#make').hasClass('noselection') === true) {
      alert('Please select a drink first.');
      return;
    }

    if ($('#make').hasClass('disabled') === true) {
      return;
    }

    // Visual
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
    makeDrink($scope.selectedDrink.ingredients, parseInt($scope.drinkTime));
  });

  $('.drinkContainer').mouseover(function () {
    $(this).children('.hiddenIngredientFloat').show();
    $(this).fadeTo(0, 0.8);
  });

  $('.drinkContainer').mouseout(function () {
    $(this).children('.hiddenIngredientFloat').hide();
    $(this).fadeTo(0, 1.0);
  });

  $('.drinkContainer').click(function () {

  });

  $('.drinkSize').click(function () {
    $('.drinkSize').each(function () {
      $(this).removeClass('selected');
    });
    $(this).addClass('selected');
  });
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

function makeDrink(ingredients, drinkSize) {
  // Find max amount and normalize to it
  var largestAmount = 0;
  for (var i in ingredients) {
    if (Number(ingredients[i].amount) > largestAmount) {
      largestAmount = ingredients[i].amount;
    }
  }

  // Normalize
  var normFactor = 1000/largestAmount;
  var totalPumpMilliseconds = 0;
  for (var i in ingredients) {
    ingredients[i].amount = normFactor * Number(ingredients[i].amount);
    totalPumpMilliseconds += ingredients[i].amount;
  }
  console.log(totalPumpMilliseconds);
  var totalCycles = drinkSize / totalPumpMilliseconds;

  var fullCycles = parseInt(totalCycles);
  var remainder = totalCycles - fullCycles;

  console.log(totalCycles);
  console.log(fullCycles);
  console.log(remainder);

  // Dispatch command to robot

}

function pump() {

}