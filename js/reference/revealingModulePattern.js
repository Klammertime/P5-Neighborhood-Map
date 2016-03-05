//Revealing module pattern
my.viewmodel = function(){
  var privateVal = 3,
      add: function(x, y){
        return x + y;
      };

      /* Difference between this and just the module pattern
      is that the return statements are very short because they
      are just exposing the name of the property or member exposiing,
      plus you can change the name, and it points to internal function
      The return statements are short and not a lot of logic in there on
      right hand side. Also avoid having to refer to private props
      as this.mypublicprob.privateprop.*/
      return {
        // we can name privateVal whatever we want down
        // here. We are exposing these publicly.
        someVal: privateVal,
        add: add
      };
  };
}();

// Example of defining a computed member and avoiding this issue
// vm = {
//   id: ko.observable(1),
//   salePrice: ko.observable(4199),
//   qty: ko.observable(2)
// };

// vm.extendedPrice = ko.computed(function(){
//   return this.product() ?
//   // have to use this to make sure this salePrice is referencing the
//   // view model, vm
//   this.salePrice() * parseInt("0" + this.qty(), 10) : 0;
// } vm); // here you are saying make vm 'this', or the owner of 'this'


// This one might help when creating urls
// https://app.pluralsight.com/player?course=knockout-mvvm&author=john-papa&name=knockout-mvvm-m2&clip=6&mode=live