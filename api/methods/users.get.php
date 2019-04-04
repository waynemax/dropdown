<?
  require_once '../include.php';
  require_once './controllers/users.php';

  loadErrorsList('common');

  const MANDATORY_PARAMS = [];
  const OPTIONAL_PARAMS = [
    'id',
    'search',
    'domain',
    'offset',
    'count',
    'cursor_id',
    'fields'
  ];

  $errors = [];
  $data = [];

  $incomingOptions = checkInData("GET", MANDATORY_PARAMS, OPTIONAL_PARAMS);

  $users = new Users($incomingOptions);
  $result = $users->search(OPTIONAL_PARAMS);

  echo responseBuilder($errors, [
    'response' => coercionType($result)
  ]);