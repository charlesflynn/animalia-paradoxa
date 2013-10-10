
var dataView;
var grid;
var columns = [
  {id: "title", name: "Title", field: "title", width: 250, minWidth: 250, cssClass: "cell-title", sortable: true},
  {id: "type", name: "Type", field: "type", width: 120, minWidth: 120, cssClass: "cell-title", sortable: true},
  {
    id: "url", 
    name: "URL", 
    field: "url",
    width: 240, 
    minWidth: 200, 
    sortable: true,
    formatter: linkFormatter = function ( row, cell, value, columnDef, dataContext ) {
       return '<a target="_blank" href="' + value + '">' + value + '</a>';
    }
  }
];

var options = {
  enableTextSelectionOnCells: true,
  editable: false,
  enableAddRow: false,
  enableCellNavigation: true,
  asyncEditorLoading: true,
  forceFitColumns: false,
  topPanelHeight: 25
};

var sortcol = "title";
var sortdir = 1;
var percentCompleteThreshold = 0;
var searchString = "";

function titleFilter(item, args) {
  if (item["percentComplete"] < args.percentCompleteThreshold) {
    return false;
  }

  if (args.searchString.toLowerCase() != "" && item["title"].toLowerCase().indexOf(args.searchString) == -1) {
    return false;
  }

  return true;
}

function comparer(a, b) {
  var x = a[sortcol], y = b[sortcol];
  return (x == y ? 0 : (x > y ? 1 : -1));
}

function toggleFilterRow() {
  grid.setTopPanelVisibility(!grid.getOptions().showTopPanel);
}


$(".grid-header .ui-icon")
        .addClass("ui-state-default ui-corner-all")
        .mouseover(function (e) {
          $(e.target).addClass("ui-state-hover")
        })
        .mouseout(function (e) {
          $(e.target).removeClass("ui-state-hover")
        });

$(function () {
  dataView = new Slick.Data.DataView({ inlineFilters: true });
  grid = new Slick.Grid("#animaliaGrid", dataView, columns, options);
  grid.setSelectionModel(new Slick.RowSelectionModel());

  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
  var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);


  // move the filter panel defined in a hidden div into grid top panel
  $("#inlineFilterPanel")
      .appendTo(grid.getTopPanel())
      .show();

  grid.onCellChange.subscribe(function (e, args) {
    dataView.updateItem(args.item.id, args.item);
  });

  grid.onKeyDown.subscribe(function (e) {
    // select all rows on ctrl-a
    if (e.which != 65 || !e.ctrlKey) {
      return false;
    }

    var rows = [];
    for (var i = 0; i < dataView.getLength(); i++) {
      rows.push(i);
    }

    grid.setSelectedRows(rows);
    e.preventDefault();
  });

  grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;

    if ($.browser.msie && $.browser.version <= 8) {
      // using temporary Object.prototype.toString override
      // more limited and does lexicographic sort only by default, but can be much faster

      var percentCompleteValueFn = function () {
        var val = this["percentComplete"];
        if (val < 10) {
          return "00" + val;
        } else if (val < 100) {
          return "0" + val;
        } else {
          return val;
        }
      };

      // use numeric sort of % and lexicographic for everything else
      dataView.fastSort((sortcol == "percentComplete") ? percentCompleteValueFn : sortcol, args.sortAsc);
    } else {
      // using native sort with comparer
      // preferred method but can be very slow in IE with huge datasets
      dataView.sort(comparer, args.sortAsc);
    }
  });

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });

  dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
    var isLastPage = pagingInfo.pageNum == pagingInfo.totalPages - 1;
    var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
    var options = grid.getOptions();

    if (options.enableAddRow != enableAddRow) {
      grid.setOptions({enableAddRow: enableAddRow});
    }
  });


  var h_runfilters = null;

  // wire up the search textbox to apply the filter to the model
  $("#txtSearch,#txtSearch2").keyup(function (e) {
    Slick.GlobalEditorLock.cancelCurrentEdit();

    // clear on Esc
    if (e.which == 27) {
      this.value = "";
    }

    searchString = this.value;
    updateFilter();
  });

  function updateFilter() {
    dataView.setFilterArgs({
      percentCompleteThreshold: percentCompleteThreshold,
      searchString: searchString
    });
    dataView.refresh();
  }

/*
  $("#btnSelectRows").click(function () {
    if (!Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }

    var rows = [];
    for (var i = 0; i < 10 && i < dataView.getLength(); i++) {
      rows.push(i);
    }

    grid.setSelectedRows(rows);
  });
*/

  $.getJSON("AnimaliaParadoxa.json", function(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.setFilterArgs({
      percentCompleteThreshold: percentCompleteThreshold,
      searchString: searchString
    });
    dataView.setFilter(titleFilter);
    dataView.endUpdate();
  });


  // if you don't want the items that are not visible (due to being filtered out
  // or being on a different page) to stay selected, pass 'false' to the second arg
  dataView.syncGridSelection(grid, true);

  $("#gridContainer").resizable();
})