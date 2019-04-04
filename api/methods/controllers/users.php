<?
  class Users
  {
    const DEFAULT_LOAD_COUNT = 20;
    const DEFAULT_OFFSET = 0;
    const DEFAULT_MAX_LOAD_COUNT = 1000;

    public function __construct(array $options = []) {
      $this->options = [];
      foreach ($options as $k => $v) {
        $this->options[mb_strtolower($k)] = coercionType($v);
      }
    }

    public function search(array $allowOptions = []) {
      $summaryOptions = [];
      $query = [
        'where' => [1]
      ];

      foreach ($allowOptions as $option) {
        switch ($option) {
          case 'id':
            if (key_exists($option, $this->options)) {
              checkType($this->options[$option], 'integer', $option);
              $summaryOptions[$option]['value'] = (int) positive($this->options[$option]);
              $query['where'][$option] = " `id` = '".$summaryOptions[$option]['value']."' ";
            }
            break;
          case 'fields':
            $fields = [ 'id', 'first_name', 'last_name', 'helpful_info', 'photo_max_orig', 'full_name', 'domain' ];
            if (key_exists($option, $this->options)) {
              checkType($this->options[$option], 'string', $option);
              $summaryOptions[$option]['value'] = explode(',', escapeStr($this->options[$option]));

              if (count($summaryOptions[$option]['value']) > 0) {
                $responseFields = [];
                foreach ($summaryOptions[$option]['value'] as $field) {
                  if (in_array($field, $fields)) {
                    $responseFields[] = $field;
                  }
                }
              }

              if (count($responseFields) > 0) {
                $fields = $responseFields;
                if (!in_array('id', $responseFields)) {
                  $fields = array_merge(['id'], $fields);
                }
              }
            }
            break;
          case 'cursor_id':
            if (key_exists($option, $this->options)) {
              checkType($this->options[$option], 'integer', $option);
              $summaryOptions[$option]['value'] = (int) positive($this->options[$option]);
              $query['cursor_id'] = " &&  `id` > '".$summaryOptions[$option]['value']."' ";
              $query['whereFlag'] = true;
            }
            break;
          case 'search':
            if (key_exists($option, $this->options)) {
              checkType($this->options[$option], 'string', $option);
              $summaryOptions[$option]['value'] = (string) escapeStr($this->options[$option]);

              function getTranslitArray(string $value) {
                $translit1 = translit($value);
                $translit2 = translitKeyboardInvert($value);

                $translit3 = translit($translit2['RUS']);
                $translit4 = translit($translit2['ENG']);

                return (array) array_unique([
                  $translit1['RUS'], $translit1['ENG'],
                  $translit2['ENG'], $translit2['RUS'],
                  $translit3['ENG'], $translit3['RUS'],
                  $translit4['ENG'], $translit4['RUS']
                ]);
              }

              $searchStrings = getTranslitArray($summaryOptions[$option]['value']);
              $exp = explode(' ', $summaryOptions[$option]['value']);

              if (count($exp) == 2) {
                $searchStrings = array_merge($searchStrings, getTranslitArray($exp[1].' '.$exp[0]));
              }

              $likeQuery = [];
              foreach ($searchStrings as $str) {
                $likeQuery[] = " `full_name` LIKE '%".escapeStr($str)."%' ";
              }

              $query['where'][$option] = join(' OR ', $likeQuery)." OR `domain` LIKE '%".$summaryOptions[$option]['value']."%' ";
            }
            break;
          case 'offset':
            if (!key_exists($option, $this->options)) {
              $summaryOptions[$option]['value'] = $this::DEFAULT_OFFSET;
            } else {
              checkType($this->options[$option], 'integer', $option);
              $summaryOptions[$option]['value'] = (int) positive($this->options[$option]);
            }
            break;
          case 'count':
            if (!key_exists($option, $this->options)) {
              $summaryOptions[$option]['value'] = $this::DEFAULT_LOAD_COUNT;
            } else {
              checkType($this->options[$option], 'integer', $option);
              $summaryOptions[$option]['value'] = (int) limitInt($this->options[$option], $this::DEFAULT_MAX_LOAD_COUNT);
            }
            break;
        }
      }

      $countAllQuery = sqli_fetch("select count(id) from users;");
      $countAllResult = $countAllQuery ? (int) $countAllQuery['count(id)'] : 0;

      $query['whereJoin'] = $query['where'] || $query['whereFlag'] ? 'where (' . join(" && ", $query['where']) . ') '.$query['cursor_id'] : '';
      $countQueryStr = "select count(id) from users ".$query['whereJoin'];
      $countQuery = sqli_fetch($countQueryStr);
      $countResult = $countQuery ? (int) $countQuery['count(id)'] : 0;

      if ($countResult) {
        $query['full'] = "select " . join(', ', $fields) . " from users ".$query['whereJoin']." order by id limit ".$summaryOptions['offset']['value'].", ".$summaryOptions['count']['value'].";";
        $items = sqli_fetch($query['full'], true) ?? [];
      } else {
        $items = [];
      }

      $resItems = [];
      $resItems['count'] = count($items);

      if ($resItems['count'] > 0) {
        $idsItems = [];
        foreach ($items as $key => $value) {
          $idsItems[] = (int) $value['id'];
        }
        $resItems['cursor_id'] = max($idsItems);
        if (key_exists('cursor_id', $this->options)) {
          if ($resItems['count'] < $summaryOptions['count']['value']) {
            $resItems['hasNextPage'] = false;
          } else {
            $resItems['hasNextPage'] = true;
          }
        }
      }

      $resItems['data'] = $items;

      return [
        'allCounter' => $countAllResult,
        'counterSearchResults' => $countResult,
        'items' => $resItems
      ];
    }
  }
