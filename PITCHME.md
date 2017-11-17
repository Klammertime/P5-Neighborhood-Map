```
    /**
     * Every time the autocomplete input is used, the new value is
     * passed to the codeAddress function which is then called. Then
     * submit button is not needed.
     * @param {callback function} - Entity's x coordinate on canvas
     * @param {string} my.vm - Target (optional) defining
     * the value of 'this' in the callback function.
     * @param {string} sprite - Entity's sprite used to render entity on canvas.
     * @param {string} change - default event.
     */
    my.vm.requestedFilm.subscribe(function (newValue) {
        this.codeAddress(newValue);
    }, my.vm);

    ko.observable.fn.equalityComparer = function (a, b) {
        return a === b;
    };
});
```