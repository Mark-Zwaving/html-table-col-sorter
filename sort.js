
   let table_selector = 'table > tbody',
       index = document.querySelector('table > thead > tr > th:nth-child(1)'),
       maand = document.querySelector('table > thead > tr > th:nth-child(2)'),
       data  = document.querySelector('table > thead > tr > th:nth-child(3)'),
       list_cols = [index, maand, data ];

       descending = '+'  // Large to small
       ascending  = '-'  // Small to high
       sort_direc = [descending,descending,descending];


  function update_sort_direction( col )
  {
      sort_direc[col] = sort_direc[col] == descending ? ascending : descending;
  }

  function read_table_dom_values( tr )
  {
       let row = 0, len = tr.length, matrix = [];

       while ( row < len )
       {
           let tds = [], cols = tr[row].getElementsByTagName('td'),
               col = 0, max = cols.length;
            while ( col < max )
            {
               tds.push(parseFloat( cols[col].innerHTML,10) );
               col += 1;
            }
           matrix.push(tds);
           row += 1;
       }

       return matrix;
  }

  function list_col_from_matrix( matrix, col )
  {
      let cols = [];
      for ( let row = 0, len = matrix.length; row < len; row++ )
            cols.push( matrix[row][col] )

       return cols;
  }

  function max_from_list( l )
  {
      if ( l.length > 0 )
      {
          let max_val = l[0], max_key = 0, len = l.length;
          while ( --len )
              if ( l[len] > max_val )
                  max_val = l[len], max_key = len;

          return [ max_val, max_key ];
      }

      return [ False, False ];
  }

  function numeric_sort_keys_matrix_by_col( matrix, col )
  {
       let col_list = list_col_from_matrix(matrix, col),
           len = col_list.length,
           keys = [];

       while ( --len >= 0 )
       {
           let key = max_from_list(col_list)[1];  // Get max key
           col_list.splice( key, 1, Number.MIN_VALUE );  // Replace with minimum
           keys.push(key);  // Add max key row to keys
       }
       return keys;
  }

  function read_dom_tr( selector )
  {
      let table = document.querySelector(selector),  // Get first table/tbody
          tr = table.getElementsByTagName('tr');  // tr rows

      return tr;
  }

  function sort_numeric_dom_tr_by_col( tr, col, reverse=false )
  {
        let matrix = read_table_dom_values( tr ), // Read all values in matrix list
            sort_keys = numeric_sort_keys_matrix_by_col( matrix, col );  // Sorted keys list

        if ( sort_direc[col] == ascending ) sort_keys.reverse()

        // Make new tr rows based on sorted keys
        html = '';
        for ( let ndx = 0, len = sort_keys.length; ndx < len; ndx++  )
            html += `<tr>${tr.item(sort_keys[ndx]).innerHTML}</tr>`;

        return html;
  }

  function event_click_num_sort ( selector, col )
  {
      let tr = read_dom_tr( selector ),  //  Get tr list DOM
          html = sort_numeric_dom_tr_by_col( tr, col )  // Sort numeric

      document.querySelector( selector ).innerHTML = html;  //  Write sorted tr to table/tbody
      update_sort_direction( col );  // Update sort for next time
  }

  // Add events and functions to table
  for ( let ndx = 0, len = list_cols.length; ndx < len; ndx++ )
      list_cols[ndx].addEventListener( 'click', function () {
          event_click_num_sort( table_selector, ndx );
      }, false );
