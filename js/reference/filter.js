var Filter = Base.extend({
  constructor: function(){
    // this guy has a spreedsheet thing he's filtering, you aren't, don't know
    // what I should do intead, follow along then figure it out?
    this.showDocuments = ko.observable(true);
    this.showSpreadsheets = ko.observable(true);
    this.textFilter = ko.observable();
  },
  itemMatchesFilter: function(item) {
    if(item instanceof Document && !this.showDocuments()) {
      return false;
    }
    if(item instanceof Spreadsheet && !this.showSpreadsheets()){
      return false;
    }
    var textFilter = this.textFilter();

    if(!textFilter) {
      // no text filter specified
      return true;
    }
    return item.matchesTextFilter(textFilter);
  }
});


// in the Document class in document.js he's defining matchesTextFilter, the below
// is in his document.js file

var Document = Base.extend({
    templateName: "document-template",
    constructor: function (title, body) {
      this.title = ko.observable(title);
      this.body = ko.observable(body);
    },
    matchesTextFilter: function(textFilter) {
      var title = this.title() || '';
      var titleMatches = title.toLowerCase().indexOf(textFilter.toLowerCase()) != -1;
      var body = this.body() || '';
      var bodyMatches = body.toLowerCase().indexOf(textFilter.toLowerCase()) != -1;

      return titleMatches || bodyMatches;

    }
});

// Now he's in spreadsheet class in spreadsheet.js which is a much longer file
// I'm not going to copy it all here, just the part he's adding for the filter:
// line 23
matchesTextFilter: function(textFilter) {
  var title = this.title() || '';
  var titleMatches = title.toLowerCase().indexOf(textFilter.toLowerCase()) != -1;

  // he's using lodash, which you aren't!
  return titleMatches || this._anyCellMatchesTextFilter(textFilter);
},
_anyCellMatchesTextFilter: function(textFilter) {
  var anyRowMatches = _.any(this.rows(), function(row) {
    var anyCellMatches = _.any(row.cells(), function(cell) {
      var cellValue = cell.value() || '';
      return cellValue.toLowerCase().indexOf(textFilter.toLowerCase()) != -1;
    });
    return anyCellMatches;
  });
  return anyRowMatches;
},

// now he went into the main KnockoutDocs view model and in his constructor
// he created a new filter object??
var KnockoutDocs = Base.extend({
  constructor: function() {
  // a lot of stuff
  this.filter = new Filter();
  this.filteredItems = ko.computed(this._getFilteredItems, this); // this is 2nd arg
  // to bind this to the computed fcn
  },
  _getFilteredItems: function() {
    return _.filter(this.items(), function(item) {
      return this.filter.itemMatchesFilter(item);

    }, this); // binding this inside the function
  }
});

// Lastly he edits the index.html file adding the filter.js file at the bottom of the js
// files he's stacked in the head. that's where he puts all of his sep. class files.

<div class="well well-small" data-bind="with: filter">
  <label><input type="checkbox" data-bind="checked: showDocuments"/>Documents</label>
  <label><input type="checkbox" data-bind="checked: showSpreadsheets"/> Spreadsheets</label>
  <label>Search: <input type="text" data-bind="value: textFilter, valueUpdate: 'afterkeydown'"/></label>
</div>
<ul class="unstyled dropdown well" data-bind="foreach: filteredItems">
    <li class="document">
      <i class="icon-file"></i>
      <a href="#" data-bind="text: title, click: $parent.editItem"></a>
    </li>
</ul>







