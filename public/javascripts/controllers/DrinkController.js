//angular.module('DrinkController', []).controller('DrinkController', function ($scope) {
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
    pump1: '',
    pump2: '',
    pump3: '',
    pump4: '',
    pump5: ''
  }

  $scope.selectedDrink;
  $scope.drinkSize = 5000;

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
    $scope.pumps = pumps;
  }

  $scope.selectDrink = function (drink) {
    $scope.selectedDrink = drink;
    console.log($scope.selectedDrink);
  };

  $scope.selectSize = function (size) {

  }

  $scope.addNewDrink = function () {
    $http.post('/drink.json', $scope.newDrink).success(function (data) {
      console.log(data);
      if (data.drink) {
        $scope.drinks.push(data.drink);
        $scope.newDrink.name = '';
        $scope.newDrink.image = '';
        // $scope.newDrink = {
        //   name: '',
        //   image: '',
        //   ingredients: [
        //     { name: '', amount: 0 }
        //   ]
        // };
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