
  let first, second, third;

  const usersGet = ( opts = {} ) => {
    let count = opts.count || 20,
      otherOpts = '';

    for ( let k of Object.keys( opts ) ) {
      if ( k != 'count' ) {
        otherOpts += '&' + k + '=' + opts[ k ];
      }
    }

    let response = w.http( {
      'url': 'http://blackrhymes.com/api/users.get?count=' + count + otherOpts,
      'full': true,
      'type': 'GET'
    } );

    if ( response.status == 200 ) {
      let res = w.parse( response.responseText );
      return {
        status: true,
        response: res.data[ 0 ]
      };
    } else {
      return {
        status: false
      };
    }
  }

  window.onload = function() {
    let fakesSearchInfoMap = new Map();
    let fakesSearchQuery = '';

    let fakes = usersGet( {
      search: fakesSearchQuery,
      cursor_id: 0,
      fields: 'id,first_name,last_name,full_name,helpful_info,photo_max_orig',
      count: 10
    } );

    if ( fakes.status ) {
      let hasNextPage = fakes.response.items.hasNextPage;
      let cursorId = fakes.response.items.cursor_id;

      fakes = fakes.response.items.data || [];

      fakesSearchInfoMap.set( fakesSearchQuery, {
        cursorId,
        hasNextPage,
        response: fakes
      } );
    }

    first = new DropDown( w.ge( 'first' ), {
      entityType: 'users',
      maxResultHeight: 200,
      withoutPhoto: false,
      multiSelect: true,
      preloadItems: fakes,
      preloadMap: fakesSearchInfoMap,
      items: [],
      emptyResultText: 'Ничего не найдено...',
      searchPlaceholder: 'Поиск...',
      onChangeCallBack: function ( items ) {
        w.ge('firstResultDiv').innerHtml = JSON.stringify(items);
      }
    } );

    second = new DropDown( w.ge( 'second' ), {
      entityType: 'users',
      maxResultHeight: 400,
      withoutPhoto: true,
      multiSelect: false,
      preloadItems: fakes,
      preloadMap: fakesSearchInfoMap,
      emptyResultText: 'Ничего не найдено...',
      items: [],
      searchPlaceholder: 'Тестовый плейсхолдер'
    } );

    third = new DropDown( w.ge( 'third' ) );
  }
