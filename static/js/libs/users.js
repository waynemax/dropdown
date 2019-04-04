
  const USERS_DEFAULT_CONFIG = {
    preloadMap: new Map(),
    preloadCount: 50
  };

  class Users {
    constructor( options = {} ) {
      if ( !options.parentEntity ) {
        return;
      }

      this.opts = Object.create( USERS_DEFAULT_CONFIG );

      for ( let key of Object.keys( options ) ) {
        this.opts[ key ] = options[ key ];
      }

      this.previousQuery = '';
      this.storeLoaded = new Map();
      this.storeKeyLoaded = new Map();

      return this;
    }

    preloadCallBack( scroll ) {
      let input = this.opts.parentEntity.input;
      let storeValue = this.opts.preloadMap.get( input.value );

      if ( storeValue ) {
        if ( storeValue.hasNextPage == false ) {
          return;
        }

        let serverSearchResult = this.serverSearch( input.value, 0, this.opts.preloadCount, storeValue.cursorId );
        if ( serverSearchResult.status ) {
          this.opts.parentEntity.windowResultAddItems( serverSearchResult.items );
        }
      }
      scroll.preloaded = false;
    }


    renderAllItems( data ) {
      let result = '';
      for ( let item of data ) {
        let { id, first_name, last_name, helpful_info, photo_max_orig, full_name, domain } = item;
        result += this.opts.parentEntity.renderItem(
          id, (first_name + ' ' + last_name), photo_max_orig, helpful_info, domain
        );
        this.storeLoadedAdd(id, item);
      }
      return result;
    }

    storeLoadedAdd( id, value ) {
      if ( 'full_name' in value ) {
        let splitFullName = value.full_name.split(' ');
        let fullNameRevert = splitFullName[ 1 ] + ' ' + splitFullName[ 0 ];
        let searchValue = value.full_name + '|' + fullNameRevert;

        searchValue += '|' + translitToENG( searchValue, TRANSLIT_RU_2_ENG_CHARS );

        if ( 'domain' in value ) {
          searchValue = searchValue + '|' + value.domain;
        }

        this.storeKeyLoaded.set( searchValue.toLowerCase(), value.id );
      }
      this.storeLoaded.set( id, value );
    }

    search( val ) {
      if ( val == '' ) {
        this.opts.parentEntity.windowResultSetDefaultItems();
        return;
      }

      val = val.toLowerCase();
      if ( val == this.previousQuery ) {
        return;
      }

      this.previousQuery = val;

      let searchResultItems = [];
      for ( let key of this.storeKeyLoaded ) {
        if ( key[ 0 ].indexOf( translitToRU( val, TRANSLIT_ENG_2_RU_CHARS ) ) != -1 ) {
          searchResultItems.push( this.storeLoaded.get( key[ 1 ] ) );
        }

        if ( key[ 0 ].indexOf( translitToRU( val, ENG_CHAR_2_RU ) ) != -1 ) {
          searchResultItems.push( this.storeLoaded.get( key[ 1 ] ) );
        }

        if ( key[ 0 ].indexOf( translitToENG( val, TRANSLIT_RU_2_ENG_CHARS ) ) != -1 ) {
          searchResultItems.push( this.storeLoaded.get( key[ 1 ] ) );
        }

        if ( key[ 0 ].indexOf( translitToENG( val, RU_CHAR_2_ENG ) ) != -1 ) {
          searchResultItems.push( this.storeLoaded.get( key[ 1 ] ) );
        }
      }

      this.opts.parentEntity.windowResultClear();

      if ( searchResultItems.length < 1 ) {
        let serverResult = this.serverSearch( val );
        if ( serverResult.status ) {
          searchResultItems = serverResult.items;
        }
      }

      if ( searchResultItems.length == 0 ) {
        return this.opts.parentEntity.windowResultClear();
      }

      this.opts.parentEntity.windowResultAddItems( searchResultItems );
    }

    serverSearch( search = '', offset = 0, count = 20, cursor_id = 0 ) {
      if ( this.opts.preloadMap.get( search ) ) {
        let storeValue = this.opts.preloadMap.get( search );
        if ( storeValue.hasNextPage == false ) {
          return {
            status: storeValue.response.length > 0 ? true : false,
            items: storeValue.response
          }
        }
        cursor_id = parseInt( storeValue.cursorId );
      }

      let items = usersGet( {
        offset,
        count: count,
        cursor_id,
        search
      } );

      if ( items.status ) {
        if ( items.response.items.count > 0 ) {
          let hasNextPage = Boolean( items.response.items.hasNextPage ),
            cursorId = parseInt( items.response.items.cursor_id ),
            data = items.response.items.data || [];

          this.opts.preloadMap.set( search, {
            cursorId,
            hasNextPage,
            response: !hasNextPage ? data : []
          } );

          return {
            status: true,
            items: data
          }
        } else {
          this.opts.preloadMap.set( search, {
            cursorId: cursor_id,
            hasNextPage: false,
            response: []
          } );
          return {
            status: true,
            items: []
          }
        }
      } else {
        this.opts.preloadMap.set( search, {
          cursorId: cursor_id,
          hasNextPage: false,
          response: []
        } );
        return {
          status: false
        }
      }
    }
  }