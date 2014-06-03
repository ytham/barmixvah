function DrinkController($scope, $http) {
  $scope.drinks = [];
  $scope.newDrink = {
    name: '',
    image: '',
    ingredients: [
      { name: '', amount: 0 }
    ]
  };

  $scope.pumps = {
    label: "pumps",
    ingredients: [
      { label: "pump0", ingredient: "" }
    ]
  };

  $scope.sizes = [
    { size: '40', time: '18000' },
    { size: '200', time: '90000' },
    { size: '400', time: '180000' }
  ];

  $scope.selectedDrink;
  $scope.drinkTime = 10000;
  $scope.pumpTime = 0;

  $scope.pumpDuplicates = 0;

  $scope.ingredientsList = [
    'Vodka', 'Rum', 'Whiskey', 'Tequila', 'Gin', 'Sake', 'Soju',
    'Orange Juice', 'Apple Juice', 'Cranberry Juice', 'Pineapple Juice', 'Mango Juice', 'Grapefruit Juice', 'Lime Juice',
    'Coke', 'Sprite', 'Ginger Ale', 'Root Beer', 'Dr. Pepper',
    'Blue Liqueur', 'Sweet & Sour', 'Triple Sec', 'Kaluha', 'Peach Schnapps', 'Midori Melon',
    'Champagne'
  ];

  $scope.setDrinks = function (drinks) {
    $scope.drinks = drinks;
  };

  $scope.initializePumps = function () {
    console.log('ran');
    $http.post('/initializePumps').success(function (data) {
      console.log(data);
      return data;
    });
  };

  $scope.setPumps = function (pumps) {
    $scope.pumps = pumps[0];
  };

  $scope.getPumps = function () {
    $http.get('/pump.json').success(function (data) {
      console.log(data);
      return data;
    });
  };

  $scope.addPump = function () {
    var index = 0;
    if (typeof $scope.pumps === 'undefined') {
      $scope.pumps = {
        label: "pumps",
        ingredients: [ { label: "pump0", ingredient: "" } ]
      }
    } else {
      index = $scope.pumps.ingredients.length;
      $scope.pumps.ingredients.push({ label: "pump" + String(index), ingredient: "" });
    }

    $http.post('/updatepump.json', $scope.pumps).success(function (data) {
      console.log("addPump Update Success");
      console.log($scope.pumps);
    });
  };

  $scope.removePump = function () {
    $scope.pumps.ingredients.pop();
    $http.post('/updatepump.json', $scope.pumps).success(function (data) {
      console.log("removePump Update Success");
    });
  };

  $scope.savePumpValue = function (pumpNumber) {
    $http.post('/updatepump.json', $scope.pumps).success(function (data) {
      if (data) {
        console.log(data);
      }
    });
  };

  $scope.selectDrink = function (drink) {
    //console.log('select', arguments, this);
    $scope.selectedDrink = drink;

    if ($scope.lastSelected) {
      $scope.lastSelected.selectedDrink = '';
    }

    this.selectedDrink = 'selectedDrink';
    $scope.lastSelected = this;
  };

  $scope.selectSize = function (size) {
    for (var i in $scope.sizes) {
      if ($scope.sizes[i].size === size) {
        $scope.drinkTime = $scope.sizes[i].time;
        return;
      }
    }
  };

  $scope.addNewDrink = function () {
    $http.post('/drink.json', $scope.newDrink).success(function (data) {
      console.log(data.drink);
      console.log($scope);
      if (data.drink) {
        $scope.drinks.push(data.drink);
        $scope.newDrink = {
          name: '',
          image: '',
          ingredients: [
            { name: '', amount: 0 }
          ]
        };
      } else {
        alert(JSON.stringify(data));
      }
    });
  };

  $scope.addNewIngredient = function () {
    $scope.newDrink.ingredients.push({ name: '', amount: 0 });
    console.log('Added new ingredient');
  };

  $scope.removeIngredient = function (index) { 
    $scope.newDrink.ingredients.splice(index, 1);
    console.log('Removed ingredient at index ' + index);
  };

  // Filter for drinks
  $scope.containsIngredients = function (drink) {
    var numIngredients = drink.ingredients.length;
    var numPumps = $scope.pumps.ingredients.length;
    var ingredientsContained = 0 - $scope.pumpDuplicates;
    for (var i = 0; i < numIngredients; i++) {
      for (var j = 0; j < numPumps; j++) {
        if (drink.ingredients[i].name === $scope.pumps.ingredients[j].ingredient) {
          ingredientsContained++;
          if (ingredientsContained >= numIngredients || ingredientsContained >= numPumps) {
            return true;
          }
          continue;
        }
      }
    }
    return false;
  };

  // Check if there are duplicate pump ingredients before dispensing drinks
  /*$scope.checkDuplicates = function () {
    var len = $scope.pumps.ingredients.length;
    for (var i = 0; i < len; i++) {
      for (var j = i+1; j < len; j++) {
        if ($scope.pumps.ingredients[i].ingredient === $scope.pumps.ingredients[j].ingredient) {
          return false;
        }
      }
    }
    return true;
  };*/


  $scope.writeNumDuplicates = function () {
    var dupCount = 0;
    var len = $scope.pumps.ingredients.length;
    for (var i = 0; i < len; i++) {
      for (var j = i+1; j < len; j++) {
        if ($scope.pumps.ingredients[i].ingredient === $scope.pumps.ingredients[j].ingredient) {
          dupCount++;
        }
      }
    }
    $scope.pumpDuplicates = dupCount;
    //return dupCount;
  };

  $scope.editDrink = function (drink) {
    console.log(drink);
    $http.post('/updatedrink.json', drink).success(function (data) {
      console.log("Success");
      console.log(data);
    });
  };
}