var socket = io.connect();
var $scope; 

$(document).ready(function () {
  $scope = angular.element($('#drinkScope')).scope();

  // Initialize
  $('#makeProgress').hide();
  $('.hiddenIngredientFloat').each(function () {
    $(this).hide();
  });
  $('#hiddenPumpControls').hide();
  resizeContainers();
  
  // Sizing
  window.onresize = function () {
    resizeContainers();
  };

  $('.mixers').on('change click touch blur', function () {
    resizeContainers();
  });

  // Front end drink making
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
    setTimeout(function () {
      console.log("Time to Dispense Drink: " + $scope.pumpTime + "ms");
      $('#makeProgress').animate({
        'margin-left': '250px'
      }, parseInt($scope.pumpTime), 'linear', function () {
        $('#make').removeClass('disabled');
        $('#makeProgress').hide();
        $('#makeProgress').css('margin-left', '-10px');
      });
    }, 200);

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

  var pumpControlsVisible = false;
  $('#pumpControlToggle').on('click touch', function () {
    if (pumpControlsVisible) {
      pumpControlsVisible = false;
      $('#hiddenPumpControls').hide();
      $(this).text("PU");
      $(this).removeClass("active");
    } else {
      pumpControlsVisible = true;
      $('#hiddenPumpControls').show();
      $(this).text("x");
      $(this).addClass("active");
    }
  });

  $('.singlePump').on('click touch', function () {
    var pump = "pump" + $(this).index();
    console.log(pump);
    if ($(this).hasClass('active')) {
      stopOnePump($(this));
    } else {
      startOnePump($(this));
    }
  });
    
  $('#allPumps').on('click touch', function () {
    var children = $('#hiddenPumpControls').children();
    
    if ($(this).hasClass('active')) {
      $(this).text('All');
      children.each(function () {
        if ($(this).index() === children.length-1) {
          $(this).text('All');
          $(this).removeClass('active');
        } else {
          stopOnePump($(this))
        }
      });
    } else {
      $(this).text('Stop');
      children.each(function () {
        if ($(this).index() === children.length-1) { 
          $(this).addClass('active');
        } else {
          startOnePump($(this));
        }
      });
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
  if ($scope.pumpDuplicates > 0) {
    alert("Pump values must be unique");
    return;
  }

  // Get largest amount and index of that ingredient
  var largestAmount = 0;
  var amountTotal = 0;
  var largestIndex = 0;
  for (var i in ingredients) {
    amountTotal += Number(ingredients[i].amount);
    if (Number(ingredients[i].amount) > largestAmount) {
      largestAmount = ingredients[i].amount;
      largestIndex = i;
    }

    // Append pump numbers to the ingredients
    for (var j in pumps.ingredients) {
      if (ingredients[i].name === pumps.ingredients[j].ingredient) {
        ingredients[i].pump = pumps.ingredients[j].label;
        continue;
      }
    }
  }

  // Normalize
  var normFactor = drinkSize/amountTotal;

  var totalPumpMilliseconds = parseInt(normFactor * largestAmount); 
  $scope.pumpTime = totalPumpMilliseconds;

  // Set the normalized amount and delay for each ingredient
  ingredients[largestIndex].amount = parseInt(normFactor * Number(ingredients[largestIndex].amount));
  ingredients[largestIndex].delay = 0;
  for (var i in ingredients) {
    if (i === largestIndex) continue;
    ingredients[i].amount = parseInt(normFactor * Number(ingredients[i].amount));
    ingredients[i].delay = ingredients[largestIndex].amount - ingredients[i].amount;
  }

  socket.emit("Make Drink", ingredients);
}

function startOnePump(self) {
  self.text("Stop");
  self.addClass('active');
  socket.emit('Start Pump', "pump"+self.index());
}

function stopOnePump(self) {
  self.text(self.index());
  self.removeClass('active');
  socket.emit('Stop Pump', "pump"+self.index());
}