
  class Scroll {
    constructor( node, mainEl, parentSelf ) {
      this.mainEl = mainEl;
      this.scroll = node;
      this.scrollPath = this.scroll.firstChild;
      this.parentSelf = parentSelf;

      const wheelEvent = ( we, delta = 0 ) => {
        if ( this.scrollHidden ) {
          return;
        }

        if ( we.wheelDeltaY || we.wheelDelta ) {
          delta = ( we.wheelDeltaY || we.wheelDelta ) / 2;
        } else if ( we.detail ) {
          delta = -we.detail * 10;
        }

        let prevPosition = mainEl.scrollTop,
          wheelClass = 'wheel';

        mainEl.scrollTop -= delta;

        this.scrollUpdate();

        if ( prevPosition != mainEl.scrollTop ) {
          if ( !this.scroll.hasClass( wheelClass ) ) {
            this.scroll.setClass( wheelClass );
          }

          clearTimeout( this.scrollOverTimer );

          this.scrollOverTimer = setTimeout( () => {
            this.scroll.remClass( wheelClass );
          }, 500 );
        }
      }

      w.addEvent( mainEl, 'DOMMouseScroll', wheelEvent );
      w.addEvent( mainEl, 'mousewheel', wheelEvent );
      w.addEvent( this.scroll, 'mousedown',
        this.scrollDraggable.bind( this )
      );

      return this;
    }

    show() {
      this.scrollHidden = false;
      if ( this.scroll.hasClass( 'hide' ) ) {
        this.scroll.remClass('hide');
      }
    }

    hide() {
      this.scrollHidden = true;
      if ( !this.scroll.hasClass( 'hide' ) ) {
        this.scroll.setClass( 'hide' );
      }
    }

    scrollUpdate() {
      this.preload( this.scrollPositionInPercents() );

      const contentHeight = this.mainEl.scrollHeight,
        mainElHeight = this.mainEl.offsetHeight;

      if ( contentHeight <= mainElHeight ) {
        this.hide();
      } else {
        this.show();
      }

      const top =  Math.min( 1, this.mainEl.scrollTop / ( contentHeight - mainElHeight ) ),
        sliderHeight = Math.max( 30, Math.floor( mainElHeight * mainElHeight / contentHeight ) );

      this.scrollPathHeight = sliderHeight;

      w.setStyles( this.scrollPath, {
        height: sliderHeight + 'px',
        marginTop: Math.max( 0 , Math.floor( ( mainElHeight - sliderHeight - 4 ) * top + 2 ) ) + 'px'
      } );
    }

    scrollTop( position ) {
      this.mainEl.scrollTop = parseInt( position );
      this.scrollUpdate();
    }

    scrollDraggable( e ) {
      if ( this.scrollHidden ) {
        return;
      }

      let startPosition = e.pageY;

      w.cancelEvent( e );

      this.scroll.setClass( 'over' );

      let contentHeight = this.mainEl.scrollHeight,
        mainElHeight = this.mainEl.offsetHeight;

      if ( !e.target.hasClass( 'scroll_path' ) ) {
        this.mainEl.scrollTop = Math.floor(
          ( contentHeight - mainElHeight ) * Math.min(
            1, ( e.offsetY - this.scrollPathHeight / 2 + 5 ) / ( mainElHeight - this.scrollPathHeight )
          )
        );
        this.scrollUpdate();
      }

      startPosition -= this.scrollPath.offsetTop;

      const move = ( event ) => {
        this.mainEl.scrollTop = Math.floor(
          ( contentHeight - mainElHeight ) *
          Math.min( 1, ( event.pageY - startPosition ) / ( mainElHeight - this.scrollPathHeight - 6 ) )
        );
        this.scrollUpdate();
      };

      const up = () => {
        w.removeEvent( window.document, 'mousemove', move );
        w.removeEvent( window.document, 'mouseup', up );
        this.scroll.remClass( 'over' );
      };

      w.addEvent( window.document, 'mousemove', move );
      w.addEvent( window.document, 'mouseup', up );
    }

    preload( scrollPos ) {
      if ( !this.preloaded ) {
        if ( scrollPos > 99 ) {
          this.preloaded = true;
          this.parentSelf.entity.preloadCallBack( this );
        }
      }
    }

    scrollPositionInPercents() {
      return ( Math.floor(
        ( parseInt( this.scrollPath.style.marginTop ) + 2 + parseInt( this.scrollPath.style.height )
        ) / ( this.scroll.offsetHeight / 100 )
      ) ) || 0;
    }
  }
