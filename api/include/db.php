<?
  $connections = [];
  $dbConfig = getConfig('accesses');
  $servers = [
    'default' => $dbConfig['servers']['default']
  ];

  function connectAdd($server = 'default') {
    global $connections, $servers;

    if (!isset($connections[$server])) {
      $dbConfig = $servers[$server];
      $connections[$server]  = mysqli_connect(
        $dbConfig['DB_HOST'],
        $dbConfig['DB_USERNAME'],
        $dbConfig['DB_PASSWORD'],
        $dbConfig['DB_TABLE']
      );

      if (mysqli_connect_errno()) {
        die('Connecting to MySQL failed: '.mysqli_connect_error());
      }

      sqli_query('SET NAMES utf8mb4');
      sqli_query("SET CHARACTER SET 'utf8mb4'");
      sqli_query("SET SESSION collation_connection = 'utf8mb4_unicode_ci'");
    }
    return $connections[$server];
  }

  function sqli_query($query, $server = 'default') {
    $connection = connectAdd($server);
    $res = mysqli_query($connection, $query);
    if (!$res) {
      die("MySQL query failed: {$query} <br> ".mysqli_error($connection));
    }
    return $res;
  }

  function sqli_fetch($query, $multiple = false, $server = 'default') {
    $res = sqli_query($query, $server);
    if ($multiple) {
      $rows = array();
      while ($row = mysqli_fetch_assoc($res)) {
        $rows[] = $row;
      }
    } else {
      $rows = mysqli_fetch_assoc($res);
    }
    mysqli_free_result($res);
    return $rows;
  }

  function mysqli_insertID($server = 'default') {
    $connection = connectAdd($server);
    return $connection ? mysqli_insert_id($connection) : false;
  }

  function escape($string, $server = 'default') {
    $connection = connectAdd($server);
    return $connection ? mysqli_real_escape_string($connection, $string) : addslashes($string);
  }

  function closeConnection($server = 'default') {
    $connection = connectAdd($server);
    return $connection ? mysqli_close($connection) : false;
  }
