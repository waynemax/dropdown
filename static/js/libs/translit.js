
  const RU_CHAR_2_ENG = {
    'а':'f', 'б':',', 'в':'d',
    'г':'u', 'д':'l', 'е':'t',
    'ё':'t', 'ж':';', 'з':'p',
    'и':'b', 'й':'q', 'к':'r',
    'л':'k', 'м':'v', 'н':'y',
    'о':'j', 'п':'g', 'р':'h',
    'с':'c', 'т':'n', 'у':'e',
    'ф':'a', 'х':'[', 'ц':'w',
    'ч':'x', 'ш':'i', 'щ':'o',
    'ы':'s', 'э':"'", 'ю':'.',
    'я':'z', 'ъ':']', 'ь':'m'
  };

  const ENG_CHAR_2_RU = Object.keys( RU_CHAR_2_ENG )
    .filter( RU_CHAR_2_ENG.hasOwnProperty.bind( RU_CHAR_2_ENG ) )
    .reduce( ( obj, key ) => {
      obj[ RU_CHAR_2_ENG[ key ] ] = key;
      return obj;
    }, {} );

  ENG_CHAR_2_RU['t'] = 'е';
  ENG_CHAR_2_RU["'"] = 'э';
  ENG_CHAR_2_RU[','] = 'б';
  ENG_CHAR_2_RU['['] = 'х';
  ENG_CHAR_2_RU[']'] = 'ъ';

  const TRANSLIT_RU_2_ENG_CHARS = {
    'а':'a', 'б':'b', 'в':'v',
    'г':'g', 'д':'d', 'е':'e',
    'ё':'e', 'ж':'j', 'з':'z',
    'и':'i', 'й':'y', 'к':'k',
    'л':'l', 'м':'m', 'н':'n',
    'о':'o', 'п':'p', 'р':'r',
    'с':'s', 'т':'t', 'у':'u',
    'ф':'f', 'х':'h', 'ц':'c',
    'ч':'ch','ш':'sh','щ':'sh',
    'ы':'y', 'э':'e', 'ю':'yu',
    'я':'ya','ъ': 'j','ь': "'"
  }

  const TRANSLIT_ENG_2_RU_CHARS = Object.keys( TRANSLIT_RU_2_ENG_CHARS )
    .filter( TRANSLIT_RU_2_ENG_CHARS.hasOwnProperty.bind( TRANSLIT_RU_2_ENG_CHARS ) )
    .reduce( ( obj, key ) => {
      obj[ TRANSLIT_RU_2_ENG_CHARS[ key ] ] = key;
      return obj;
    }, {} );

  TRANSLIT_ENG_2_RU_CHARS.w = 'в';
  TRANSLIT_ENG_2_RU_CHARS.e = 'е';

  function translitToENG( str, arr = TRANSLIT_RU_2_ENG_CHARS ) {
    str = str.toLowerCase();
    let replacer = function(a) {
      return arr[ a ] || a;
    };
    return str.replace(/[А-яёЁ]/g, replacer)
  }

  function translitToRU( str, arr = TRANSLIT_ENG_2_RU_CHARS ) {
    str = str.toLowerCase();
    let replacer = function(a) {
      return arr[ a ] || a;
    };
    return str.replace(/[a-zA-Z',[\]]/g, replacer)
  }
