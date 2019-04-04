;(function() {
  var version = 1.0;

  function w( value, node ) {
    var node = node || document;
    if ( isString( value ) ) {
      if ( indexOf( "#", value ) > -1 ) {
        return ge( replace( "#", "", value ) ) || [];
      } else {
        if ( indexOf( ".", value ) > -1 ) {
          return node.querySelectorAll( value );
        } else {
          return geByTag( value, node );
        }
      }
    } else {
      return value;
    }
  }

  if ( !window._ua ) {
    var _ua = navigator.userAgent.toLowerCase();
  }

  let browser = {
    version: (_ua.match(/.+(?:me|ox|on|rv|it|era|opr|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
    opera: (/opera/i.test(_ua) || /opr/i.test(_ua)),
    msie: (/msie/i.test(_ua) && !/opera/i.test(_ua) || /trident\//i.test(_ua)),
    msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
    msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
    msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
    msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
    mozilla: /firefox/i.test(_ua),
    chrome: /chrome/i.test(_ua),
    safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
    iphone: /iphone/i.test(_ua),
    ipod: /ipod/i.test(_ua),
    iphone4: /iphone.*OS 4/i.test(_ua),
    ipod4: /ipod.*OS 4/i.test(_ua),
    ipad: /ipad/i.test(_ua),
    android: /android/i.test(_ua),
    bada: /bada/i.test(_ua),
    mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/i.test(_ua),
    msie_mobile: /iemobile/i.test(_ua),
    safari_mobile: /iphone|ipod|ipad/i.test(_ua),
    opera_mobile: /opera mini|opera mobi/i.test(_ua),
    opera_mini: /opera mini/i.test(_ua),
    mac: /mac/i.test(_ua),
    search_bot: /(yandex|google|stackrambler|aport|slurp|msnbot|bingbot|twitterbot|ia_archiver|facebookexternalhit)/i
      .test(_ua)
  };

  var parse = ( window.JSON && JSON.parse ) ? ( o ) => {
    try {
      return JSON.parse( o );
    } catch( e ) {
      console.log( e.message );
      return eval( '(' + o + ')' );
    }
  } : ( o ) => {
    return eval( '(' + o + ')' );
  }

  function $_GET() {
    var $_GET = {},
      __GET = window.location.search.substring( 1 ).split( "&" );

    for ( var i = 0; i < __GET.length; i++ ) {
      var getVar = __GET[ i ].split( "=" );

      if ( __GET[i] != "" ) {
        $_GET[ getVar[ 0 ] ] = typeof( getVar[ 1 ] ) == "undefined" ? "" : getVar[ 1 ];
      }
    }

    return $_GET;
  }

  function URLToArray( url ) {
    var request = {};
    var pairs = url.substring( url.indexOf( '?' ) + 1 ).split( '&' );

    for ( var i = 0; i < pairs.length; i++ ) {
      if ( !pairs[i] ) continue;
      var pair = pairs[ i ].split( '=' );
      request[ decodeURIComponent( pair[ 0 ] ) ] = decodeURIComponent( pair[ 1 ] );
    }
    return request;
  }

  var xhr = function() {
    var req = null;
    try {
      req = new ActiveXObject( "Msxml2.XMLHTTP" );
    } catch ( e ) {
      try {
        req = new ActiveXObject( "Microsoft.XMLHTTP" );
      } catch ( e ) {
        try {
          req = new XMLHttpRequest();
        } catch( e ) {}
      }
    }

    if ( req == null )
      throw new Error( 'XMLHttpRequest not supported' );
    return req;
  }

  function ge( element ) {
    return ( typeof element == 'string' || typeof element == 'number' ) ? document.getElementById( element ) : element;
  }

  function geByTag( search, node ) {
    node = ge( node ) || document;
    return node.getElementsByTagName( search );
  }

  var remClass = function( c ) {
    var re = new RegExp( "(^|\\s)" + c + "(\\s|$)", "g" );
    this.className = this.className.replace( re, "$1" ).replace( /\s+/g, " " ).replace( /(^ | $)/g, "" )
    return this;
  }

  var setClass = function( c ) {
    var re = new RegExp( "(^|\\s)" + c + "(\\s|$)", "g" );
    this.className = ( this.className + " " + c ).replace( /\s+/g, " " ).replace( /(^ | $)/g, "" )
    return this;
  }

  var hasClass = function( name ) {
    if ( this && this.nodeType === 1 && ( " " + this.className + " " ).replace( /[\t\r\n\f]/g, " " ).indexOf( " " + name + " " ) >= 0) {
      return true;
    }
    return false;
  }

  var toggleClass = function( obj, name ) {
    ( hasClass.call( obj, name ) === false ? setClass : remClass ).call( obj, name );
    return obj;
  }

  var replaceClass = function( obj, oldName, newName ) {
    remClass.call( obj, oldName );
    setClass.call( obj, newName );
  }

  function removeEl( el ) {
    el = ge( el );
    if ( el && el.parentNode ) el.parentNode.removeChild( el );
    return el;
  }

  var st = function( styles ) {
    if ( isArray( this ) ) {
      if ( this.length < 1 ) return;
    }

    var length = isArray( this ) ? this.length : 1;

    if ( length > 1 ) {
      each.call( this, function( k, v ) {
        if ( isObject( styles ) ) {
          var el = v;
          setStyles( el, styles );
        }
      });
    } else {
      if ( isObject( styles ) ) {
        setStyles( this, styles );
      }
    }
  }

  function setStyles( el, styles ) {
    each.call( styles, function( k, v ) {
      if ( isArray( el ) ) {
        el = el[ 0 ];
      }
      if ( el ) {
        el.style[ k ] = v;
      }
    });
  }

  var getElByClass = function( cl, el, tag ) {
    el = ge( el ) || document;
    tag = tag || '*';

    var classElements = [];

    if ( el.querySelectorAll && tag != '*' ) {
      return el.querySelectorAll( tag + '.' + cl );
    }

    if ( el.getElementsByClassName ) {
      var allElements = el.getElementsByClassName( cl );
      if ( tag != '*' ) {
        tag = tag.toUpperCase();
        for ( var i = 0, l = allElements.length; i < l; ++i ) {
          if ( allElements[ i ].tagName.toUpperCase() == tag ) {
            classElements.push( allElements[ i ] );
          }
        }
      } else {
        classElements = Array.prototype.slice.call( allElements );
      }
      return classElements;
    }

    var els = geByTag( tag, el );
    var pattern = new RegExp('(^|\\s)' + cl + '(\\s|$)');
    for ( var i = 0, l = els.length; i < l; ++i ) {
      if ( pattern.test( els[ i ].className ) ) {
        classElements.push( els[ i ] );
      }
    }
    return classElements;
  }

  function getCookie( name ) {
    var matches = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace( /([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1' ) +	"=([^;]*)" )
    );
    return matches ? decodeURIComponent( matches[ 1 ] ) : undefined
  }

  function setCookie( name, value, props ) {
    props = props || {};
    var exp = props.expires;

    if ( typeof exp == "number" && exp ) {
      var d = new Date();
      d.setTime( d.getTime() + exp * 1000 );
      exp = props.expires = d
    }

    if ( exp && exp.toUTCString ) {
      props.expires = exp.toUTCString()
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for ( var propName in props ) {
      updatedCookie += "; " + propName;

      var propValue = props[ propName ];

      if ( propValue !== true ) {
        updatedCookie += "=" + propValue
      }
    }
    document.cookie = updatedCookie
  }

  function replace( search, replace, subject, count ) {
    var i = 0,
      j = 0,
      temp = '',
      repl = '',
      sl = 0,
      fl = 0,
      f = [].concat( search ),
      r = [].concat( replace ),
      s = subject,
      ra = Object.prototype.toString.call(r) === '[object Array]',
      sa = Object.prototype.toString.call(s) === '[object Array]';
    s = [].concat(s);

    if ( count ) this.window[ count ] = 0;

    for ( i = 0, sl = s.length; i < sl; i++ ) {
      if ( s[ i ] === '' ) continue;
      for ( j = 0, fl = f.length; j < fl; j++ ) {
        temp = s[ i ] + '';
        repl = ra ? ( r[ j ] !== undefined ? r[ j ] : '' ) : r[ 0 ];
        s[ i ] = ( temp ).split(f[ j ]).join( repl );

        if ( count && s[ i ] !== temp ) {
          this.window[ count ] += ( temp.length - s[ i ].length ) / f[ j ].length;
        }
      }
    }
    return sa ? s : s[ 0 ];
  }

  function remCookie( name ) {
    setCookie( name, null, { expires: -1 } );
  }

  function indexOf( value, arr, from ) {
    for ( var i = from || 0, l = ( arr || [] ).length; i < l; i++ ) {
      if ( arr[ i ] == value ) return i;
    }
    return -1;
  }

  function dec2hex( d ) {
    return ( d > 15 ) ? ( d.toString( 16 ) ) : ( "0" + d.toString( 16 ) )
  }

  function rgb2hex( r, g, b ) {
    return "#" + dec2hex( r ) + dec2hex( g ) + dec2hex( b )
  }

  function isFunction( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Function]';
  }

  function isArray( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Array]' || Object.prototype.toString.call( obj ) === "[object NodeList]";
  }

  function isObject( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Object]' && !( browser.msie8 && obj && obj.item !==
      'undefined' && obj.namedItem !== 'undefined');
  }

  function isUndefined( obj ) {
    return typeof obj === 'undefined';
  }

  function isEmpty( o ) {
    if ( Object.prototype.toString.call( o ) !== '[object Object]' ) {
      return false;
    }
    for( var i in o ) {
      if ( o.hasOwnProperty( i ) ) return false;
    }
    return true;
  }

  function ts() {
    return parseInt( ( +new Date/1000 ).toFixed( 0 ) );
  }

  function stripHTML( text ) {
    return text ? text.replace( /<(?:.|\s)*?>/g, '' ) : '';
  }

  function isString( obj ) {
    return typeof obj === 'string';
  }

  function irrandom( min, max ) {
    return Math.floor( random( min, max ) );
  }

  function random( min, max ) {
    return Math.random() * ( max - min + 1 ) + min;
  }

  var each = function( callback ) {
    if ( !isObject( this ) && typeof this.length !== 'undefined' ) {
      for ( var i = 0, length = this.length; i < length; i++ ) {
        var value = this[ i ];
        if ( callback.call( value, i, value ) === false ) break;
      }
    } else {
      for ( var name in this ) {
        if ( !Object.prototype.hasOwnProperty.call( this, name ) ) continue;
        if ( callback.call( this[ name ], name, this[ name ] ) === false)
          break;
      }
    }
    return this;
  }

  function createEl( tagName, attributes, content ) {
    var el = document.createElement( tagName );
    if ( isObject( attributes ) ) {
      for ( var i in attributes ) {
        el.setAttribute( i, attributes[ i ] );
        if ( i.toLowerCase() == 'class' ) {
          el.className = attributes[ i ];
        } else if ( i.toLowerCase() == 'style' ) {
          el.style.cssText = attributes[ i ];
        }
      }
    }
    if ( content ) {
      el.innerHTML = content;
    }
    return el;
  }

  function addEvent( el, type, fn ) {
    if ( el.addEventListener ) {
      el.addEventListener( type, fn, false );
    } else if ( el.attachEvent ) {
      el.attachEvent( 'on' + type, fn );
    }
  }

  function cancelEvent( e ) {
    e = e || window.event;

    if ( !e ) {
      return false;
    }

    if ( e.preventDefault ) {
      e.preventDefault();
    }

    if ( e.stopPropagation ) {
      e.stopPropagation();
    }

    event.cancelBubble = true;
    event.returnValue = false;
  }

  function removeEvent( el, type, fn ) {
    if ( el.addEventListener ) {
      el.removeEventListener( type, fn, false );
    } else {
      el.detachEvent( 'on' + type, fn );
    }
  }

  function timeZone( offset ) {
    var d = new Date();
    var utc = d.getTime() - ( d.getTimezoneOffset() * 60000 );
    var nd = new Date( utc + ( 3600000 * offset ) );

    return parseInt( ( +nd / 1000 ).toFixed( 0 ) );
  }

  function ts() {
    return timeZone( (( new Date().getTimezoneOffset() / 60 ) )
      -(( new Date().getTimezoneOffset() / 60 )
      -(( new Date().getTimezoneOffset() / 60) + 0 ))
    );
  }

  const http = function( opts ) {
    var xhr = w.xhr();
    let url = opts.url || location.pathname;

    let type = 'type' in opts ? opts.type.toUpperCase() : 'POST',
      json = true;

    if ( 'json' in opts ) {
      if ( opts.json == false ) {
        json = false;
      }
    }

    if ( type != 'POST' ) {
      json = false;
    }

    let body = '';
    if ( 'body' in opts ) {
      if ( opts.body ) {
        if ( json == false ) {
          let arr = [];
          for ( let key in opts.body ) {
            arr.push( key + "=" + encodeURIComponent( opts.body[ key ] ) );
          }
          body = arr.join( "&" );
        } else {
          if ( typeof opts.body == "object" ) {
            body = JSON.stringify( opts.body );
          } else {
            body = opts.body;
          }
        }
      }
    } else {
      if ( json ) {
        body = JSON.stringify( {} );
      } else {
        if ( 'formData' in opts ) {
          body = ['\r\n'];
        }
      }
    }

    if ( type != "POST" && body != '') {
      url = url + "?" + body;
    }

    xhr.open( type, url , false );

    if ( json == false ) {
      xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
    } else {
      xhr.setRequestHeader( 'Content-Type', 'application/json' );
    }

    if ( 'formData' in opts) {
      let data = {};

      let boundary = String( Math.random() ).slice( 2 );
      let boundaryMiddle = '--' + boundary + '\r\n';
      let boundaryLast = '--' + boundary + '--\r\n'


      for ( let key in data ) {
        body.push( 'Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + data[ key ] + '\r\n' );
      }

      body = body.join( boundaryMiddle ) + boundaryLast;
      xhr.setRequestHeader( 'Content-Type', 'multipart/form-data; boundary=' + boundary );
    }

    if ( type != 'POST' ) {
      xhr.send();
    } else {
      xhr.send( body );
    }

    switch ( xhr.status ) {
      case 500:
        console.log( "Internal server error: " + http_code );
        return false;
        break;
      case 200:
      default:
        if ( 'full' in opts ) {
          return xhr;
        } else {
          return w.parse( xhr.responseText );
        }
        break;
    }
  };

  w.version = version;
  w.timeZone = timeZone;
  w.addEvent = addEvent;
  w.cancelEvent = cancelEvent;
  w.removeEvent = removeEvent;
  w.ts = ts;
  w.irrandom = irrandom;
  w.get = $_GET;
  w.replace = replace;
  w.parse = parse;
  w.xhr = xhr;
  w.http = http;
  w.ge = ge;
  w.geByTag = geByTag;
  w.removeEl = removeEl;
  w.getElByClass = getElByClass;
  w.random = random;
  w.getCookie = getCookie;
  w.setCookie = setCookie;
  w.remCookie = remCookie;
  w.dec2hex = dec2hex;
  w.rgb2hex = rgb2hex;
  w.browser = browser;
  w.isFunction = isFunction;
  w.isArray = isArray;
  w.isObject = isObject;
  w.isString = isString;
  w.stripHTML = stripHTML;
  w.ts = ts;
  w.isEmpty = isEmpty;
  w.isUndefined = isUndefined;
  w.indexOf = indexOf;
  w.toggleClass = toggleClass;
  w.replaceClass = replaceClass;
  w.createEl = createEl;
  w.URLToArray = URLToArray;
  w.setStyles = setStyles;

  w.hasClass = function( th, name ) {
    return hasClass.call( th, name );
  };

  w.st = function( th, styles ) {
    st.call( th, styles);
  };

  w.each = function( th, callback ) {
    each.call( th, callback );
  };

  w.tag = function( search, node ) {
    return geByTag( search, node )[ 0 ];
  };

  Object.defineProperty( Object.prototype, "hasClass", {
    value: hasClass,
    enumerable : false
  } );

  Object.defineProperty( Object.prototype, "each", {
    value: each,
    enumerable : false
  } );

  Object.defineProperty( Object.prototype, "setClass", {
    value: setClass,
    enumerable : false
  } );

  Object.defineProperty( Object.prototype, "remClass", {
    value: remClass,
    enumerable : false
  } );

  Object.defineProperty( Object.prototype, "st", {
    value: st,
    enumerable : false
  } );

  window.w = w;
}(window));