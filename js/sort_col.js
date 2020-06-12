/**
 * Functions for sorting table columns
 *
 * @author   M.Zwaving
 * @license  Public Domain
 */
'use strict';
console.log('JS loading...');

let table_selector = 'table > tbody',  // Locations of the tr with data
    descending     = '+',   // Identifier sort direction: large to small
    ascending      = '-',   // Identifier sort direction: small to high
    sort_num       = 'num', // Identifier sort num-based
    sort_txt       = 'txt', // Identifier sort txt-based
    row_nr         = 2,     // Row tr num for click to sort
    css_click_cell = 'cursor: cell;',  // Extra css for click cell
    abs_min        = -99999999.9,  // minimum digit for testing against maximum values

    // Reg expression for grepping a float number from a td cell.
    // Result float is used for numeric sorting in a td cell.
    // Update here reg expression for extracting floats, if needed
    reg_float = /[+-]?[0-9]*[.]?[0-9]+/g,

    // Function get selectors to make columns clickable for sorting
    // Update here the selector for other tables
    selector = ( row, col ) => {
        return document.querySelector (
                `table>thead>tr:nth-child(${row})>th:nth-child(${col})`
        );
    },

    // Function returns an object with all the needed values for sorting a column
    // See object enti below
    obj = ( name, type, dir, row, col ) => {
        return {
            name: name,
            doc: selector( row, col ),
            type: type, // Num or txt
            dir: dir,
            row: row,
            col: col
        }
    },

    // All weather entities objects for the specific columns
    // For different table structures change row num and col num for example
    // Give a name and a starting sort direction: ascending or descending  ?
    // See selector for updating the query selector
    // obj( name, type-sort (sort_num or sort_txt), sort-direction, row_nr (tr), col_nr (td) );
    enti = {
        PLACE:     obj( 'PLACE',    sort_txt,  ascending,   row_nr,   1 ),
        PROVINCE:  obj( 'PROVINCE', sort_txt,  ascending,   row_nr,   2 ),
        TG:        obj( 'TG',       sort_num,  descending,  row_nr,   4 ),
        HELLMANN:  obj( 'HELLMANN', sort_num,  ascending,   row_nr,   5 ),
        TX_MIN:    obj( 'TX_MIN',   sort_num,  descending,  row_nr,   6 ),
        TG_MIN:	   obj( 'TG_MIN',   sort_num,  descending,  row_nr,   7 ),
        TN_MIN:    obj( 'TN_MIN',   sort_num,  descending,  row_nr,   8 ),
        TXlt0:     obj( 'TXlt0',    sort_num,  descending,  row_nr,   9 ),
        TGlt0:     obj( 'TGlt0',    sort_num,  descending,  row_nr,  10 ),
        TNlt0:     obj( 'TNlt0',    sort_num,  descending,  row_nr,  11 ),
        TNlt_5:    obj( 'TNlt_5',   sort_num,  descending,  row_nr,  12 ),
        TNlt_10:   obj( 'TNlt_10',  sort_num,  descending,  row_nr,  13 ),
        TNlt_15:   obj( 'TNlt_15',  sort_num,  descending,  row_nr,  14 ),
        TNlt_20:   obj( 'TNlt_20',  sort_num,  descending,  row_nr,  15 )
    },


    ////////////////////////////////////////////////////////////////////////////
    // Grep a float from a string. Needed for coreect sorting
    grep_float = el => {
        let fl = el.match( reg_float );
        return parseFloat( fl, 10 );
    },

    // Function updates the sort direction for a given object
    update_sort_dir  = obj => {
        obj.dir = obj.dir == descending ? ascending : descending;
    },

    // Function gets a DOM object with all the rows in the selected table
    read_dom_tr = selector => {
        return document.querySelector(selector).getElementsByTagName('tr');
    },

    // Function sets the values of a matrix (2d array) in een text 'array'
    txt_matrix = matrix => {
        let txt = '\n[\n'
        for ( let x = 0, lx = matrix.length; x < lx; x ++ )
        {
            txt += ' [ ';
            for ( let y = 0, ly = matrix[x].length; y < ly; y++ )
                txt += `${matrix[y]}, `;
            txt += ' ]\n';
        }
        txt += '];\n';

        return txt;
    },

    // Function reads al the data from een tr DOM object into an 2d array/matrix
    read_table_in_matrix = tr => {

       let row = 0, len = tr.length, matrix = [];

       while ( row < len )
       {
           let tds = [], cols = tr[row].getElementsByTagName('td'),
               col = 0, max = cols.length;
            while ( col < max )
            {
               tds.push(cols[col].innerHTML);
               col += 1;
            }
           matrix.push(tds);
           row += 1;
       }

       return matrix;
    },

    // Function reads all the column values from the weather object into a list
    list_col_from_matrix = (matrix, obj) => {
        let cols = [];
        for ( let row = 0, len = matrix.length; row < len; row++ )
              cols.push( matrix[row][obj.col-1] )

        return cols;
    },

    // Function gets a maximum value and his key from a list
    max_from_list = l => {

        let max = abs_min, key = 0;
        for ( let i = 0, len = l.length; i < len; i++ )
            if (l[i] > max) {
              max = l[i];
              key = i;
            }

        return { val: max, key: key };
    },

    // Function gets the numeric sorted key list with values
    num_sort_keys_col = (col_list, obj) => {

         let len = col_list.length, keys = [];

         // Replace all non-numeric values in col_list
         for ( let i = 0; i < len; i++ )
            col_list[i] = grep_float( col_list[i] );  // Oke

         while ( --len !== -1 )
         {
            let max = max_from_list( col_list );  // Get max key
            col_list.splice( max.key, 1, abs_min );  // Replace with minimum
            keys.push( max.key );  // Add max key row to keys
         }

         if ( obj.dir == ascending )
            keys.reverse()

         return keys;
    },

    // Function gets the txt sorted key list with values
    // TODO
    txt_sort_keys_col = (col_list, obj) => {

         let len = col_list.length, txt_keys = [], keys = [];

         // Make new array with the text and their keys
         for ( let ndx = 0; ndx < len; ndx++ )
            txt_keys.push( { txt : col_list[ndx], key : ndx } );

         // Sort text only
         txt_keys.sort( (a, b) => {
              a = a.txt.toLowerCase();
              b = b.txt.toLowerCase();

              return a == b ? 0 : a < b ? -1 : 1;
         } );

         // Make keys only list
         while ( --len !== -1 ) keys.push( txt_keys[len].key );

         if ( obj.dir == ascending )
            keys.reverse()

         return keys;
    },

    // Function makes the sorted html (tr rows) based on the list with sorted keys.
    // The sorted keys sort the TR Dom object.
    html_sorted_list = (tr, sort_keys) => {

        let html = '', ndx = 0;  // Make new html tr rows based on sorted keys
        sort_keys.forEach( el => {
              html += `<tr>${tr.item(el).innerHTML}</tr>`;
        } );

        return html;
    },

    // Function called after clicked on a table column title. Start sorting the clicked column.
    event_click_num_sort = (selector, obj) => {
        let tr        = read_dom_tr( selector ),  //  Get tr list DOM
            matrix    = read_table_in_matrix( tr ),  // Read all values into matrix list
            col_list  = list_col_from_matrix( matrix, obj );  // Get values col in list

        // Get sorted keys list
        let sort_keys = [];
        if ( obj.type == sort_num )
            sort_keys = num_sort_keys_col( col_list, obj );
        else if ( obj.type == sort_txt ) // TODO
            sort_keys = txt_sort_keys_col( col_list, obj );

        let html = html_sorted_list( tr, sort_keys );  // Get html tr sorted
        document.querySelector( selector ).innerHTML = html;  // Write sorted tr to table/tbody
        update_sort_dir( obj );  // Update sort direction for next time
    },

    // Function adds/attaches the click events to the columns in the table
    add_events_to_table = () => {
        //  Add events to table titles
        for ( var x in enti )
            if ( enti.hasOwnProperty(x) )
                enti[x].doc.addEventListener (
                        'click', (
                          (sel,obj) => () => event_click_num_sort(sel, obj)
                        ) (table_selector, enti[x]),
                        false
                );
    },

    // Function adds css to the clickable column titles in the table
    add_css_to_table_titles = () => {
      //  Add events to table titles
      let css = css_click_cell;
      for ( var x in enti )
          if ( enti.hasOwnProperty(x) )
              enti[x].doc.style = css;
    };

//  After loading the page, add all events and css
window.onload = (e) => {
    add_events_to_table();
    add_css_to_table_titles();
    console.log('JS loaded !');
};
