function DrinkController($scope, $http) {
  $scope.drinks = [];
  $scope.newDrink = {
    name: '',
    image: '',
    ingredients: [
      { name: '', amount: 0 }
    ]
  };

  $scope.pumps = [
    { label: 'pump0', ingredient: '' },
    { label: 'pump1', ingredient: '' },
    { label: 'pump2', ingredient: '' },
    { label: 'pump3', ingredient: '' },
    { label: 'pump4', ingredient: '' }
  ];

  $scope.sizes = [
    { size: '40', time: '2000' },
    { size: '200', time: '10000' },
    { size: '500', time: '25000' }
  ];

  $scope.selectedDrink;
  $scope.drinkTime = 5000;

  $scope.ingredientsList = [
    'Vodka', 'Rum', 'Whiskey', 'Tequila', 'Gin', 'Sake', 'Soju',
    'Orange Juice', 'Apple Juice', 'Cranberry Juice', 'Pineapple Juice', 'Mango Juice',
    'Coke', 'Sprite', 'Ginger Ale', 'Root Beer', 'Dr. Pepper',
    'Blue Liqueur', 'Sweet & Sour', 'Triple Sec', 'Kaluha', 'Peach Schnapps', 'Midori Melon'
  ];

  $scope.setDrinks = function (drinks) {
    $scope.drinks = drinks;
  };

  $scope.setPumps = function (pumps) {
    console.log(pumps);
    $scope.pumps = pumps;
  }

  $scope.getPumps = function () {
    $http.get('/pumps.json').success(function (data) {
      console.log(data);
      return data;
    });
  }

  $scope.savePumpValue = function (pumpNumber) {
    var pumpName = "pump" + String(pumpNumber);
    var pumpData = { 
      label: pumpName, 
      ingredient: $scope.pumps[pumpNumber].ingredient
    };

    $http.post('/updatepump.json', pumpData).success(function (data) {
      console.log(data);
      if (data) {
        $scope.pump[pumpNumber] = data;
      }
    });
  }

  $scope.selectDrink = function (drink) {
    $scope.selectedDrink = drink;
    console.log($scope.selectedDrink);
  };

  $scope.selectSize = function (size) {
    for (var i in $scope.sizes) {
      if ($scope.sizes[i].size === size) {
        $scope.drinkTime = $scope.sizes[i].time;
        console.log($scope.drinkTime);
        return;
      }
    }
  }

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
  }

  $scope.removeIngredient = function (index) { 
    $scope.newDrink.ingredients.splice(index, 1);
    console.log('Removed ingredient at index ' + index);
  }
}