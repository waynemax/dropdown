<?
  function router_checkRequire() {
     if (!defined('ROUTER')) {
       http_response_code(500);
       die;
     }
  }

  function isJson($data) {
    json_decode($data);
    return (json_last_error() == JSON_ERROR_NONE);
  }

  function debugDump($data, $json = false) {
    if ($json && gettype($data) == "array") {
      echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
      print_r($data);
    }
    exit;
  }

  function positive($i) {
    $i = intval($i);
    return ($i > 0) ? $i : 0;
  }

  function getIP() {
    if (array_key_exists('HTTP_CLIENT_IP', $_SERVER)) {
      return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (array_key_exists('HTTP_X_FORWARDED_FOR', $_SERVER)) {
      return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
      return $_SERVER['REMOTE_ADDR'];
    }
  }

  function coercionType($data) {
    switch (gettype($data)) {
      case "object":
      case "array":
        $return = [];
        foreach ($data as $key => $value) {
          $return[$key] = coercionType($value);
        }
        return $return;
        break;
      case "integer":
        return positive($data);
        break;
      case "string":
        return is_numeric($data) ? (int) $data : isJson($data) ? json_decode($data, true) : (string) $data;
        break;
      case "null":
        return null;
        break;
      default:
        return $data;
        break;
    }
  }

  function getInParams() {
    $_SERVER['REQUEST_URI'] = explode("?", $_SERVER['REQUEST_URI'])[0];
    return [
      "getParams" => $_SERVER['QUERY_STRING'],
      "url" => $_SERVER['REQUEST_URI'],
      "httpHost" => $_SERVER['HTTP_HOST'],
      "protocol" => $_SERVER['REQUEST_SCHEME'],
      "full" => $_SERVER['REQUEST_SCHEME']."://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']."?".$_SERVER['QUERY_STRING']
    ];
  }

  function errorAdd($fieldName, $message) {
    return array(
      "code" => $fieldName,
      "message" => $message
    );
  }

  function errorsThrow(array $errors = []) {
    $response = [
      "errors" => [],
      "data" => []
    ];
    if ($errors) {
      foreach ($errors as $value) {
        $response['errors'][] = $value;
      }
      echo json_encode($response, JSON_UNESCAPED_UNICODE);
      exit;
    }
  }

  function responseBuilder(array $errors = [], array $data = []) {
    $response = [
      "errors" => $errors,
      "data" => []
    ];
    if ($data && empty($response['errors'])) {
      foreach ($data as $value) {
        $response['data'][] = $value;
      }
    }
    return json_encode($response, JSON_UNESCAPED_UNICODE);
  }

  function checkInData(string $requestMethod, array $obligatories = [], array $optional = []) {
    global $errors, $errorsList;

    $getParams = query2Array(getInParams()['getParams']);
    $reqMethod = mb_strtoupper($_SERVER['REQUEST_METHOD']);

    if ($reqMethod != mb_strtoupper($requestMethod)) {
      if ($reqMethod != 'OPTIONS') {
        $errors[] = errorAdd(
          $errorsList['common']['only' . mb_strtoupper($requestMethod)][0],
          $errorsList['common']['only' . mb_strtoupper($requestMethod)][1]
        );
        http_response_code(405);
        errorsThrow($errors);
      }
    }

    $in = mb_strtoupper($requestMethod) == "POST" ? $_POST : $getParams;

    if (is_array($obligatories) && is_array($optional)) {
      if (!empty($obligatories)) {
        foreach ($obligatories as $key => $value) {
          switch (gettype($value)) {
            case 'array':
              $leastOneFlag = false;
              foreach ($value as $kk => $vv) {
                $optional[] = $vv;
                if ($in[$vv]) {
                  $leastOneFlag = true;
                }
              }
              if (!$leastOneFlag) {
                $errors[] = errorAdd(
                  $errorsList['common']['need_fields'][0],
                  $errorsList['common']['need_fields'][1]." `".join(" || ", $value)."`"
                );
                http_response_code(400);
              }
              break;
            case 'string':
              if ($in[$value] == '') {
                $errors[] = errorAdd(
                  $errorsList['common']['need_fields'][0],
                  $errorsList['common']['need_fields'][1]." `".$value."`"
                );
                http_response_code(400);
              }
              break;
          }
        }
      }

      if (is_array($in) && !empty($in)) {
        $merge = array_merge($obligatories, $optional);
        foreach ($in as $key => $value) {
          if (!in_array($key, $merge)) {
            $errors[] = errorAdd(
              $errorsList['common']['unknown_field'][0],
              $errorsList['common']['unknown_field'][1]." `".$key."`"
            );
            http_response_code(400);
          }
        }
      }
    }

    errorsThrow($errors);
    return $in;
  }

  function checkType($data, $needType, $fieldName = '') {
    global $errorsList;
    $gt = gettype($data);
    if ($data == '0') {
      $gt = 'integer';
    }
    if ($gt != $needType) {
      $errors[] = errorAdd(
        $errorsList['common']['wrong_type'][0],
        $errorsList['common']['wrong_type'][1].". Reason field : ".$fieldName
      );
      http_response_code(400);
      errorsThrow($errors);
    }
  }

  function limitInt(int $inInt, int $maxInt) {
    $inInt = positive($inInt);
    if ($inInt >= $maxInt) {
      return $maxInt;
    } else {
      return $inInt;
    }
  }

  function escapeStr($str) {
    return stripslashes(addslashes(htmlspecialchars(strip_tags(escape($str)))));
  }

  function query2Array(string $string = '') {
    $result = [];
    if (!strpos($string, '=')) {
      return [];
    }
    if (strpos($string, '?') !== false) {
      $q = parse_url($string);
      $string = $q['query'];
    }

    foreach (explode('&', $string) as $couple) {
      list ($key, $val) = explode('=', $couple);
      $result[$key] = urldecode($val);
    }
    return empty($result) ? [] : $result;
  }

  function translit(string $string) {
    $string = str_replace(array("\n", "\r"), " ", $string);
    $string = trim(preg_replace("/\s+/", ' ', $string));
    $string = function_exists('mb_strtolower') ? mb_strtolower($string) : strtolower($string);

    $replaceData = [
      'а'=>'a', 'б'=>'b', 'в'=>'v',
      'г'=>'g', 'д'=>'d', 'е'=>'e',
      'ё'=>'e', 'ж'=>'j', 'з'=>'z',
      'и'=>'i', 'й'=>'y', 'к'=>'k',
      'л'=>'l', 'м'=>'m', 'н'=>'n',
      'о'=>'o', 'п'=>'p', 'р'=>'r',
      'с'=>'s', 'т'=>'t', 'у'=>'u',
      'ф'=>'f', 'х'=>'h', 'ц'=>'c',
      'ч'=>'ch','ш'=>'sh','щ'=>'shch',
      'ы'=>'y', 'э'=>'e', 'ю'=>'yu',
      'я'=>'ya','ъ'=> 'j','ь'=> "'"
    ];

    $eng = strtr($string, $replaceData);

    $replaceData = [
      'a'=>'а', 'b'=>'б', 'v'=>'в',
      'g'=>'г', 'd'=>'д',
      'e'=>'е', 'w'=>'в', 'z'=>'з',
      'i'=>'и', 'y'=>'й', 'k'=>'к',
      'l'=>'л', 'm'=>'м', 'n'=>'н',
      'o'=>'о', 'p'=>'п', 'r'=>'р',
      's'=>'с', 't'=>'т', 'u'=>'у',
      'f'=>'ф', 'h'=>'х', 'c'=>'ц',
      'ch'=>'ч','sh'=>'ш','shch'=>'щ',
      'yu'=>'ю',
      'ya'=>'я','j'=> 'ж',"'" => "ь"
    ];

    $rus = strtr($string, $replaceData);

    return [
      'ENG' => $eng,
      'RUS' => $rus
    ];
  }

  function translitKeyboardInvert(string $string) {
    $string = str_replace(array("\n", "\r"), " ", $string);
    $string = trim(preg_replace("/\s+/", ' ', $string));
    $string = function_exists('mb_strtolower') ? mb_strtolower($string) : strtolower($string);

    $replaceData = [
      'а'=>'f', 'б'=>',', 'в'=>'d',
      'г'=>'u', 'д'=>'l', 'е'=>'t',
      'ё'=>'t', 'ж'=>';', 'з'=>'p',
      'и'=>'b', 'й'=>'q', 'к'=>'r',
      'л'=>'k', 'м'=>'v', 'н'=>'y',
      'о'=>'j', 'п'=>'g', 'р'=>'h',
      'с'=>'c', 'т'=>'n', 'у'=>'e',
      'ф'=>'a', 'х'=>'[', 'ц'=>'w',
      'ч'=>'x', 'ш'=>'i', 'щ'=>'o',
      'ы'=>'s', 'э'=> "'", 'ю'=>'.',
      'я'=>'z', 'ъ'=>']', 'ь'=>'m'
    ];

    $eng = strtr($string, $replaceData);
    $replaceData = array_flip($replaceData);
    $rus = strtr($string, $replaceData);

    return [
      'ENG' => $eng,
      'RUS' => $rus
    ];
  }
