
  const DD_DEFAULT_CONFIG = {
    maxResultHeight: 200,
    items: [],
    withoutPhoto: false,
    multiSelect:  false,
    searchPlaceholder: 'Start typing something...',
    placeholderAddButton: 'Add',
    emptyResultText: 'Here is that empty...',
    preloadItems: [],
    preloadMap: new Map(),
    entityType: 'users',
    onChangeCallBack: () => {}
  };

  const DD_STATUS_INITIALIZED = 1;
  const DD_STATUS_READY = 2;
  const DD_STATUS_REMOVED = 3;

  class DropDown {
    constructor( nodeEl, options = {} ) {
      this.opts = Object.create( DD_DEFAULT_CONFIG );

      for ( let key of Object.keys( options ) ) {
        this.opts[ key ] = options[ key ];
      }

      switch ( this.opts.entityType ) {
        default:
        case 'users':
          this.entity = new Users( {
            parentEntity: this,
            preloadMap: this.opts.preloadMap
          } );
          break;
      }

      this.nodeEl = nodeEl;
      this.cur = this.curInit();
      this.status = DD_STATUS_INITIALIZED;

      this.storeSelected = new Map();
      this.activeItemClass = 'drop_down_active';
      this.mouseOverFlag = false;
      this.preloaded = false;
      this.preloadItems();

      this.create();

      return this;
    }

    preloadItems() {
      if ( this.opts.preloadItems.length > 0 ) {
        for ( let item of this.opts.preloadItems ) {
          if ( item.id ) {
            this.entity.storeLoadedAdd( item.id, item );
            if ( this.opts.items.length < 20 ) {
              this.opts.items.push( item );
            }
          }
        }
      }
    }

    curInit() {
      const node = window;
      if ( !( 'cur' in node ) ) {
        node[ 'cur' ] = {};
        if ( !( 'dropDownCount' in node.cur ) ) {
          node[ 'cur' ] = {
            dropDownCount: 0,
            dropDowns: new Map()
          };
        }
      }
      return node.cur;
    }

    selectItem( nodeId, id ) {
      let noHideFlag = false;

      if ( !this.opts.multiSelect ) {
        if ( this.storeSelected.size > 0 ) {
          if ( !nodeId.hasClass( this.activeItemClass ) ) {
            const nowActiveItemId = this.storeSelected.values().next().value.id;
            this.unSelectItem(
              nodeId || w.ge( 'dropDownId' + this.currentId + 'itemId' + nowActiveItemId ),
              nowActiveItemId
            );
          }
        }
      }

      if ( !nodeId.hasClass( this.activeItemClass ) ) {
        nodeId.setClass( this.activeItemClass );
      } else {
        noHideFlag = true;
        nodeId.remClass( this.activeItemClass );
      }

      if ( this.storeSelectedHas( id ) ) {
        this.storeSelectedRemove( id );
      } else {
        this.input.value = '';
        this.storeSelectedAdd( id, this.entity.storeLoaded.get( id ) );
        this.entity.search('');
      }

      if ( !noHideFlag ) {
        this.windowResultHide();
        this.windowResultSetDefaultItems();
      }

      this.opts.onChangeCallBack( this.getSelected() );
    }

    unSelectItem( nodeId, id ) {
      if ( nodeId.hasClass( this.activeItemClass ) ) {
        nodeId.remClass( this.activeItemClass );
      }
      if ( this.storeSelectedHas( id ) ) {
        this.storeSelectedRemove( id );
      }
    }

    storeSelectedAdd( id, value ) {
      this.elStoreSelected.innerHTML += this.renderSelectStoreItem( { value } );
      this.scroll.scrollTop( 0 );

      if ( this.windowResultOpened() ) {
        this.windowResultHide();
      }

      this.storeSelected.set( id, value );
      this.addButtonEvent();
    }

    storeSelectedHas( id ) {
      return this.storeSelected.has( id );
    }

    storeSelectedRemove( id, nodeId = false ) {
      const nodeIdSelEl = 'dropDownId' + this.currentId + 'storeItemIdId' + id;

      if ( w.ge( nodeIdSelEl ) ) {
        w.ge( nodeIdSelEl ).remove();
      }

      this.storeSelected.delete( id );

      const nodeIdItemElId = w.ge( 'dropDownId' + this.currentId +'itemId' + id );

      if ( nodeIdItemElId ) {
        if ( nodeIdItemElId.hasClass( this.activeItemClass ) ) {
          nodeIdItemElId.remClass( this.activeItemClass );
          this.opts.onChangeCallBack( this.getSelected() );
        }
      }

      this.addButtonEvent();
      this.windowResultHide();
      this.searchInputFocus();
    }

    searchInputFocus() {
      this.input.focus();
    }

    addButtonEvent() {
      const addButtonDisplay = ( display ) => {
        w.setStyles( w.ge( 'storeItemAddIdId' + this.currentId ), { display } )
      };

      if ( this.opts.multiSelect ) {
        addButtonDisplay( 'none' );
      }

      w.setStyles( this.input, { width: '100%' } );

      if ( this.storeSelected.size > 0 ) {
        if ( !this.windowResultOpened() ) {
          if ( this.opts.multiSelect ) {
            addButtonDisplay( 'block' );
          }
          w.setStyles( this.input, { width: 0 } );
        }
      }
    }

    blurHelper( node ) {
      const allowClass = [ 'drop_down_c_left', 'drop_down_container_content', 'drop_down', 'drop_down_container' ]
      for ( let aClass of allowClass ) {
        if ( node.classList[ 0 ] == aClass ) {
          if ( this.windowResultOpened() ) {
            this.windowResultHide();
          } else {
            this.searchInputFocus();
          }
        }
      }
    }

    windowResultHide() {
      if ( this.windowResultOpened() ) {
        this.dropDownItems.style.display = 'none';

        this.addButtonEvent();

        w.setStyles( this.currentEl.querySelector( '.drop_down_container' ) , {
          borderRadius: '2px',
          webkitBorderRadius: '2px'
        } );

        w.ge( 'svgVector' + this.currentId ).innerHTML =
          `<svg viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>`;

        if ( !this.opts.multiSelect ) {
          w.ge( 'storeSelected' + this.currentId ).style.display = 'block';
        }
      }
    }

    allWindowsHide() {
      for ( let i of this.cur.dropDowns.keys() ) {
        if ( this.cur.dropDowns.get( i ).windowResultOpened() ) {
          this.cur.dropDowns.get( i ).windowResultHide();
        }
      }
    }

    windowResultShow() {
      this.allWindowsHide();
      if ( !this.windowResultOpened() ) {
        const brStyleWithWindowOpened = '2px 2px 0 0';

        w.setStyles( this.currentEl.querySelector( '.drop_down_container' ), {
          borderRadius: brStyleWithWindowOpened,
          webkitBorderRadius: brStyleWithWindowOpened
        } );

        this.dropDownItems.style.display = 'block';

        this.addButtonEvent();

        w.ge( 'svgVector' + this.currentId ).innerHTML =
          `<svg viewBox="0 0 24 24"><path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />></svg>`;

        if ( !this.opts.multiSelect ) {
          w.ge( 'storeSelected' + this.currentId ).style.display = 'none';
        }
      }
    }

    windowResultToggle() {
      if ( !this.windowResultOpened() ) {
        this.searchInputFocus();
      } else {
        this.windowResultHide();
      }
    }

    windowResultOpened() {
      return this.dropDownItems.style.display == 'none' ? false : true;
    }

    windowResultClear() {
      this.dropDownResult.innerHTML = '';
      const emptyEl = w.ge( 'empty_result' + this.currentId );
      if ( !emptyEl ) {
        this.dropDownResult.innerHTML = this.emptyResultCode;
      }
      this.scroll.hide();
    }

    windowResultAddItems( data ) {
      const emptyEl = w.ge( 'empty_result' + this.currentId );
      if ( emptyEl ) {
        emptyEl.remove();
      }

      this.scroll.hide();

      let items = this.entity.renderAllItems( data );
      this.dropDownResult.innerHTML += items;

      let alreadyExists = [];
      w.each( w( '.drop_down_item', w( '#dropDownItemsId' + this.currentId ) ), (i, item) => {
        let itemId = parseInt( item.getAttribute( 'data-itemId' ) );
        if ( alreadyExists.indexOf( itemId ) > -1 ) {
          w.ge( `dropDownId${ this.currentId }itemId${ itemId }` ).remove();
        } else {
          alreadyExists.push( itemId );
        }
      });

      this.scroll.show();
    }

    windowResultSetDefaultItems() {
      let res = false;
      this.windowResultClear();
      if ( 'items' in this.opts ) {
        if ( this.opts.items.length > 0 ) {
          this.windowResultAddItems( this.opts.items );
          res = true;
        }
      }
      return res;
    }

    onfocusoutEvent() {
      if ( !this.mouseOverFlag ) {
        this.windowResultHide();
      }
    }

    renderItem( id, title, photo = false, description = '', otherInfo = '' ) {
      let activeClass = '';
      if ( this.storeSelectedHas( id ) ) {
        activeClass = ' ' + this.activeItemClass;
      }

      return `
        <div class="drop_down_item noSelect${ activeClass }" id="dropDownId${ this.currentId }itemId${ id }" onclick="cur.dropDowns.get( ${ this.currentId } ).selectItem( this, ${ id } );" data-itemId="${ id }">
         ${( !this.opts.withoutPhoto ) ? `<div class="drop_down_item_left"><div class="drop_down_item_photo" style="background-image: url(${ photo });"></div></div>` : ``}
          <div class="drop_down_item_content">
            <div class="drop_down_name">
              <span>${ title } ${ otherInfo.length > 0 ? '<text style="color: #bbb;">(' + otherInfo + ')</text>' : '' }</span>
            </div>
            <div class="drop_down_description">
              <span>${ description }</span>
            </div>
          </div>
          ${ this.opts.multiSelect ? `
          <div class="drop_down_item_right">
            <div class="drop_down_svg_right_item">
              <svg viewBox="0 0 24 24">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            </div>
          </div>
          ` : `` }
        </div>
      `;
    }

    renderSelectStoreItem( data ) {
      const { id, first_name, last_name } = data.value;
      let text = first_name + ' ' + last_name;
      return `
        <div class="drop_down_store_item" id="dropDownId${ this.currentId }storeItemIdId${ id }">
          <div class="drop_down_store_item_left">
            <span>${ text }</span>
          </div>
          <div class="drop_down_store_item_right" onclick="cur.dropDowns.get( ${ this.currentId } ).storeSelectedRemove( ${ id }, this );">
            <span>
            <svg viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
            </span>
          </div>
        </div>
      `;
    }

    keyEvent( ev, val ) {
      if ( this.disabled ) {
        return;
      }

      if ( ev.keyCode != 27 && ev.keyCode != 38 && ev.keyCode != 40 && ev.keyCode != 13 ) {
        return this.entity.search( val );
      }

      switch( ev.keyCode ) {
        case 27:
          if ( this.windowResultOpened() ) {
            this.windowResultHide();
          }
          break;
      }
    }

    create() {
      this.cur.dropDownCount++;
      this.currentId = this.cur.dropDownCount;
      this.emptyResultCode = `<div class="drop_down_empty_result" id="empty_result${ this.currentId }" onclick="cur.dropDowns.get( ${ this.currentId } ).windowResultHide()">${ this.opts.emptyResultText }</div>`;

      let items = this.emptyResultCode;
      if ( 'items' in this.opts ) {
        if ( this.opts.items.length > 0 ) {
          items = this.entity.renderAllItems( this.opts.items );
        }
      }

      const DROP_DOWN_TEMPLATE = `
        <div class="drop_down" id="dropDownId${ this.currentId }">
          <div class="drop_down_container noSelect" onblur="cur.dropDowns.get( ${ this.currentId } ).windowResultHide();">
            <div class="drop_down_container_content">
              <div class="drop_down_c_left">
                <div class="drop_down_storeSelected" id="storeSelected${ this.currentId }"></div>
                <div class="drop_down_store_item drop_down_add_button" id="storeItemAddIdId${ this.currentId }" onclick="cur.dropDowns.get( ${ this.currentId } ).searchInputFocus();" style="display: none">
                  <div class="drop_down_store_item_left">
                    <span>${ this.opts.placeholderAddButton }</span>
                  </div>
                  <div class="drop_down_store_item_right">
                    <span>
                      <svg viewBox="0 0 24 24">
                        <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <input type="text" id="dropDownInput${ this.currentId }" placeholder="${ this.opts.searchPlaceholder }" onclick="cur.dropDowns.get( ${ this.currentId } ).windowResultShow();" onfocus="cur.dropDowns.get( ${ this.currentId } ).windowResultShow();" onfocusout="cur.dropDowns.get( ${ this.currentId } ).onfocusoutEvent();" onkeyup="cur.dropDowns.get(${ this.currentId }).keyEvent( event, this.value );">
              </div>
              <div class="drop_down_c_right" onclick="cur.dropDowns.get( ${ this.currentId } ).windowResultToggle();">
                <div class="drop_down_svg_vector" id="svgVector${ this.currentId }"><svg viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg></div>
              </div>
            </div>
            <div class="drop_down_items" id="dropDownItemsId${ this.currentId }" style="display: none">
              <div class="drop_down_scroll" id="dropDownScroll${ this.currentId }"><div class="scroll_path" id="scrollPath${ this.currentId }"></div></div>
              <div class="drop_down_result" id="dropDownResult${ this.currentId }" style="max-height: ${ this.opts.maxResultHeight }px;">
                ${ items }
              </div>
            </div>   
          </div>
        </div>
      `;

      let dropDown = document.createElement( 'div' );
        dropDown.innerHTML = DROP_DOWN_TEMPLATE;
        dropDown = dropDown.firstElementChild;

      w.addEvent( dropDown, 'mouseover', () => {
        this.mouseOverFlag = true;
      } );

      w.addEvent( dropDown, 'mouseout', () => {
        this.mouseOverFlag = false;
      } );

      w.addEvent( dropDown, 'click', () => {
        this.blurHelper( event.path[ 0 ] );
      } );

      this.nodeEl.append(dropDown);
      this.dropDownResult = w.ge( 'dropDownResult' + this.currentId );

      this.scroll = new Scroll(
        w.ge( 'dropDownScroll' + this.currentId ),
        this.dropDownResult,
        this
      );

      this.status = DD_STATUS_READY;
      this.currentEl = w.ge( 'dropDownId' + this.currentId );
      this.elStoreSelected = w.ge( 'storeSelected' + this.currentId );
      this.input = w.ge( 'dropDownInput' + this.currentId );
      this.dropDownItems = w.ge( 'dropDownItemsId' + this.currentId );
      this.cur.dropDowns.set( this.currentId, this );

      return this;
    }

    getSelected() {
      let items = [];
      for (let item of this.storeSelected.values()) {
        items.push(item);
      }
      return items;
    }

    remove() {
      this.cur.dropDowns.delete( this.currentId );
      this.currentEl.parentNode.removeChild( this.currentEl );
      this.status = DD_STATUS_REMOVED;
    }

    static removeById( id ) {
      const node = window;
      if ( 'cur' in node ) {
        let getDropDownObjectInfo = node.cur.dropDowns.get( id );

        if ( getDropDownObjectInfo ) {
          getDropDownObjectInfo.status = DD_STATUS_REMOVED;
          node.cur.dropDowns.delete( id );
          w.ge( 'dropDownId' + getDropDownObjectInfo.currentId ).remove();
        }
      }
    }
  }
