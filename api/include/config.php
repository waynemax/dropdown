<?
  $config = [];
  function getConfig(string $section) {
    global $config;
    if ($config && key_exists($section, $config)) {
      return $config[$section];
    }
    switch ($section) {
      case 'accesses':
        $configAdd = [
          'servers' => [
            'default' => [
              'DB_HOST'     => 'localhost',
              'DB_USERNAME' => base64_decode(),
              'DB_PASSWORD' => base64_decode(),
              'DB_TABLE'    => ''
            ]
          ]
        ];
        break;
      case 'common':
        $configAdd = [
          'domain' => '',
          'mainClientDomain' => ''
        ];
        break;
      default:
        return [];
        break;
    }
    $config[$section] = $configAdd;
    return $config[$section];
  }