function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}

function getParameterByName(uri, key) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  var match = uri.match(re);
  if (match) {
    return match[0].replace('&_a=', '');
  }
  return null;
}

var currentSelection = null;

function highlightSelection() {
  if (currentSelection) {
    $(currentSelection).parent().addClass('red-background');

    // Scroll to
    // $('.fa-caret-down').parent().click();
  }
}

function addContextToTable() {
  var $elem = $('thead[kbn-table-header]');
  if (!$elem.hasClass('has-context')) {
    $elem.append('<th>Context</th>').addClass('has-context');
  }

  $('tr[kbn-table-row="row"]').each(function() {
    var $row = $(this);
    if (!$row.find('.context-finder').length) {
      $row.append('<td class="context-finder"><a href="#">Context</a></td>').find('a').on('click', function(e) {
        e.preventDefault();

        $($row.find('td')[0]).click();

        setTimeout(function() {
          var timestampText = $row.next().find('td[title="@timestamp"]').next().next().text().trim();
          var rowTimestamp = moment(timestampText, 'MMMM Do YYYY, h:mm:ss');

          var startOfQuery = moment(rowTimestamp).subtract(2, 'seconds').utc().format().replace('+00:00', 'Z');
          var endOfQuery = moment(rowTimestamp).add(2, 'seconds').utc().format().replace('+00:00', 'Z');

          var timeQuery = "(time:(from:'" + startOfQuery + "',mode:absolute,to:'" + endOfQuery + "'))";
          var url = updateQueryStringParameter(window.location.href, '_g', timeQuery);
          var currentQuery = getParameterByName(window.location.href, '_a');
          currentQuery = currentQuery.replace(new RegExp("query_string:\\(.+?\\)"), "query_string:(analyze_wildcard:!t,query:'*')")
          url = updateQueryStringParameter(url, '_a', currentQuery);
          window.location = url;

          currentSelection = null;
          $('.red-background').removeClass('red-background');

          currentSelection = 'td:contains("' + timestampText + '")';
        }, 0);
      });
    }
  });
}

setInterval(addContextToTable, 1000);

setInterval(highlightSelection, 500);
