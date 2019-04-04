<?
  $errorsList = [];
  function loadErrorsList(string $section) {
    global $errorsList;
    if ($errorsList && key_exists($section, $errorsList)) {
      return $errorsList[$section];
    }
    switch ($section) {
      case 'common':
        $errAdd = [
          'method_not_found' => ['methodNotFound', 'Method not found'],
          'file_not_found' => ['fileNotFound', 'File not found'],
          'need_fields' => ['fileNotFound', 'File not found'],
          'method_not_supported' => ['methodNotSupported', 'Method is not supported'],
          'permission_denied' => ['permissionDenied', 'Permission denied'],
          'need_auth' => ['needAuth', 'Authorization required'],
          'unknown_error' => ['unknownError', 'Unknown error'],
          "onlyPOST" => ["onlyPOST", "Only POST requests are supported"],
          "onlyGET" => ["onlyGET", "Only GET requests are supported"],
          "unknown_field" => ["unknownField", "unknown field"],
          "wrong_type" => ["wrongType", "Transferred wrong type"],
        ];
        break;
      default:
        return [];
        break;
    }
    $errorsList[$section] = $errAdd;
    return $errorsList[$section];
  }